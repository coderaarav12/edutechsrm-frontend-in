import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

const BASE = 'https://thehelpers.vercel.app';

const SEMESTERS = {
  1: ['Calculus And Linear Algebra', 'Chemistry', 'Philosophy Of Engineering', 'Introduction To Computational Biology', 'Programming For Problem Solving', 'Fundamental Of Economics (FOE)', 'Biomedical Sensors', 'Foreign Languages', 'Cell Biology', 'Microbiology', 'Physical And Analytical Chemistry', 'Biochemistry', 'Basic Civil & Mechanical Workshop'],
  2: ['Advanced Calculus And Complex Analysis', 'Electrical And Electronics Engineering', 'Semiconductor Physics And Computational Methods', 'Physics-Mechanics', 'Object Oriented Design And Programming', 'Communicative English', 'Electromagnetic Physics', 'Engineering Mechanics', 'Electronic System And PCB Design'],
  3: ['Data Structures And Algorithm', 'Computer Organization And Architecture', 'Operating Systems', 'Transforms And Boundary Value Problems', 'Advanced Programming Practice', 'Design Thinking And Methodology', 'Digital Logic Design', 'Solid State Devices', 'Biochemistry', 'Electromagnetic Thoery And Interference', 'Basic Chemical Engineering', 'Bioprocess Principles', 'Genetics And Cytogenetics', 'Microbiology', 'Social Engineering', 'Numerical Methods & Analysis', 'Foundation of Data Science (FDS)'],
  4: ['Design And Analysis Of Algorithms', 'Database Management Systems', 'Artificial Intelligence', 'Probability And Queueing Theory', 'Social Engineering', 'Bioprocess Engineering', 'Cell Communication And Signaling', 'Software Process', 'Chemical Engineering Principles', 'Molecular Biology', 'Internet Of Things (IOT)'],
  5: ['Discrete Mathematics', 'Full Stack Web Development', 'Formal Language And Automata', 'Computer Networks', 'Machine Learning', 'Professional Elective 2', 'Open Elective 1', 'Community Connect'],
  6: ['Data Science', 'Software Engineering And Project Management', 'Compiler Design', 'Professional Elective 3', 'Professional Elective 4', 'Open Elective 2', 'Project & MOOC', 'Natural Language Processing'],
  7: ['Behavioral Psychology', 'Professional Elective 5', 'Professional Elective 6', 'Professional Elective 7', 'Professional Elective 8', 'Open Elective 3'],
  8: ['Major Project', 'Internship'],
};

const allSubjects = [];
for (const [semStr, subjects] of Object.entries(SEMESTERS)) {
  const sem = parseInt(semStr);
  for (const name of subjects) {
    allSubjects.push({ sem, name, url: `${BASE}/semesters/${sem}/subjects/${encodeURIComponent(name)}` });
  }
}

async function scrapeSubject(browser, url, sem, name) {
  const page = await browser.newPage();
  
  // Capture secure-viewer request URLs
  const capturedRequests = [];
  
  await page.setRequestInterception(false);
  page.on('request', (req) => {
    if (req.url().includes('/api/secure-viewer')) {
      try {
        const urlParam = new URL(req.url()).searchParams.get('url');
        if (urlParam) {
          capturedRequests.push(decodeURIComponent(urlParam));
        }
      } catch (e) {}
    }
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Get all resource items
    const items = await page.evaluate(() => {
      const allLis = document.querySelectorAll('li');
      const results = [];
      for (const li of allLis) {
        const span = li.querySelector('span.text-muted-foreground');
        const btn = li.querySelector('button');
        if (span && btn) {
          const parentCard = btn.closest('.rounded-lg')?.querySelector('h3')?.textContent || '';
          results.push({ title: span.textContent.trim(), section: parentCard });
        }
      }
      return results;
    });

    // Click each button and wait for request to fire
    const buttons = await page.$$('li button');
    for (let i = 0; i < buttons.length; i++) {
      try {
        await buttons[i].click();
        await new Promise(r => setTimeout(r, 800));
      } catch (e) {}
    }

    // Build results mapping captured URLs to items
    const notes = [];
    const pyqs = [];
    
    for (let i = 0; i < items.length && i < capturedRequests.length; i++) {
      const item = items[i];
      const entry = { title: item.title, url: capturedRequests[i] };
      if (item.section.includes('Note')) notes.push(entry);
      else pyqs.push(entry);
    }

    console.log(`  ✓ Sem ${sem}: ${name} (${notes.length} notes, ${pyqs.length} pyqs, ${capturedRequests.length} captured)`);
    return { notes, pyqs };
  } catch (e) {
    console.log(`  ✗ Sem ${sem}: ${name} - ${e.message.slice(0, 60)}`);
    return { notes: [], pyqs: [] };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log(`Launching browser...\n`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const results = {};
  const BATCH_SIZE = 5;

  for (let i = 0; i < allSubjects.length; i += BATCH_SIZE) {
    const batch = allSubjects.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allSubjects.length / BATCH_SIZE);
    console.log(`\nBatch ${batchNum}/${totalBatches}: ${batch.length} subjects...`);

    const batchResults = await Promise.all(
      batch.map(async (subj) => {
        const data = await scrapeSubject(browser, subj.url, subj.sem, subj.name);
        return { sem: subj.sem, name: subj.name, ...data };
      })
    );

    for (const r of batchResults) {
      if (!results[r.sem]) results[r.sem] = [];
      results[r.sem].push({ name: r.name, notes: r.notes, pyqs: r.pyqs });
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();

  const output = [];
  for (const sem of Object.keys(SEMESTERS)) {
    const semNum = parseInt(sem);
    output.push({
      semester: semNum,
      subjects: results[sem] || SEMESTERS[sem].map(name => ({ name, notes: [], pyqs: [] })),
    });
  }

  writeFileSync('scraped-notes.json', JSON.stringify(output, null, 2));

  const totalNotes = output.reduce((s, sem) => s + sem.subjects.reduce((ss, sub) => ss + sub.notes.length, 0), 0);
  const totalPyqs = output.reduce((s, sem) => s + sem.subjects.reduce((ss, sub) => ss + sub.pyqs.length, 0), 0);
  console.log(`\n✓ Done! ${totalNotes} notes, ${totalPyqs} PYQs scraped across ${allSubjects.length} subjects.`);
}

main().catch(console.error);
