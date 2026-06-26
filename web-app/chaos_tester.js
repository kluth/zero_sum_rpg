const puppeteer = require('puppeteer');

(async () => {
  console.log('🔥 Initializing GAUNTLET Chaos Engine (100 Iterations)...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let errorCount = 0;
  
  page.on('pageerror', err => {
    console.error('💥 PAGE ERROR:', err.toString());
    errorCount++;
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('🔴 CONSOLE ERROR:', msg.text());
      errorCount++;
    }
  });

  // Navigate to live app
  await page.goto('https://zero-sum-rpg-2026.web.app/', { waitUntil: 'networkidle2' });
  
  const viewports = [
    { width: 320, height: 480 },
    { width: 375, height: 667 },
    { width: 1920, height: 1080 },
    { width: 1024, height: 768 },
    { width: 280, height: 653 } // Extreme fold
  ];

  console.log('🌪️ Commencing 100 Chaos Variables (Resize, Monkey Clicks, Rapid Inputs)...');
  
  for (let i = 1; i <= 100; i++) {
    try {
      // 1. Chaos Resize
      const vp = viewports[Math.floor(Math.random() * viewports.length)];
      await page.setViewport(vp);

      // 2. Random Clicks
      const x = Math.floor(Math.random() * vp.width);
      const y = Math.floor(Math.random() * vp.height);
      await page.mouse.click(x, y);

      // 3. Rapid Keyboard Mashes
      await page.keyboard.press('Tab');
      if (Math.random() > 0.5) {
        await page.keyboard.press('Enter');
      }
      if (Math.random() > 0.8) {
        await page.keyboard.press('Space');
      }
      
      // 4. Sometimes try to login to Player View (if on landing page)
      if (i === 10) {
        try {
          await page.type('.zs-input', 'CHAOS-KEY-100');
          await page.click('input[value="player"]');
          await page.click('.zs-btn');
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 3000 }).catch(() => {});
          console.log('   -> Transitioned to Player View');
        } catch (e) {}
      }
      
      // 5. Sometimes try to login to GM View
      if (i === 50) {
        await page.goto('https://zero-sum-rpg-2026.web.app/gm', { waitUntil: 'networkidle2' }).catch(() => {});
        console.log('   -> Transitioned to GM View');
      }

      // Log progress every 20 iterations
      if (i % 20 === 0) {
        console.log(`🌀 Iteration ${i}/100 completed. Errors so far: ${errorCount}`);
      }
    } catch (e) {
      console.error(`⚠️ Exception at iteration ${i}:`, e.message);
    }
  }

  console.log(`\n✅ Chaos Engine Finished. Total uncaught UI/JS Errors: ${errorCount}`);
  await browser.close();
  
  if (errorCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
