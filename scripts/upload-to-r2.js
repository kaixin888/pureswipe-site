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
    CacheControl: 'public, max-age=31536000',
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
  const localImage = path.join(process.cwd(), 'public/images/home-promo-1.jpg');
  const remoteKey = `reviews/buyer-show-${Date.now()}.jpg`;
  
  try {
    const r2Url = await uploadFile(localImage, remoteKey);
    
    // Now update Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient('https://olgfqcygqzuevaftmdja.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');
    
    const { data, error } = await supabase
      .from('reviews')
      .update({ image_url: r2Url })
      .eq('author_name', 'Sarah M.')
      .select();

    if (error) {
      console.error('❌ Error updating Supabase:', error.message);
    } else {
      console.log('✅ Updated Supabase review image URL:', data[0].image_url);
    }
  } catch (err) {
    console.error('Task failed:', err.message);
  }
}

run();
