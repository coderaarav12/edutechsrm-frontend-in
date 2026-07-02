import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
});

const page = await browser.newPage();
const allRequests = [];

page.on('request', (req) => {
  if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
    allRequests.push({ method: req.method(), url: req.url() });
  }
});

page.on('response', async (res) => {
  if (res.request().resourceType() === 'xhr' || res.request().resourceType() === 'fetch') {
    if (res.url().includes('api')) {
      try {
        const text = await res.text();
        console.log(`\n=== API: ${res.url()} ===`);
        console.log(text.slice(0, 500));
      } catch (e) {}
    }
  }
});

await page.goto('https://thehelpers.vercel.app/semesters/3/subjects/Advanced%20Programming%20Practice', { waitUntil: 'domcontentloaded', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

console.log('\n=== ALL XHR/FETCH REQUESTS ===');
allRequests.forEach(r => console.log(`${r.method} ${r.url}`));

await browser.close();
