import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

const BASE = 'https://thehelpers.tech';

async function scrapeSubject(page, url, sem, name) {
  const captured = [];

  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('/api/secure-viewer')) {
      try {
        const urlParam = new URL(u).searchParams.get('url');
        if (urlParam) captured.push(decodeURIComponent(urlParam));
      } catch {}
    }
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));

    const items = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('.rounded-lg');
      for (const card of cards) {
        const heading = card.querySelector('h3')?.textContent?.trim() || '';
        const lis = card.querySelectorAll('li');
        for (const li of lis) {
          const span = li.querySelector('span');
          const btn = li.querySelector('button');
          if (span && btn) {
            results.push({ title: span.textContent.trim(), section: heading });
          }
        }
      }
      return results;
    });

    const buttons = await page.$$('li button');
    for (let i = 0; i < buttons.length; i++) {
      try {
        await buttons[i].click();
        await new Promise(r => setTimeout(r, 1000));
      } catch {}
    }

    await new Promise(r => setTimeout(r, 3000));

    const notes = [];
    const pyqs = [];

    for (let i = 0; i < items.length && i < captured.length; i++) {
      const entry = { title: items[i].title, url: captured[i] };
      if (items[i].section.toLowerCase().includes('note')) notes.push(entry);
      else pyqs.push(entry);
    }

    return { notes, pyqs };
  } catch (e) {
    return { notes: [], pyqs: [] };
  }
}

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  // Block heavy resources on all pages
  const blockPage = await browser.newPage();
  await blockPage.setRequestInterception(true);
  blockPage.on('request', (req) => {
    if (['image', 'font', 'media'].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  const allSubjects = [];

  for (let sem = 1; sem <= 8; sem++) {
    console.log(`\n=== Semester ${sem} ===`);
    let subjects = [];

    try {
      await blockPage.goto(`${BASE}/semesters/${sem}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(r => setTimeout(r, 5000));

      subjects = await blockPage.evaluate(() => {
        const links = document.querySelectorAll('a');
        const subs = [];
        for (const a of links) {
          const href = a.getAttribute('href');
          if (href && href.startsWith(`/semesters/`) && href.includes('/subjects/')) {
            const name = a.textContent?.trim();
            if (name && !subs.some(s => s.name === name)) {
              subs.push({ name, url: `https://thehelpers.tech${href}` });
            }
          }
        }
        return subs;
      });
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }

    if (subjects.length === 0) {
      console.log(`  No subjects found`);
      allSubjects.push({ semester: sem, subjects: [] });
      continue;
    }

    console.log(`  Found ${subjects.length} subjects`);

    const semResults = [];
    for (const subj of subjects) {
      process.stdout.write(`  ${subj.name}...`);
      const data = await scrapeSubject(await browser.newPage(), subj.url, sem, subj.name);
      semResults.push({ name: subj.name, ...data });
      console.log(` ${data.notes.length}n ${data.pyqs.length}pyq`);
    }

    allSubjects.push({ semester: sem, subjects: semResults });
  }

  await blockPage.close();
  await browser.close();

  writeFileSync('scraped-notes.json', JSON.stringify(allSubjects, null, 2));

  const totalNotes = allSubjects.reduce((s, sem) => s + sem.subjects.reduce((ss, sub) => ss + sub.notes.length, 0), 0);
  const totalPyqs = allSubjects.reduce((s, sem) => s + sem.subjects.reduce((ss, sub) => ss + sub.pyqs.length, 0), 0);
  const totalSubs = allSubjects.reduce((s, sem) => s + sem.subjects.length, 0);
  console.log(`\n✓ Done! ${totalNotes} notes, ${totalPyqs} PYQs across ${totalSubs} subjects.`);
}

main().catch(console.error);
