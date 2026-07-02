async function main() {
  const response = await fetch('https://edutechsrm-frontend.your-worker-subdomain.workers.dev/');
  const html = await response.text();
  
  const chunkRegex = /_next\/static\/chunks\/[^"']+\.js/g;
  const matches = html.match(chunkRegex);
  
  if (matches) {
    console.log('Referenced chunks:');
    matches.slice(0, 15).forEach(m => console.log('  ' + m));
    if (matches.length > 15) {
      console.log(`  ... and ${matches.length - 15} more`);
    }
  } else {
    console.log('No chunks found in HTML');
  }
}

main().catch(console.error);
