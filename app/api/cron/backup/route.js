import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { exportSupabase } from '../../../../lib/pg-export';
import { encrypt, packEncrypted } from '../../../../lib/crypto-aes-gcm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { API_CACHE_HEADERS } from '../../../../lib/api-helpers';

// ── Config ─────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_DIRECT_URL
  || process.env.DATABASE_URL
  || (() => {
    const ref = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co';
    const m = ref.match(/https:\/\/(.+)\.supabase\.co/);
    return m ? `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}@db.${m[1]}:5432/postgres` : '';
  })();

const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY; // 64-char hex
const R2_ENDPOINT    = process.env.R2_ENDPOINT;             // e.g. https://xxx.r2.cloudflarestorage.com
const R2_ACCESS_KEY  = process.env.R2_BACKUPS_ACCESS_KEY_ID;
const R2_SECRET_KEY  = process.env.R2_BACKUPS_SECRET_ACCESS_KEY;
const R2_BUCKET     = process.env.R2_BACKUPS_BUCKET;
const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK_URL;

// ── R2 Client ─────────────────────────────────────────────────────────────────
const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function notifyFeishu(text) {
  if (!FEISHU_WEBHOOK) return;
  try {
    await fetch(FEISHU_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg_type: 'text', content: { text } }),
    });
  } catch {
    // swallow — webhook failure must never block the backup
  }
}

function generateObjectKey(timestamp) {
  const d  = timestamp || new Date();
  const y  = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  const h  = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `backups/${y}/${mo}/${da}/clowand-${y}${mo}${da}T${h}${mi}${ss}.sql.enc`;
}

// ── Main handler ───────────────────────────────────────────────────────────────
export async function GET(request) {
  // ① Auth
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const start = Date.now();
  const ts    = new Date();
  const stamp = ts.toISOString().replace('T', ' ').slice(0, 16);

  let status   = 'ok';
  let errorMsg = null;
  let sizeKb   = 0;
  let key      = null;

  try {
    // ② Export DB → SQL plaintext
    const schemas = (process.env.BACKUP_SCHEMAS || 'public,auth').split(',').map(s => s.trim());
    const sql     = await exportSupabase({ url: SUPABASE_URL, schemas });
    const plaintext = Buffer.from(sql, 'utf8');
    sizeKb = Math.round(plaintext.byteLength / 1024);

    // ③ Encrypt
    if (!ENCRYPTION_KEY) throw new Error('BACKUP_ENCRYPTION_KEY env var is not set');
    const encrypted = packEncrypted(encrypt(plaintext, ENCRYPTION_KEY));

    // ④ Upload to R2
    if (!R2_ENDPOINT || !R2_BUCKET) throw new Error('R2 endpoint/bucket env vars not configured');
    key = generateObjectKey(ts);

    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: encrypted,
      ContentType: 'application/octet-stream',
      Metadata: {
        'original-size-kb': String(sizeKb),
        'backup-date':      ts.toISOString(),
        'schemas':          schemas.join(','),
      },
    }));

  } catch (err) {
    status   = 'error';
    errorMsg = err.message;
  }

  const elapsedMs = Date.now() - start;

  // ⑤ Feishu notification (always, on error too)
  const icon = status === 'ok' ? '💾' : '⚠️';
  const msg = [
    `${icon} [DB Backup] ${stamp} UTC`,
    `Status: ${status}`,
    status === 'ok'
      ? `Size: ${sizeKb} KB → R2 (${key?.split('/').slice(-1)[0]})`
      : `Error: ${errorMsg}`,
    `Duration: ${elapsedMs}ms`,
  ].join('\n');

  await notifyFeishu(msg);

  if (status === 'error') {
    return NextResponse.json({ status, error: errorMsg }, {status: 500, headers: API_CACHE_HEADERS });
  }

  return NextResponse.json({
    status: 'ok',
    key,
    originalSizeKb: sizeKb,
    durationMs: elapsedMs,
  }, { headers: API_CACHE_HEADERS });
}