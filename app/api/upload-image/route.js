import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

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
const PUBLIC_URL = process.env.CF_R2_PUBLIC_URL;

// Compress with sharp → convert to WebP (best size/quality ratio for product images)
async function compressImage(buffer, mimeType) {
  if (mimeType === 'image/gif') {
    // GIF: skip compression, keep original
    return { buffer, ext: 'gif', contentType: 'image/gif' };
  }

  const compressed = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true }) // cap at 1200px wide, never upscale
    .webp({ quality: 82 })                             // WebP q82 — near-lossless, ~60% smaller than JPEG
    .toBuffer();

  return { buffer: compressed, ext: 'webp', contentType: 'image/webp' };
}
import { composeDecorators, rateLimit, validateFileSize } from '../../../lib/decorators/index';
import { wrapContractRoute } from '../../../lib/contract-validator';
import { API_CACHE_HEADERS } from '../../../lib/api-helpers';

export const POST = wrapContractRoute(
  composeDecorators(
    rateLimit(20, 60000),
    validateFileSize(10 * 1024 * 1024)
  )(async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, {status: 400, headers: API_CACHE_HEADERS });
    }

    const originalExt = file.name.split('.').pop().toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowed.includes(originalExt)) {
      return NextResponse.json({ error: 'File type not allowed' }, {status: 400, headers: API_CACHE_HEADERS });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Compress and convert to WebP (except GIF)
    const { buffer, ext, contentType } = await compressImage(rawBuffer, file.type);

    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
      })
    );

    const publicUrl = `${PUBLIC_URL}/${fileName}`;

    // Return URL + compression stats for frontend feedback
    return NextResponse.json({
      url: publicUrl,
      originalSize: rawBuffer.length,
      compressedSize: buffer.length,
      savings: Math.round((1 - buffer.length / rawBuffer.length) * 100),
    });
  } catch (err) {
    console.error('R2 upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, {status: 500, headers: API_CACHE_HEADERS });
  }
  }),
  'upload-image:POST'
);
