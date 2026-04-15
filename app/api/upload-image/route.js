import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

// Cloudflare R2 — S3-compatible endpoint
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = 'clowand-images';
const PUBLIC_URL = process.env.CF_R2_PUBLIC_URL; // https://pub-xxx.r2.dev

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000',
      })
    );

    const publicUrl = `${PUBLIC_URL}/${fileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('R2 upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
