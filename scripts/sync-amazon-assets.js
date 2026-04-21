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

async function uploadFile(localPath, remoteKey) {
  const fileBuffer = fs.readFileSync(localPath);
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: remoteKey,
    Body: fileBuffer,
    ContentType: 'image/jpeg',
  });

  try {
    await r2.send(command);
    const url = `${PUBLIC_URL}/${remoteKey}`;
    console.log(`✅ Uploaded ${localPath} to ${url}`);
    return url;
  } catch (err) {
    console.error(`❌ Error uploading ${localPath}:`, err.message);
    throw err;
  }
}

async function run() {
  const assets = [
    { local: 'public/images/products/starter-kit-main.jpg', remote: 'products/starter-kit-main.jpg' },
    { local: 'public/images/products/auto-lid-main.jpg', remote: 'products/auto-lid-main.jpg' },
  ];

  const results = {};
  for (const asset of assets) {
    const url = await uploadFile(path.join(process.cwd(), asset.local), asset.remote);
    results[asset.remote] = url;
  }

  // Update Supabase
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient('https://olgfqcygqzuevaftmdja.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

  // Update Wand Starter Kit (ASIN B0GJZBRMG3 or similar ID)
  // I need to find the correct product row.
  const { data: products } = await supabase.from('products').select('id, name');
  
  for (const p of products) {
    if (p.name.toLowerCase().includes('starter') || p.id === '29d845e2-3908-41c6-8e0a-7ebdbed159bc') {
       await supabase.from('products').update({ image_url: results['products/starter-kit-main.jpg'] }).eq('id', p.id);
       console.log(`Updated ${p.name} with Starter Kit image.`);
    } else if (p.name.toLowerCase().includes('auto') || p.name.toLowerCase().includes('lid')) {
       await supabase.from('products').update({ image_url: results['products/auto-lid-main.jpg'] }).eq('id', p.id);
       console.log(`Updated ${p.name} with Auto Lid image.`);
    }
  }
}

run();
