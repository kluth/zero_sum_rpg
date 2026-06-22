const { firefox } = require('playwright');
(async () => {
  const browser = await firefox.launch();
  const context = await browser.newContext({ viewport: { width: 400, height: 800 } });
  const page = await context.newPage();
  await page.goto('https://zero-sum-rpg-2026.web.app/?session=12345&mode=billboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const panels = document.querySelectorAll('.glass-panel');
    return Array.from(panels).map(p => ({
      scrollHeight: p.scrollHeight,
      clientHeight: p.clientHeight,
      offsetHeight: p.offsetHeight,
      cssHeight: window.getComputedStyle(p).height,
      cssFlex: window.getComputedStyle(p).flex,
      contentOverflowing: p.scrollHeight > p.clientHeight
    }));
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
