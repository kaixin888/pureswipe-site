const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Test local build or production?
  // We'll test localhost:3000 assuming the user/agent can run it locally first.
  const url = process.argv[2] || 'http://localhost:3000';
  
  console.log(`Starting Layout Math Audit on: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for React hydration
    await page.waitForTimeout(2000);

    const typographyResults = await page.evaluate(() => {
      // Find all H1, H2, H3 and elements with "italic" class
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, .italic'));
      return elements.map(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        return {
          tag: el.tagName,
          text: el.innerText.substring(0, 30),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          overflowVisible: style.overflow === 'visible',
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom,
          isTruncated: el.scrollHeight > el.clientHeight && style.overflow !== 'visible'
        };
      });
    });

    console.log('\n--- Typography Math Audit Report ---');
    let failures = 0;
    
    typographyResults.forEach(res => {
      const status = res.isTruncated ? '❌ [TRUNCATED]' : '✅ [SAFE]';
      if (res.isTruncated) failures++;
      
      console.log(`${status} ${res.tag} | SH: ${res.scrollHeight}px | CH: ${res.clientHeight}px | Overflow: ${res.overflowVisible ? 'visible' : 'hidden'} | Text: "${res.text}..."`);
    });

    if (failures > 0) {
      console.error(`\nAudit FAILED: ${failures} elements are truncated.`);
      process.exit(1);
    } else {
      console.log('\nAudit PASSED: All typography elements are visible.');
      process.exit(0);
    }

  } catch (error) {
    console.error('Audit Error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
