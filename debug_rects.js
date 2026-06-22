const { firefox } = require('playwright');
(async () => {
  const browser = await firefox.launch();
  const context = await browser.newContext({ viewport: { width: 400, height: 800 } });
  const page = await context.newPage();
  await page.goto('https://zero-sum-rpg-2026.web.app/?session=12345&mode=billboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const panel = document.querySelector('.glass-panel');
    const rect = panel.getBoundingClientRect();
    const children = Array.from(panel.children).map(c => c.getBoundingClientRect());
    return { panel: rect, children };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
