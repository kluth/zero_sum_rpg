const { firefox } = require('playwright');
(async () => {
  const browser = await firefox.launch();
  const context = await browser.newContext({ viewport: { width: 400, height: 800 } });
  const page = await context.newPage();
  await page.goto('https://zero-sum-rpg-2026.web.app/?session=12345&mode=billboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const cyanPanel = await page.$('.glass-panel:nth-of-type(2)');
  if (cyanPanel) {
    await cyanPanel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await cyanPanel.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/billboard_cyan.png' });
  }
  await browser.close();
})();
