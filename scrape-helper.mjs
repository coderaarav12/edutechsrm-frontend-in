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

function subjUrl(sem, name) {
  return `${BASE}/semesters/${sem}/subjects/${encodeURIComponent(name)}`;
}

async function fetchPage(sem, name) {
  const url = subjUrl(sem, name);
  try {
    const res = await fetch(url);
    const html = await res.text();

    const notes = [];
    const pyqs = [];

    function extractItems(sectionHtml, arr) {
      if (!sectionHtml) return;
      const items = sectionHtml.matchAll(/<span[^>]*>([^<]+)<\/span>[\s\S]*?onclick="window\.open\('([^']+)'/g);
      for (const m of items) {
        arr.push({ title: m[1].trim(), url: m[2] });
      }
    }

    const notesMatch = html.match(/<h3[^>]*>Study Notes And Other Resources<\/h3>([\s\S]*?)<\/div><\/div><div class="text-card-foreground/);
    const pyqMatch = html.match(/<h3[^>]*>Previous Year Questions<\/h3>([\s\S]*?)<\/div><\/div><div class="text-card-foreground/);

    extractItems(notesMatch?.[1], notes);
    extractItems(pyqMatch?.[1], pyqs);

    return { notes, pyqs };
  } catch (e) {
    console.error(`Error fetching ${name}: ${e.message}`);
    return { notes: [], pyqs: [] };
  }
}

async function main() {
  const results = {};

  for (const sem of Object.keys(SEMESTERS)) {
    results[sem] = [];
    for (const name of SEMESTERS[sem]) {
      console.log(`Fetching Sem ${sem}: ${name}...`);
      const { notes, pyqs } = await fetchPage(parseInt(sem), name);
      results[sem].push({ name, notes, pyqs });
      await new Promise(r => setTimeout(r, 300));
    }
  }

  writeFileSync('scraped-notes.json', JSON.stringify(results, null, 2));
  console.log('\nDone! Results saved to scraped-notes.json');
}

main().catch(console.error);
