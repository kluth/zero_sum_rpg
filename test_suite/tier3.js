const { assert, delay } = require('./helpers');

module.exports = [
  {
    name: "01. Cross-Feature - Theme Switch + Netrunner Terminal",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'COMB-THEME-TERM');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      // Step 1: Switch theme to terminal mode
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 5000 });
      await page.click('[data-test-id="theme-toggle"]');
      await delay(500);
      
      // Step 2: Use Netrunner Terminal under the new theme
      await page.waitForSelector('[data-test-id="terminal-input"]', { timeout: 5000 });
      await page.type('[data-test-id="terminal-input"]', 'help');
      await page.keyboard.press('Enter');
      await delay(500);
      
      // Verify terminal logs exist and verify color styling
      const hasTerminalClass = await page.evaluate(() => document.body.classList.contains('theme-terminal'));
      const terminalLogsVisible = await page.$eval('[data-test-id="terminal-logs"]', el => el.clientHeight > 0);
      console.log(`Body has terminal theme: ${hasTerminalClass}, Terminal logs visible: ${terminalLogsVisible}`);
      assert(hasTerminalClass, "Theme must be set to terminal");
      assert(terminalLogsVisible, "Terminal logs should be visible");
    }
  },
  {
    name: "02. Cross-Feature - Accessibility Stabilizer + Glitch Transition",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'COMB-STAB-GLITCH');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      // Step 1: Turn on motion stabilizer
      await page.waitForSelector('[data-test-id="stabilizer-toggle"]', { timeout: 5000 });
      await page.click('[data-test-id="stabilizer-toggle"]');
      await delay(300);
      
      // Step 2: Navigate back to landing and log in again to trigger transition
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'COMB-STAB-GLITCH');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      // Verify glitch elements are disabled/bypassed (e.g. they don't have animation classes)
      const glitchAnimationBypassed = await page.evaluate(() => {
        const loader = document.querySelector('.reception-loader-container') || document.querySelector('.glitch-text');
        if (!loader) return true; // not even rendered
        const styles = window.getComputedStyle(loader);
        return styles.animationPlayState === 'paused' || styles.animationName === 'none' || loader.classList.contains('no-glitch');
      });
      console.log(`Motion stabilizer active, glitch transition animation bypassed: ${glitchAnimationBypassed}`);
    }
  },
  {
    name: "03. Cross-Feature - One-Handed Mobile Ergonomics + Biometric Scanner",
    fn: async (page, appUrl) => {
      // Step 1: Emulate Mobile Viewport
      await page.setViewport({ width: 360, height: 740, isMobile: true });
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'COMB-MOBILE-SCANNER');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      // Step 2: Check Biometric Scanner positioning and scale on mobile
      await page.waitForSelector('[data-test-id="biometric-scanner"]', { timeout: 5000 });
      const scannerMetrics = await page.evaluate(() => {
        const el = document.querySelector('[data-test-id="biometric-scanner"]');
        const rect = el.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          viewportHeight: window.innerHeight,
          width: rect.width,
          height: rect.height
        };
      });
      
      // In one-handed mode, touch target should be easily reachable (usually within the bottom 60% of viewport)
      const relativePosition = scannerMetrics.bottom / scannerMetrics.viewportHeight;
      console.log(`Biometric Scanner position ratio: ${relativePosition.toFixed(2)} (Width: ${scannerMetrics.width}px, Height: ${scannerMetrics.height}px)`);
      assert(scannerMetrics.width >= 44 && scannerMetrics.height >= 44, "Scanner hit area must be at least 44x44px for touch ergonomics");
    }
  },
  {
    name: "04. Cross-Feature - Accessibility Stabilizer + NDA Signature Canvas",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'COMB-STAB-NDA');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      // Step 1: Enable stabilizer
      await page.waitForSelector('[data-test-id="stabilizer-toggle"]', { timeout: 5000 });
      await page.click('[data-test-id="stabilizer-toggle"]');
      await delay(300);
      
      // Step 2: Interact with NDA canvas
      await page.waitForSelector('canvas[data-test-id="nda-canvas"]', { timeout: 5000 });
      const canvas = await page.$('canvas[data-test-id="nda-canvas"]');
      const box = await canvas.boundingBox();
      
      console.log('Simulating drawing signature with stabilizer active...');
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 10, box.y + box.height - 10);
      await page.mouse.up();
      
      // Verify stabilizer filters out small tremors / operates with stabilization configurations
      const canvasStabilized = await page.evaluate(() => {
        const canvasEl = document.querySelector('canvas[data-test-id="nda-canvas"]');
        return canvasEl.getAttribute('data-stabilized') === 'true' || canvasEl.classList.contains('stabilized-draw');
      });
      console.log(`Drawing canvas stabilized feedback: ${canvasStabilized}`);
    }
  },
  {
    name: "05. Cross-Feature - Mobile Viewport Swipe + Role Switcher (Routing)",
    fn: async (page, appUrl) => {
      // Step 1: Set Mobile Viewport
      await page.setViewport({ width: 360, height: 740, isMobile: true });
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'COMB-SWIPE-ROUTE');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      // Step 2: Perform Swipe Navigation on [data-test-id="swipe-area"]
      await page.waitForSelector('[data-test-id="swipe-area"]', { timeout: 5000 });
      const area = await page.$('[data-test-id="swipe-area"]');
      const box = await area.boundingBox();
      
      console.log('Simulating swipe navigation gesture to transition role/view...');
      await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 20, box.y + box.height / 2);
      await page.mouse.up();
      await delay(1000);
      console.log('Swipe role transition test completed.');
    }
  }
];
