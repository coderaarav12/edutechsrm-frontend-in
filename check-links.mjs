const url = 'https://thehelpers.vercel.app/semesters/5/subjects/Computer%20Networks';
fetch(url).then(r=>r.text()).then(html=>{
  const driveLinks = html.match(/https:\/\/drive\.google\.com\/[^\s"'<>)]+/g) || [];
  const docsLinks = html.match(/https:\/\/docs\.google\.com\/[^\s"'<>)]+/g) || [];
  console.log('Drive links:', driveLinks.length);
  console.log('Docs links:', docsLinks.length);
  const all = [...new Set([...driveLinks, ...docsLinks])];
  all.forEach(u=>console.log(u));
  if (all.length === 0) {
    const anyUrl = html.match(/https?:\/\/[^\s"'<>)]+/g) || [];
    const unique = [...new Set(anyUrl)];
    console.log('Some URLs found:', unique.length);
    unique.filter(u=>!u.includes('next') && !u.includes('vercel') && !u.includes('googletag') && !u.includes('pagead') && !u.includes('cloudflare') && !u.includes('gsap') && !u.includes('fontawesome')).slice(0,20).forEach(u=>console.log(u));
  }
});
