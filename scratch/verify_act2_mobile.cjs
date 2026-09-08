const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });

  await page.evaluate(() => {
    localStorage.setItem("edutechsrm-landing-mode", "poster");
    document.documentElement.setAttribute("data-landing-mode", "poster");
  });
  await page.reload({ waitUntil: "networkidle2" });

  // Scroll down progressively to find and capture story-act-2
  const scrollPositions = [1200, 1800, 2200, 2600, 3000];
  for (let i = 0; i < scrollPositions.length; i++) {
    await page.evaluate((top) => {
      window.scrollTo({ top, behavior: "instant" });
    }, scrollPositions[i]);
    await new Promise((r) => setTimeout(r, 400));
    
    // Check if story-act-2 is visible
    const opacity = await page.evaluate(() => {
      const el = document.querySelector(".story-act-2");
      return el ? window.getComputedStyle(el).opacity : 0;
    });

    if (parseFloat(opacity) > 0.3) {
      await page.screenshot({ path: `scratch/act2_mobile_poster_found_${i}.png` });
      console.log(`Found story-act-2 at scroll ${scrollPositions[i]} with opacity ${opacity}`);
    }
  }

  // Also force story-act-2 opacity to 1 directly to take a definitive layout screenshot
  await page.evaluate(() => {
    const act = document.querySelector(".story-act-2");
    if (act) {
      act.style.opacity = "1";
      act.style.display = "flex";
      // ensure cards are at their resting state
      const cards = [".mem-card-1", ".mem-card-2", ".mem-card-3", ".mem-card-4"];
      cards.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
    }
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: "scratch/act2_mobile_poster_direct.png" });

  await browser.close();
  console.log("Act 2 verification complete!");
})();
