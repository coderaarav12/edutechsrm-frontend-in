import { writeFileSync } from 'fs';

const BASE = 'https://thehelpers.tech';

const SEMESTERS = {
  1: ['Calculus And Linear Algebra', 'Chemistry', 'Philosophy Of Engineering', 'Introduction To Computational Biology', 'Programming For Problem Solving', 'Fundamental Of Economics (FOE)', 'Biomedical Sensors', 'Foreign Languages', 'Cell Biology', 'Microbiology', 'Physical And Analytical Chemistry', 'Biochemistry', 'Basic Civil & Mechanical Workshop', 'Biology'],
  2: ['Advanced Calculus And Complex Analysis', 'Electrical And Electronics Engineering', 'Semiconductor Physics And Computational Methods', 'Physics-Mechanics', 'Object Oriented Design And Programming', 'Communicative English', 'Electromagnetic Physics', 'Engineering Mechanics', 'Electronic System And PCB Design', 'Building Materials In The Built Environment'],
  3: ['Data Structures And Algorithm', 'Computer Organization And Architecture', 'Operating Systems', 'Transforms And Boundary Value Problems', 'Advanced Programming Practice', 'Design Thinking And Methodology', 'Digital Logic Design', 'Solid State Devices', 'Biochemistry', 'Electromagnetic Thoery And Interference', 'Basic Chemical Engineering', 'Bioprocess Principles', 'Genetics And Cytogenetics', 'Microbiology', 'Social Engineering', 'Numerical Methods & Analysis', 'Foundation of Data Science (FDS)'],
  4: ['Design And Analysis Of Algorithms', 'Database Management Systems', 'Artificial Intelligence', 'Probability And Queueing Theory', 'Social Engineering', 'Bioprocess Engineering', 'Cell Communication And Signaling', 'Software Process', 'Chemical Engineering Principles', 'Molecular Biology', 'Internet Of Things (IOT)', 'Probability & Applied Statistics', 'Digital Image Processing'],
  5: ['Discrete Mathematics', 'Full Stack Web Development', 'Formal Language And Automata', 'Computer Networks', 'Machine Learning', 'Professional Elective 2', 'Open Elective 1', 'Community Connect'],
  6: ['Data Science', 'Software Engineering & Project Management (SEPM)', 'Compiler Design', 'Professional Elective 3', 'Professional Elective 4', 'Open Elective 2', 'Project & MOOC'],
  7: ['Behavioral Psychology', 'Professional Elective 5', 'Professional Elective 6', 'Professional Elective 7', 'Professional Elective 8', 'Open Elective 3'],
  8: ['Major Project', 'Internship'],
};

async function fetchResources(sem, name) {
  try {
    const url = `${BASE}/api/resources?semester=${sem}&subject=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`);
    return null;
  }
}

async function main() {
  const output = [];

  for (const [semStr, subjects] of Object.entries(SEMESTERS)) {
    const sem = parseInt(semStr);
    const batch = subjects.slice(0, 10); // Fetch 10 at a time
    const rest = subjects.slice(10);

    // Process in batches
    const subjectResults = [];
    for (let i = 0; i < subjects.length; i += 10) {
      const batch = subjects.slice(i, i + 10);
      console.log(`\nFetching batch ${Math.floor(i / 10) + 1}/${Math.ceil(subjects.length / 10)} for Sem ${sem}...`);

      const batchResults = await Promise.all(
        batch.map(async (name) => {
          const data = await fetchResources(sem, name);
          if (data) {
            const notes = (data.notes || [])
              .filter(n => n.url && n.url !== 'Coming Soon')
              .map(n => ({ title: n.name, url: n.url }));
            const pyqs = (data.pyqs || [])
              .filter(n => n.url && n.url !== 'Coming Soon')
              .map(n => ({ title: n.name, url: n.url }));
            console.log(`  ✓ ${name}: ${notes.length} notes, ${pyqs.length} pyqs`);
            return { name, notes, pyqs };
          } else {
            console.log(`  - ${name}: no data`);
            return { name, notes: [], pyqs: [] };
          }
        })
      );

      subjectResults.push(...batchResults);
      await new Promise(r => setTimeout(r, 500));
    }

    output.push({ semester: sem, subjects: subjectResults });
  }

  writeFileSync('scraped-notes.json', JSON.stringify(output, null, 2));

  const totalNotes = output.reduce((s, sem) => s + sem.subjects.reduce((ss, sub) => ss + sub.notes.length, 0), 0);
  const totalPyqs = output.reduce((s, sem) => s + sem.subjects.reduce((ss, sub) => ss + sub.pyqs.length, 0), 0);
  const totalSubjects = output.reduce((s, sem) => s + sem.subjects.length, 0);
  console.log(`\n✓ Done! ${totalNotes} notes, ${totalPyqs} PYQs across ${totalSubjects} subjects.`);
}

main().catch(console.error);
