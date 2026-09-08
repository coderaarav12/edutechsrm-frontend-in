const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  
  // 1. Desktop Dark
  let page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto("http://localhost:3000/contact", { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    localStorage.setItem("edutechsrm-landing-mode", "dark");
    document.documentElement.setAttribute("data-landing-mode", "dark");
  });
  await page.reload({ waitUntil: "networkidle2" });
  await page.screenshot({ path: "scratch/contact_desktop_dark.png", fullPage: true });

  // 2. Desktop Poster
  await page.evaluate(() => {
    localStorage.setItem("edutechsrm-landing-mode", "poster");
    document.documentElement.setAttribute("data-landing-mode", "poster");
  });
  await page.reload({ waitUntil: "networkidle2" });
  await page.screenshot({ path: "scratch/contact_desktop_poster.png", fullPage: true });

  // 3. Mobile Dark
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.evaluate(() => {
    localStorage.setItem("edutechsrm-landing-mode", "dark");
    document.documentElement.setAttribute("data-landing-mode", "dark");
  });
  await page.reload({ waitUntil: "networkidle2" });
  await page.screenshot({ path: "scratch/contact_mobile_dark.png", fullPage: true });

  // 4. Mobile Poster
  await page.evaluate(() => {
    localStorage.setItem("edutechsrm-landing-mode", "poster");
    document.documentElement.setAttribute("data-landing-mode", "poster");
  });
  await page.reload({ waitUntil: "networkidle2" });
  await page.screenshot({ path: "scratch/contact_mobile_poster.png", fullPage: true });

  await browser.close();
  console.log("Screenshots captured successfully!");
})();
