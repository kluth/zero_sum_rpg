const puppeteer = require('puppeteer');

async function run() {
  console.log("Launching Puppeteer for Netrunner...");
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/chromium' 
  });
  
  const PIN = 'TEST_1';
  const SCREENSHOT_DIR = '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d';
  
  const nrPage = await browser.newPage();
  await nrPage.goto(`http://localhost:4200/?session=${PIN}&mode=netrunner`);
  await nrPage.setViewport({ width: 1200, height: 800 });
  await new Promise(r => setTimeout(r, 2000));
  
  await nrPage.screenshot({ path: `${SCREENSHOT_DIR}/6_netrunner_view.png` });
  
  console.log("Shutting down...");
  await browser.close();
  process.exit(0);
}

run();
