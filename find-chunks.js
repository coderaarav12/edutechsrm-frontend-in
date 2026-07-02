const fs = require('fs');

const content = fs.readFileSync('./worker.js', 'utf8');

// Find all R2.c("...") calls - these are the chunks needed
const pattern = /R2\.c\("([^"]+)"\)/g;
const chunks = new Set();
let match;

while ((match = pattern.exec(content)) !== null) {
  chunks.add(match[1]);
}

console.log(`Found ${chunks.size} unique chunks needed:`);
Array.from(chunks).slice(0, 15).forEach(c => console.log('  ' + c));
if (chunks.size > 15) {
  console.log(`  ... and ${chunks.size - 15} more`);
}
