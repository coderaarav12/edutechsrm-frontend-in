const fs = require('fs');
const path = require('path');

// Read the bundled worker
const workerPath = path.join(__dirname, '../.open-next/worker.js');
let content = fs.readFileSync(workerPath, 'utf8');

// Replace ALL backslashes in the entire file with forward slashes
// This is aggressive but necessary for Windows-built OpenNext on Cloudflare
const originalLength = content.length;
content = content.replaceAll('\\', '/');
const newLength = content.length;

// Write back
fs.writeFileSync(workerPath, content, 'utf8');
console.log(`✓ Normalized Windows paths: replaced ${originalLength - newLength} backslashes with forward slashes`);




