const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const path = require('path');
const fs = require('fs');
const { launchBrowser, setupPage, delay, assert } = require('./helpers');

const APP_PORT = 4200;
const DB_PORT = 9000;

let server;
let emulatorProcess;

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function waitForPort(port, name, timeoutMs = 60000) {
  const start = Date.now();
  console.log(`Waiting for ${name} on port ${port}...`);
  while (Date.now() - start < timeoutMs) {
    if (await checkPort(port)) {
      console.log(`${name} is ready on port ${port}!`);
      return true;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Timeout waiting for ${name} on port ${port}`);
}

function startStaticServer(port) {
  const baseDir = path.resolve(__dirname, '../web-app/dist/web-app/browser');
  if (!fs.existsSync(baseDir)) {
    throw new Error(`Angular build not found at ${baseDir}. Run npm run build first.`);
  }

  const httpServer = http.createServer((req, res) => {
    let filePath = path.join(baseDir, req.url.split('?')[0]);
    
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
    } catch (e) {}

    if (!fs.existsSync(filePath)) {
      filePath = path.join(baseDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webmanifest': 'application/manifest+json'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return new Promise((resolve, reject) => {
    httpServer.listen(port, () => {
      console.log(`Static server running on port ${port}`);
      resolve(httpServer);
    });
    httpServer.on('error', reject);
  });
}

let cleanedUp = false;
async function cleanup() {
  if (cleanedUp) return;
  cleanedUp = true;
  console.log('\nCleaning up processes...');
  
  if (server) {
    server.close(() => {
      console.log('Static server stopped.');
    });
  }
  
  if (emulatorProcess) {
    console.log('Stopping Firebase emulator...');
    try {
      process.kill(-emulatorProcess.pid, 'SIGINT');
    } catch (e) {
      try {
        emulatorProcess.kill('SIGINT');
      } catch (err) {}
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('Cleanup complete.');
}

async function run() {
  try {
    // 1. Start serving the Angular application
    console.log('Starting static server...');
    server = await startStaticServer(APP_PORT);

    // 2. Start Firebase database emulator
    console.log('Starting Firebase emulator...');
    emulatorProcess = spawn('npx', ['firebase', 'emulators:start', '--only', 'database'], {
      cwd: path.resolve(__dirname, '..'),
      detached: true,
      stdio: 'inherit'
    });

    // 3. Wait for both ports to be active
    await waitForPort(APP_PORT, 'Angular application static server');
    await waitForPort(DB_PORT, 'Firebase Database emulator');

    // 4. Launch browser
    console.log('Launching Puppeteer browser...');
    const browser = await launchBrowser();

    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
      failures: []
    };

    const runTest = async (name, fn) => {
      summary.total++;
      console.log(`\n[ADVERSARIAL] [${summary.total}] TEST START: ${name}`);
      const page = await browser.newPage();
      page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
      await setupPage(page);
      const startTime = Date.now();
      try {
        await fn(page, `http://localhost:${APP_PORT}/`);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[PASS] ${name} (${duration}s)`);
        summary.passed++;
      } catch (err) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error(`[FAIL] ${name} (${duration}s)`);
        console.error(err.stack || err.message || err);
        summary.failed++;
        summary.failures.push({ name, error: err.message || String(err) });
      } finally {
        try {
          await page.close();
        } catch (e) {}
      }
    };

    // --- TEST CASE 1: Rapid Theme Toggling ---
    await runTest("Rapid Theme Toggling", async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'ADVERSARIAL-THEME');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 5000 });

      console.log("Rapidly clicking theme toggle 30 times...");
      for (let i = 0; i < 30; i++) {
        await page.click('[data-test-id="theme-toggle"]');
      }

      // Check current state in local storage and body classes
      const storageTheme = await page.evaluate(() => localStorage.getItem('zero_sum_theme'));
      const hasTerminalClass = await page.evaluate(() => document.body.classList.contains('theme-terminal'));
      const hasCorporateClass = await page.evaluate(() => document.body.classList.contains('theme-corporate'));
      
      console.log(`Final storage theme: ${storageTheme}, hasTerminalClass: ${hasTerminalClass}, hasCorporateClass: ${hasCorporateClass}`);
      assert(storageTheme === 'corporate' || storageTheme === 'terminal', "Theme storage value must be corporate or terminal");
      if (storageTheme === 'terminal') {
        assert(hasTerminalClass && !hasCorporateClass, "Body class must match terminal theme");
      } else {
        assert(hasCorporateClass && !hasTerminalClass, "Body class must match corporate theme");
      }
    });

    // --- TEST CASE 2: Rapid Stabilizer Toggling ---
    await runTest("Rapid Stabilizer Toggling", async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'ADVERSARIAL-STAB');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="stabilizer-toggle"]', { timeout: 5000 });

      console.log("Rapidly clicking stabilizer toggle 30 times...");
      for (let i = 0; i < 30; i++) {
        await page.click('[data-test-id="stabilizer-toggle"]');
      }

      const storageStab = await page.evaluate(() => localStorage.getItem('zero_sum_stabilized'));
      const hasStabClass = await page.evaluate(() => document.body.classList.contains('motion-stabilized'));
      const hasDesktopStabClass = await page.evaluate(() => {
        const desk = document.querySelector('.os-desktop');
        return desk ? desk.classList.contains('stabilized') : false;
      });

      console.log(`Final storage stabilized: ${storageStab}, hasStabClass: ${hasStabClass}, hasDesktopStabClass: ${hasDesktopStabClass}`);
      assert(storageStab === 'true' || storageStab === 'false', "Stabilizer storage must be true or false");
      if (storageStab === 'true') {
        assert(hasStabClass && hasDesktopStabClass, "Classes must be present when stabilized is true");
      } else {
        assert(!hasStabClass && !hasDesktopStabClass, "Classes must be absent when stabilized is false");
      }
    });

    // --- TEST CASE 3: Biometric Scanner Early Release vs Full Hold ---
    await runTest("Biometric Scanner Timing Edge Cases", async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'ADVERSARIAL-BIO');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="biometric-scanner"]', { timeout: 5000 });

      const scanner = await page.$('[data-test-id="biometric-scanner"]');
      const box = await scanner.boundingBox();

      // Step A: Mouse down, wait 800ms, mouse up (should not authorize)
      console.log("Holding scanner for 800ms...");
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await delay(800);
      await page.mouse.up();

      let success = await page.evaluate(() => {
        const el = document.querySelector('[data-test-id="biometric-scanner"]');
        return el.classList.contains('scan-success') || el.textContent.includes('Success');
      });
      console.log(`Auth success after 800ms: ${success}`);
      assert(!success, "Scanner must not authorize after only 800ms");

      // Step B: Mouse down, wait 1200ms (should authorize)
      console.log("Holding scanner for 1200ms...");
      await page.mouse.down();
      await delay(1200);
      await page.mouse.up();

      success = await page.evaluate(() => {
        const el = document.querySelector('[data-test-id="biometric-scanner"]');
        return el.classList.contains('scan-success') && (el.textContent.includes('Success') || el.textContent.includes('Authorized'));
      });
      console.log(`Auth success after 1200ms: ${success}`);
      assert(success, "Scanner must authorize after 1200ms");
    });

    // --- TEST CASE 4: Biometric Scanner Drag-Out ---
    await runTest("Biometric Scanner Mouse Move Out of Bounds", async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'ADVERSARIAL-BIO-OUT');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="biometric-scanner"]', { timeout: 5000 });

      const scanner = await page.$('[data-test-id="biometric-scanner"]');
      const box = await scanner.boundingBox();

      // Step A: Mouse down in scanner
      console.log("Holding scanner and moving out of bounds...");
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await delay(300);

      // Move mouse far away
      await page.mouse.move(box.x - 100, box.y - 100);
      await delay(900); // Wait long enough that it would have reached 1200ms total
      await page.mouse.up();

      const success = await page.evaluate(() => {
        const el = document.querySelector('[data-test-id="biometric-scanner"]');
        return el.classList.contains('scan-success') || el.textContent.includes('Success');
      });
      console.log(`Auth success after drag-out: ${success}`);
      assert(!success, "Scanner must reset and NOT authorize if mouse leaves scanner bounds");
    });

    // --- TEST CASE 5: NDA Canvas Window Resize ---
    await runTest("NDA Canvas Resize Redraw Retention", async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'ADVERSARIAL-NDA-RESIZE');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('canvas[data-test-id="nda-canvas"]', { timeout: 5000 });

      const canvas = await page.$('canvas[data-test-id="nda-canvas"]');
      let box = await canvas.boundingBox();

      // Draw initial stroke
      console.log("Drawing stroke 1...");
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.up();

      // Resize window
      console.log("Resizing viewport to 1000x800...");
      await page.setViewport({ width: 1000, height: 800 });
      await delay(300);

      // Draw another stroke
      box = await canvas.boundingBox();
      console.log("Drawing stroke 2 after resize...");
      await page.mouse.move(box.x + 60, box.y + 60);
      await page.mouse.down();
      await page.mouse.move(box.x + 120, box.y + 80);
      await page.mouse.up();

      // Verify the NDA approve button is enabled after the resize (meaning strokes are still in state)
      const isApproveBtnDisabled = await page.evaluate(() => {
        const btn = document.querySelector('[data-test-id="nda-approve-btn"]');
        return (btn).disabled;
      });
      console.log(`NDA approve button disabled after resize: ${isApproveBtnDisabled}`);
      assert(!isApproveBtnDisabled, "Approve button must be enabled after window resize (meaning strokes are preserved)");

      // Verify stabilizer attribute bindings on canvas when stabilizer is toggled
      const getCanvasStabilizedAttr = () => page.evaluate(() => {
        const canvasEl = document.querySelector('canvas[data-test-id="nda-canvas"]');
        return {
          attr: canvasEl.getAttribute('data-stabilized'),
          cls: canvasEl.classList.contains('stabilized-draw')
        };
      });

      let stabState = await getCanvasStabilizedAttr();
      console.log("Canvas initial stabilizer state:", stabState);
      assert(!stabState.attr && !stabState.cls, "Canvas must not be stabilized initially");

      // Toggle stabilizer ON
      await page.click('[data-test-id="stabilizer-toggle"]');
      await delay(300);
      stabState = await getCanvasStabilizedAttr();
      console.log("Canvas stabilizer ON state:", stabState);
      assert(stabState.attr === 'true' && stabState.cls, "Canvas must show stabilizer attributes when ON");

      // Approve NDA
      await page.click('[data-test-id="nda-approve-btn"]');
      const ndaApproved = await page.evaluate(() => {
        const el = document.querySelector('[data-test-id="nda-approved-label"]');
        return el !== null && el.textContent.includes('Approved');
      });
      console.log(`NDA Approved: ${ndaApproved}`);
      assert(ndaApproved, "NDA must be successfully approved");
    });

    // --- TEST CASE 6: Swipe Navigation Boundary Tests ---
    await runTest("Swipe Gesture 50px Boundary Edge Cases", async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'ADVERSARIAL-SWIPE');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="swipe-area"]', { timeout: 5000 });

      const area = await page.$('[data-test-id="swipe-area"]');
      const box = await area.boundingBox();
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      const getActiveWindow = () => page.evaluate(() => {
        const windows = Array.from(document.querySelectorAll('.os-window'));
        console.log("getActiveWindow: total windows =", windows.length);
        let found = null;
        for (const win of windows) {
          const titleEl = win.querySelector('.window-title');
          const title = titleEl ? titleEl.textContent : '';
          const zIndex = win.style.zIndex;
          const attrStyle = win.getAttribute('style') || '';
          console.log(`- Window: "${title}", zIndex prop: "${zIndex}", style attr: "${attrStyle}"`);
          const isHighest = attrStyle.includes('z-index: 10') || zIndex === '10';
          if (isHighest) {
            if (title.includes('Frequenz')) found = 'browser';
            if (title.includes('Whispernet')) found = 'messenger';
            if (title.includes('Global Nav')) found = 'maps';
          }
        }
        return found;
      });

      const initialWindow = await getActiveWindow();
      console.log(`Initial active window: ${initialWindow}`);

      const swipe = async (delta) => {
        await page.evaluate((d) => {
          const area = document.querySelector('[data-test-id="swipe-area"]');
          const downEvent = new MouseEvent('mousedown', {
            bubbles: true,
            clientX: 100
          });
          const upEvent = new MouseEvent('mouseup', {
            bubbles: true,
            clientX: 100 + d
          });
          area.dispatchEvent(downEvent);
          area.dispatchEvent(upEvent);
        }, delta);
        await delay(500);
      };

      // Case A: Swipe exactly 49px right
      console.log("Performing 49px right swipe (below 50px boundary)...");
      await swipe(49);
      let activeWin = await getActiveWindow();
      console.log(`Active window after 49px swipe: ${activeWin}`);
      assert(activeWin === initialWindow, "Window must NOT change on < 50px swipe");

      // Case B: Swipe exactly 50px right (boundary case)
      console.log("Performing 50px right swipe (exact boundary)...");
      await swipe(50);
      activeWin = await getActiveWindow();
      console.log(`Active window after 50px swipe: ${activeWin}`);
      assert(activeWin === initialWindow, "Window must NOT change on exactly 50px swipe (threshold is > 50px)");

      // Case C: Swipe exactly 51px left (above 50px boundary)
      console.log("Performing 51px left swipe (above 50px boundary)...");
      await swipe(-51);
      activeWin = await getActiveWindow();
      console.log(`Active window after 51px swipe: ${activeWin}`);
      assert(activeWin !== initialWindow, "Window MUST cycle on > 50px swipe (e.g. 51px)");


    });

    console.log(`\n========================================`);
    console.log(`ADVERSARIAL STRESS TEST RUN COMPLETE`);
    console.log(`Total Run: ${summary.total}`);
    console.log(`Passed   : ${summary.passed}`);
    console.log(`Failed   : ${summary.failed}`);
    console.log(`========================================`);

    if (summary.failed > 0) {
      console.error('\nDetailed Failures:');
      summary.failures.forEach((f, idx) => {
        console.error(`${idx + 1}. ${f.name} -> ${f.error}`);
      });
    }

    console.log('Closing browser...');
    await browser.close();

    await cleanup();
    process.exit(summary.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('Failed to run adversarial tests:', error);
    await cleanup();
    process.exit(1);
  }
}

// Register exit handlers
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(1);
});
process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(1);
});

run();
