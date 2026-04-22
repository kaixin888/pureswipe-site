const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

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

const supabase = createClient('https://olgfqcygqzuevaftmdja.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY');

async function uploadFromUrl(url, remoteKey) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: remoteKey,
    Body: response.data,
    ContentType: 'image/jpeg',
  });
  await r2.send(command);
  return `${PUBLIC_URL}/${remoteKey}`;
}

async function run() {
  const amazonImages = [
    "https://m.media-amazon.com/images/I/41PtXXdyndL.jpg",
    "https://m.media-amazon.com/images/I/41mrOqiBAqL.jpg",
    "https://m.media-amazon.com/images/I/31DoRLrThvL.jpg",
    "https://m.media-amazon.com/images/I/31vW92SG49L.jpg",
    "https://m.media-amazon.com/images/I/31f-bvkg7RL.jpg"
  ];

  const { data: reviews } = await supabase.from('reviews').select('id').limit(5);
  
  for (let i = 0; i < reviews.length; i++) {
    const r2Url = await uploadFromUrl(amazonImages[i], `reviews/amazon-ugc-${i+1}.jpg`);
    await supabase.from('reviews').update({ ugc_image_url: r2Url }).eq('id', reviews[i].id);
    console.log(`✅ Updated review ${reviews[i].id} with ${r2Url}`);
  }
}

run();
