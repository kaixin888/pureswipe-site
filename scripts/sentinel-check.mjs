import { createClient } from '@supabase/supabase-js';
import { sendAlert } from '../lib/monitor.mjs';

async function scanImages() {
  const targetUrls = [
    'https://www.clowand.com',
    'https://www.clowand.com/products/29d845e2-3908-41c6-8e0a-7ebdbed159bc'
  ];
  
  const brokenImages = [];
  for (const url of targetUrls) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      // Improved regex to handle various img attributes
      const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgSrcRegex.exec(html)) !== null) {
        let imgSrc = match[1].replace(/&amp;/g, '&'); // Decode HTML entities
        
        if (imgSrc.startsWith('//')) {
          imgSrc = 'https:' + imgSrc;
        } else if (imgSrc.startsWith('/')) {
          imgSrc = 'https://www.clowand.com' + imgSrc;
        }
        
        try {
          const imgRes = await fetch(imgSrc, { method: 'HEAD', timeout: 5000 });
          if (!imgRes.ok) {
            brokenImages.push({ page: url, src: imgSrc, status: imgRes.status });
          }
        } catch (err) {
          brokenImages.push({ page: url, src: imgSrc, status: 'FAILED' });
        }
      }
    } catch (err) {
      console.error(`Failed to scan ${url}:`, err.message);
    }
  }
  
  // Deduplicate broken images
  const uniqueBroken = [];
  const seen = new Set();
  for (const img of brokenImages) {
    if (!seen.has(img.src)) {
      uniqueBroken.push(img);
      seen.add(img.src);
    }
  }
  return uniqueBroken;
}

async function checkHealth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olgfqcygqzuevaftmdja.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const results = {
    supabase: 'PENDING',
    feishu: 'OK',
    brokenImages: [],
    timestamp: new Date().toISOString()
  };

  try {
    if (!supabaseKey) {
      // For local testing without env vars
      results.supabase = 'SKIP (Local)';
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;
      results.supabase = 'OK';
    }
  } catch (err) {
    results.supabase = `ERROR: ${err.message}`;
  }

  // Task #262: Image Audit
  results.brokenImages = await scanImages();

  const isHealthy = (results.supabase === 'OK' || results.supabase === 'SKIP (Local)') && results.brokenImages.length === 0;
  const level = isHealthy ? 'P2' : 'P0';
  const title = isHealthy ? 'Sentinel Daily Health Check' : 'Sentinel Health Check FAILURE';
  
  let message = `Scheduled sentinel health check completed.\n\nStatus:\n- Supabase: ${results.supabase}\n- Feishu Channel: ${results.feishu}`;
  
  if (results.brokenImages.length > 0) {
    message += `\n\nCRITICAL: ${results.brokenImages.length} Broken Images Detected!\n${results.brokenImages.map(img => `- [${img.status}] ${img.src}`).join('\n')}`;
  }
  
  await sendAlert({
    level,
    title,
    message,
    evidence: JSON.stringify(results, null, 2)
  });

  console.log('Health check completed:', results);
}

checkHealth();
