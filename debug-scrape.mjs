import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

// Intercept all requests to find Google Drive links
const capturedUrls = new Set();
page.on('request', req => {
  if (req.url().includes('drive.google') || req.url().includes('docs.google') || req.url().includes('cloudinary')) {
    capturedUrls.add(req.url());
    console.log('Captured:', req.url());
  }
});

await page.goto('https://thehelpers.vercel.app/semesters/3/subjects/Data%20Structures%20And%20Algorithm', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise(r => setTimeout(r, 5000));

// Try to extract URLs from React fiber props
const fiberData = await page.evaluate(() => {
  const buttons = document.querySelectorAll('li button');
  const results = [];
  for (const btn of buttons) {
    // Find React fiber key
    const fiberKey = Object.keys(btn).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'));
    if (fiberKey) {
      const fiber = btn[fiberKey];
      // Navigate fiber tree to find props
      let node = fiber;
      while (node) {
        if (node.pendingProps?.href || node.pendingProps?.onClick || node.memoizedProps?.href) {
          results.push({
            href: node.pendingProps?.href || node.memoizedProps?.href,
            hasOnClick: !!node.pendingProps?.onClick,
          });
          break;
        }
        node = node.return;
      }
      // Also check direct props
      if (btn.__reactProps) {
        results.push({ directProps: btn.__reactProps });
      }
    }
    if (results.length >= 3) break;
  }
  return results;
});

console.log('Fiber data:', JSON.stringify(fiberData, null, 2));

// Try clicking with page.waitForNavigation
console.log('\n--- Trying click approach ---');
const buttons = await page.$$('li button');
console.log(`Found ${buttons.length} resource buttons`);

if (buttons.length > 0) {
  // Click and capture via request interception
  await buttons[0].click();
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Captured URLs:', [...capturedUrls]);
  
  // Check all pages
  const pages = await browser.pages();
  for (const p of pages) {
    console.log('Page URL:', p.url());
  }
}

await browser.close();
