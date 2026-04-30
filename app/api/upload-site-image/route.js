// 上传站点图片 — 按插槽尺寸精确裁剪
// POST /api/upload-site-image
// FormData: slot_key (string) + file (Blob)
// 自动 sharp resize 到插槽标定的 w×h（exact fill），转 WebP q82，存 R2 site-images/{slot_key}.webp

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Reuse existing R2 credentials (same CF_R2_* vars as /api/upload-image)
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = 'clowand-images';
const PUBLIC_URL = process.env.CF_R2_PUBLIC_URL || 'https://pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const slotKey = formData.get('slot_key');
    const file = formData.get('file');

    if (!slotKey || !file) {
      return NextResponse.json({ error: 'slot_key 和 file 为必填' }, { status: 400 });
    }

    // 从 Supabase 读取插槽尺寸
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: slot, error: slotError } = await supabase
      .from('site_images')
      .select('slot_key, label, width, height')
      .eq('slot_key', slotKey)
      .single();

    if (slotError || !slot) {
      return NextResponse.json({ error: `插槽 "${slotKey}" 不存在` }, { status: 404 });
    }

    const { width, height } = slot;

    // 验证文件类型
    const originalExt = file.name.split('.').pop().toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowed.includes(originalExt)) {
      return NextResponse.json({ error: '不支持的文件类型，仅允许 jpg/png/webp/gif' }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // 精确裁剪到 w×h，居中填充，转 WebP q82
    const resized = await sharp(rawBuffer)
      .resize({
        width,
        height,
        fit: 'fill',          // 强制精确尺寸（拉伸/裁剪到目标尺寸）
        position: 'center',   // 居中对齐
      })
      .webp({ quality: 82 })
      .toBuffer();

    const remoteKey = `site-images/${slotKey}.webp`;

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: remoteKey,
        Body: resized,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000',
      })
    );

    const publicUrl = `${PUBLIC_URL}/${remoteKey}`;

    // 更新数据库中的 image_url
    const { error: updateError } = await supabase
      .from('site_images')
      .update({ image_url: publicUrl })
      .eq('slot_key', slotKey);

    if (updateError) {
      console.error('DB update error:', updateError.message);
    }

    return NextResponse.json({
      url: publicUrl,
      slot_key: slotKey,
      originalSize: rawBuffer.length,
      compressedSize: resized.length,
      savings: Math.round((1 - resized.length / rawBuffer.length) * 100),
      dimensions: `${width}x${height}`,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
