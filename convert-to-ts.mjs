import { readFileSync, writeFileSync } from 'fs';

const scraped = JSON.parse(readFileSync('scraped-notes.json', 'utf8'));

function escapeUrl(url) {
  return url.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

let output = `export interface NoteResource {
  title: string
  url: string
}

export interface SubjectResources {
  name: string
  notes: NoteResource[]
  pyqs: NoteResource[]
}

export interface SemesterResources {
  semester: number
  subjects: SubjectResources[]
}

export const NOTES_DATA: SemesterResources[] = [\n`;

for (const sem of scraped) {
  output += `  {\n    semester: ${sem.semester},\n    subjects: [\n`;
  
  for (const subj of sem.subjects) {
    const notesStr = subj.notes.length > 0
      ? subj.notes.map(n => `      { title: "${n.title.replace(/"/g, '\\"')}", url: "${escapeUrl(n.url)}" }`).join(',\n')
      : '';
    const pyqsStr = subj.pyqs.length > 0
      ? subj.pyqs.map(n => `      { title: "${n.title.replace(/"/g, '\\"')}", url: "${escapeUrl(n.url)}" }`).join(',\n')
      : '';
    
    output += `      { name: "${subj.name.replace(/"/g, '\\"')}", notes: [\n${notesStr}\n      ], pyqs: [\n${pyqsStr}\n      ] },\n`;
  }
  
  output += `    ],\n  },\n`;
}

output += `]\n`;

writeFileSync('lib/notes-data.ts', output);

console.log('✓ Updated lib/notes-data.ts');
console.log(`  ${scraped.reduce((s, sem) => s + sem.subjects.length, 0)} subjects`);
console.log(`  ${scraped.reduce((s, sem) => s + sem.subjects.reduce((ss, sub) => ss + sub.notes.length, 0), 0)} notes`);
console.log(`  ${scraped.reduce((s, sem) => s + sem.subjects.reduce((ss, sub) => ss + sub.pyqs.length, 0), 0)} pyqs`);
