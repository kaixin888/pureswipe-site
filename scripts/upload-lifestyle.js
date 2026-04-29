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

// Normalize: maps r2.dev raw domain to media.clowand.com
function normalizeUrl(url) {
  return url.replace('pub-f3f9229828ae4b6691d29db0006ca32e.r2.dev', 'media.clowand.com');
}

async function uploadFile(localPath, remoteKey, contentType = 'image/jpeg') {
  const fileBuffer = fs.readFileSync(localPath);
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: remoteKey,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  });

  try {
    await r2.send(command);
    const rawUrl = `${PUBLIC_URL}/${remoteKey}`;
    const publicUrl = normalizeUrl(rawUrl);
    console.log(`✅ Uploaded: ${localPath} -> ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error(`❌ Error uploading ${localPath}:`, err.message);
    throw err;
  }
}

async function run() {
  const lifestyleDir = path.join(process.cwd(), 'public/images/lifestyle');
  const images = [
    { local: 'bathroom-caddy.jpg', key: 'lifestyle/bathroom-caddy.jpg', contentType: 'image/jpeg' },
    { local: 'action-cleaning.jpg', key: 'lifestyle/action-cleaning.jpg', contentType: 'image/jpeg' },
    { local: 'accessories-flatlay.jpg', key: 'lifestyle/accessories-flatlay.jpg', contentType: 'image/jpeg' },
  ];

  const urls = {};
  for (const img of images) {
    const localPath = path.join(lifestyleDir, img.local);
    const url = await uploadFile(localPath, img.key, img.contentType);
    urls[img.local.replace('.jpg', '')] = url;
  }

  console.log('\n=== All uploaded URLs ===');
  for (const [name, url] of Object.entries(urls)) {
    console.log(`${name}: ${url}`);
  }

  // --- Now update Supabase ---
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://olgfqcygqzuevaftmdja.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
  );

  // 1. Update Auto Lid Kit product (d00dbb8b) - add lifestyle images to extra_images
  const { data: lidProduct, error: lidErr } = await supabase
    .from('products')
    .select('id, extra_images')
    .eq('id', 'd00dbb8b-c1fe-4996-9a69-736b1b6cfe5b')
    .single();

  if (lidErr) {
    console.error('❌ Error fetching Auto Lid Kit:', lidErr.message);
  } else {
    let extras = [];
    try { extras = JSON.parse(lidProduct.extra_images || '[]'); } catch {}
    // Add lifestyle images at the end
    extras.push(urls['bathroom-caddy']);
    extras.push(urls['action-cleaning']);
    extras.push(urls['accessories-flatlay']);

    const { error: updateErr } = await supabase
      .from('products')
      .update({ extra_images: JSON.stringify(extras) })
      .eq('id', 'd00dbb8b-c1fe-4996-9a69-736b1b6cfe5b');

    if (updateErr) {
      console.error('❌ Error updating Auto Lid Kit extra_images:', updateErr.message);
    } else {
      console.log('✅ Auto Lid Kit extra_images updated with lifestyle images');
    }
  }

  // 2. Update Starter Kit product (29d845e2) - add lifestyle images to extra_images
  const { data: startProduct, error: startErr } = await supabase
    .from('products')
    .select('id, extra_images')
    .eq('id', '29d845e2-3908-41c6-8e0a-7ebdbed159bc')
    .single();

  if (startErr) {
    console.error('❌ Error fetching Starter Kit:', startErr.message);
  } else {
    let extras = [];
    try { extras = JSON.parse(startProduct.extra_images || '[]'); } catch {}
    extras.push(urls['bathroom-caddy']);
    extras.push(urls['action-cleaning']);
    extras.push(urls['accessories-flatlay']);

    const { error: updateErr } = await supabase
      .from('products')
      .update({ extra_images: JSON.stringify(extras) })
      .eq('id', '29d845e2-3908-41c6-8e0a-7ebdbed159bc');

    if (updateErr) {
      console.error('❌ Error updating Starter Kit extra_images:', updateErr.message);
    } else {
      console.log('✅ Starter Kit extra_images updated with lifestyle images');
    }
  }

  // 3. Update blog cover images (Task #419)
  // Assign different lifestyle/unsplash images to the 12 recent posts
  const blogUpdates = [
    { slug: '5-common-mistakes-buying-disposable-toilet-brush', cover: urls['bathroom-caddy'] },
    { slug: 'best-bathroom-gift-idea-disposable-toilet-brush', cover: urls['accessories-flatlay'] },
    { slug: 'senior-friendly-disposable-toilet-brush', cover: urls['action-cleaning'] },
    { slug: 'what-causes-bathroom-odor-disposable-toilet-brush', cover: urls['bathroom-caddy'] },
    { slug: 'where-toilet-bacteria-hide', cover: urls['action-cleaning'] },
    { slug: 'flushable-vs-non-flushable-disposable-toilet-brush', cover: urls['accessories-flatlay'] },
    { slug: 'disposable-toilet-brush-vs-silicone', cover: urls['bathroom-caddy'] },
    { slug: 'clean-toilet-rim-dead-corners', cover: urls['action-cleaning'] },
    { slug: 'how-to-use-disposable-toilet-brush', cover: urls['action-cleaning'] },
    { slug: 'replace-store-disposable-toilet-brush-heads', cover: urls['accessories-flatlay'] },
    { slug: 'small-bathroom-disposable-toilet-brush', cover: urls['bathroom-caddy'] },
    { slug: 'spring-cleaning-disposable-toilet-brush', cover: urls['accessories-flatlay'] },
  ];

  let blogSuccess = 0;
  let blogFail = 0;
  for (const update of blogUpdates) {
    const { error } = await supabase
      .from('posts')
      .update({ cover_image: update.cover })
      .eq('slug', update.slug);

    if (error) {
      console.error(`❌ Blog update fail [${update.slug}]:`, error.message);
      blogFail++;
    } else {
      blogSuccess++;
    }
  }
  console.log(`\n📝 Blog covers updated: ${blogSuccess} success, ${blogFail} fail`);

  console.log('\n=== TASK COMPLETE ===');
}

run().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
