import { chromium } from 'playwright';

async function auditLayout(url) {
  console.log(`Auditing: ${url}`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const issues = await page.evaluate(() => {
      const results = [];
      
      // 1. Truncation Check
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
          if (el.scrollHeight > el.clientHeight + 1) { // +1 for subpixel rounding
            results.push({
              type: 'TRUNCATION',
              tag: el.tagName,
              id: el.id,
              class: el.className,
              text: el.innerText?.substring(0, 30),
              details: `scrollHeight(${el.scrollHeight}) > clientHeight(${el.clientHeight})`
            });
          }
        }
      });
      
      // 2. Broken Image Check
      document.querySelectorAll('img').forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
          results.push({
            type: 'BROKEN_IMAGE',
            src: img.src,
            details: 'naturalWidth is 0 or image not complete'
          });
        }
      });
      
      // 3. Contrast Check (Basic)
      // Check for black on black or white on white
      const getLuminance = (rgb) => {
        const [r, g, b] = rgb.match(/\d+/g).map(Number);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      
      document.querySelectorAll('h1, h2, h3, p, span, a').forEach(el => {
        const style = window.getComputedStyle(el);
        const bgStyle = window.getComputedStyle(el.parentElement);
        const color = style.color;
        const bgColor = bgStyle.backgroundColor;
        
        if (color && bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          const lum1 = getLuminance(color);
          const lum2 = getLuminance(bgColor);
          const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
          if (ratio < 4.5) {
            results.push({
              type: 'CONTRAST_RATIO',
              tag: el.tagName,
              text: el.innerText?.substring(0, 30),
              ratio: ratio.toFixed(2),
              details: `Contrast ratio ${ratio.toFixed(2)} is below 4.5:1`
            });
          }
        }
      });
      
      return results;
    });
    
    if (issues.length > 0) {
      console.error('LAYOUT AUDIT FAILED:');
      console.table(issues);
      process.exit(1);
    } else {
      console.log('LAYOUT AUDIT PASSED ✅');
    }
    
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

const targetUrl = process.argv[2] || 'http://localhost:3000';
auditLayout(targetUrl);
