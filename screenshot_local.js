const { firefox } = require('playwright');
(async () => {
  const browser = await firefox.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.goto('http://localhost:4200/?session=12345&mode=billboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/billboard_local.png' });
  await browser.close();
})();
