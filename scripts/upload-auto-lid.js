// 上传 Auto-Lid Bundle 产品图到 R2
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const r2 = new S3Client({
  region: 'auto',
  endpoint: 'https://815cda625ddb970b925d0a2c77fc2309.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'cd8bce93fd8165f8d04da37ed1615164',
    secretAccessKey: 'b7a62e14db5efd56e82cb65daf499207bab0241aa7831edc62e5327d6a4b5922',
  },
});
const BUCKET = 'clowand-images';
const PUBLIC_URL = 'https://pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev';

async function main() {
  const localPath = path.join(__dirname, '..', 'public', 'auto-lid-temp.png');
  const buf = fs.readFileSync(localPath);
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'products/bundle-auto-lid.png',
    Body: buf,
    ContentType: 'image/png',
    CacheControl: 'public, max-age=31536000',
  });
  await r2.send(cmd);
  const url = PUBLIC_URL + '/products/bundle-auto-lid.png';
  console.log('UPLOADED:', url);
  return url;
}

main().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
