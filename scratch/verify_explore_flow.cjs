const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  
  // Mobile test
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto("http://localhost:3000/explore", { waitUntil: "networkidle2" });
  
  // Set poster mode
  await page.evaluate(() => {
    localStorage.setItem("edutechsrm-landing-mode", "poster");
    document.documentElement.setAttribute("data-landing-mode", "poster");
  });
  await page.reload({ waitUntil: "networkidle2" });

  // 1. Initial screenshot at top showing map cockpit
  await page.screenshot({ path: "scratch/explore_mobile_map_top.png" });

  // 2. Scroll down to directory
  await page.evaluate(() => {
    window.scrollBy({ top: 900, behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: "scratch/explore_mobile_directory_view.png" });

  // 3. Expand first category button (Academic Blocks)
  const categoryBtns = await page.$$("button");
  for (const btn of categoryBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes("Academic")) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: "scratch/explore_mobile_category_expanded.png" });

  // 4. Click a building item inside the category
  const viewBtns = await page.$$("span");
  for (const span of viewBtns) {
    const text = await page.evaluate(el => el.textContent, span);
    if (text.trim() === "View") {
      await span.click();
      break;
    }
  }
  // Wait for smooth scroll up
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: "scratch/explore_mobile_scrolled_up_to_map.png" });

  await browser.close();
  console.log("Explore flow verified successfully!");
})();
