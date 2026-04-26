import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { sendAlert } from '../lib/monitor.mjs';

async function scanImages() {
  const targetUrls = [
    'https://www.clowand.com',
    'https://www.clowand.com/products/29d845e2-3908-41c6-8e0a-7ebdbed159bc',
    'https://www.clowand.com/blog/toilet-hygiene-families-protecting-kids-bathroom-bacteria'
  ];

  console.log('Starting Image Link Audit...');
  
  const brokenImages = [];

  for (const url of targetUrls) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Basic regex to find img src
      const imgSrcRegex = /<img[^>]+src="([^">]+)"/g;
      let match;
      const images = [];
      
      while ((match = imgSrcRegex.exec(html)) !== null) {
        let imgSrc = match[1];
        if (imgSrc.startsWith('/')) {
          imgSrc = 'https://www.clowand.com' + imgSrc;
        }
        images.push(imgSrc);
      }

      // Check each image
      for (const imgSrc of [...new Set(images)]) {
        try {
          const imgRes = await fetch(imgSrc, { method: 'HEAD', timeout: 5000 });
          if (!imgRes.ok) {
            brokenImages.push({ page: url, src: imgSrc, status: imgRes.status });
          }
        } catch (err) {
          brokenImages.push({ page: url, src: imgSrc, status: 'TIMEOUT/ERROR' });
        }
      }
    } catch (err) {
      console.error(`Failed to scan ${url}:`, err.message);
    }
  }

  if (brokenImages.length > 0) {
    console.log('Broken images detected!', brokenImages);
    await sendAlert({
      level: 'P0',
      title: 'CRITICAL: Broken Images Detected on Clowand',
      message: `The automated sentinel has detected ${brokenImages.length} broken images across the site.\n\nSummary:\n${brokenImages.map(img => `- [${img.status}] ${img.src} on ${img.page}`).join('\n')}`,
      evidence: JSON.stringify(brokenImages, null, 2)
    });
  } else {
    console.log('All images are loading correctly.');
  }
}

scanImages();
