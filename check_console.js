const { firefox } = require('playwright');
(async () => {
  const browser = await firefox.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });
  page.on('pageerror', error => {
    errors.push(`[Page Error] ${error.message}`);
  });
  
  await page.goto('https://zero-sum-rpg-2026.web.app/?session=12345&mode=billboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log(JSON.stringify(errors, null, 2));
  await browser.close();
})();
