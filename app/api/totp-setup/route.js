// TOTP 设置 API — 生成密钥 + 验证并启用
import { createClient } from '@supabase/supabase-js';
import { generateSecret as genSecret, generateURI, verify as verifyToken } from 'otplib';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg5NDcxNywiZXhwIjoyMDkxNDcwNzE3fQ.RDr_UBLAR1bjxRa1pbq7SIeFeUUbMtSu_FwJ6tkIaJY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 生成密钥 + otpauth URL
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    if (!userId) return Response.json({ error: 'missing user_id' }, { status: 400 });

    const secret = genSecret();
    const otpauth = generateURI({ issuer: 'clowand', label: userId, secret });

    // 生成 backup codes
    const backupCodes = Array.from({ length: 8 }, () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    });

    // 存入 DB (upsert)
    const { error } = await supabase.from('authenticator_secrets').upsert({
      user_id: userId,
      secret,
      backup_codes: backupCodes,
      enabled: false,
    }, { onConflict: 'user_id' });

    if (error) throw error;

    return Response.json({ secret, otpauth, backup_codes: backupCodes });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// 验证 token 并启用
export async function POST(req) {
  try {
    const { user_id, token } = await req.json();
    if (!user_id || !token) return Response.json({ ok: false, error: 'Missing params' }, { status: 400 });

    const { data, error } = await supabase
      .from('authenticator_secrets')
      .select('secret')
      .eq('user_id', user_id)
      .single();

    if (error || !data) return Response.json({ ok: false, error: 'No TOTP secret found' }, { status: 400 });

    const isValid = verifyToken({ token, secret: data.secret });

    if (!isValid) return Response.json({ ok: false, error: 'Invalid code' });

    // 启用 2FA
    await supabase.from('authenticator_secrets').update({ enabled: true }).eq('user_id', user_id);
    await supabase.from('user_profiles').update({ totp_enabled: true }).eq('user_id', user_id);

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
