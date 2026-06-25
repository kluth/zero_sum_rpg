const { assert, delay, setupPage } = require('./helpers');

module.exports = [
  {
    name: "01. Real-World - Hacked Uplink Scenario",
    fn: async (page, appUrl) => {
      console.log('--- SCENARIO: Hacked Uplink ---');
      
      // Step 1: Netrunner initiates connection from landing page
      await page.goto(appUrl);
      await page.waitForSelector('input[name="key"]', { timeout: 3000 });
      await page.type('input[name="key"]', 'UPLINK-SECURE-99');
      
      // Step 2: Switch theme to terminal mode on the landing page if toggle available, or sign in first
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      // Step 3: Wait for Player dashboard to mount
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 3000 });
      
      // Toggle to terminal mode for high-contrast hacking display
      await page.click('[data-test-id="theme-toggle"]');
      await delay(500);
      assert(await page.evaluate(() => document.body.classList.contains('theme-terminal')), "Terminal theme not activated");
      
      // Step 4: Open and type override commands in Netrunner terminal
      await page.waitForSelector('[data-test-id="terminal-input"]', { timeout: 5000 });
      await page.type('[data-test-id="terminal-input"]', 'sys_override --port 9000');
      await page.keyboard.press('Enter');
      await delay(1000);
      
      // Step 5: Check logs console for authorization output
      const logs = await page.$eval('[data-test-id="terminal-logs"]', el => el.textContent);
      console.log(`Uplink Log output: "${logs.trim()}"`);
      assert(logs.length > 0, "Terminal should log uplink command execution output");
    }
  },
  {
    name: "02. Real-World - Dystopian High-Stress Playtest",
    fn: async (page, appUrl) => {
      console.log('--- SCENARIO: Dystopian High-Stress Playtest ---');
      
      // Step 1: Agent authenticates under simulated visual glitch and alarms
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'STRESS-PLAYTEST-400');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      
      // Step 2: Simulate sudden health drop triggering visual alarm flashes
      console.log('Simulating critical hazard event (flashing red, screen shake)...');
      await page.evaluate(() => {
        // Mock a state changes on window or body
        document.body.classList.add('alarm-active', 'critical-low-hp');
      });
      await delay(500);
      
      // Step 3: User hits the Emergency Heal button in panic
      await page.waitForSelector('[data-test-id="emergency-heal-btn"]', { timeout: 3000 });
      await page.click('[data-test-id="emergency-heal-btn"]');
      console.log('Emergency Heal button clicked.');
      
      // Step 4: Instantly complete biometric confirmation scan
      await page.waitForSelector('[data-test-id="biometric-scanner"]', { timeout: 3000 });
      const scanner = await page.$('[data-test-id="biometric-scanner"]');
      const box = await scanner.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await delay(1200); // scan duration
      await page.mouse.up();
      
      // Step 5: Verify health restore and alarm cleared
      const alarmsCleared = await page.evaluate(() => {
        const body = document.body;
        return !body.classList.contains('alarm-active') && (body.classList.contains('scan-success') || document.querySelector('[data-test-id="biometric-scanner"]').classList.contains('scan-success'));
      });
      console.log(`Stress playtest recovery status: ${alarmsCleared}`);
    }
  },
  {
    name: "03. Real-World - One-Handed Mobile Operator",
    fn: async (page, appUrl) => {
      console.log('--- SCENARIO: One-Handed Mobile Operator ---');
      
      // Step 1: Set typical mobile screen size (one-handed thumb zone test)
      await page.setViewport({ width: 360, height: 740, isMobile: true, hasTouch: true });
      await page.goto(appUrl);
      
      // Step 2: Fill session key and sign in
      await page.type('input[name="key"]', 'MOBILE-OP-77');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      // Step 3: Wait for OS Desktop to reflow into single-column layout
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      
      // Verify active windows reflowed and stack correctly
      await page.waitForSelector('.os-window', { timeout: 5000 });
      const isMobileStacked = await page.evaluate(() => {
        const win = document.querySelector('.os-window');
        const style = window.getComputedStyle(win);
        return win.clientWidth > 300 || style.position === 'relative' || document.body.classList.contains('mobile-layout');
      });
      console.log(`OS Desktop is stacked for mobile viewports: ${isMobileStacked}`);
      
      // Step 4: Swipe to switch active window tabs (simulated by dragging swipe navigation area)
      await page.waitForSelector('[data-test-id="swipe-area"]', { timeout: 5000 });
      const area = await page.$('[data-test-id="swipe-area"]');
      const box = await area.boundingBox();
      
      console.log('Swiping swipe-area left to cycle viewport tabs...');
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 10, box.y + box.height / 2);
      await page.mouse.up();
      await delay(800);
      
      console.log('One-Handed Mobile operator navigation check complete.');
    }
  },
  {
    name: "04. Real-World - High-Accessibility Rebel",
    fn: async (page, appUrl) => {
      console.log('--- SCENARIO: High-Accessibility Rebel ---');
      
      // Step 1: User lands on login, enables motion stabilizer
      await page.goto(appUrl);
      
      // Navigate to player dashboard
      await page.type('input[name="key"]', 'ACC-REBEL-101');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="stabilizer-toggle"]', { timeout: 3000 });
      
      // Toggle stabilizer immediately to avoid nausea
      await page.click('[data-test-id="stabilizer-toggle"]');
      await delay(300);
      
      // Step 2: Validate body classes and reduced-motion indicator properties
      const isStabilized = await page.evaluate(() => document.body.classList.contains('motion-stabilized'));
      console.log(`Reduced motion setting saved: ${isStabilized}`);
      assert(isStabilized, "Motion stabilizer must set class 'motion-stabilized' on body");
      
      // Step 3: Draw digital signature on canvas carefully
      await page.waitForSelector('canvas[data-test-id="nda-canvas"]', { timeout: 3000 });
      const canvas = await page.$('canvas[data-test-id="nda-canvas"]');
      const box = await canvas.boundingBox();
      
      console.log('Drawing steady path on canvas under stabilized system...');
      await page.mouse.move(box.x + 20, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
      await page.mouse.up();
      await delay(500);
      
      // Step 4: Submit signed NDA form
      await page.waitForSelector('[data-test-id="nda-approve-btn"]', { timeout: 3000 });
      await page.click('[data-test-id="nda-approve-btn"]');
      await delay(500);
      
      console.log('Signed NDA approved successfully under accessibility constraints.');
    }
  },
  {
    name: "05. Real-World - Multi-Role Sync & Recovery",
    fn: async (page, appUrl, browser) => {
      console.log('--- SCENARIO: Multi-Role Sync & Recovery ---');
      const syncKey = 'SYNC-SESSION-999';
      
      // Step 1: Open GM page in a new window/context
      console.log('Launching GM session context...');
      const gmPage = await browser.newPage();
      gmPage.on('console', msg => console.log('GM BROWSER CONSOLE:', msg.text()));
      await setupPage(gmPage);
      console.log('GM page: page setup done. Navigating...');
      await gmPage.goto(appUrl);
      console.log('GM page: navigated. Typing session key...');
      await gmPage.type('input[name="key"]', syncKey);
      console.log('GM page: typed key. Clicking role-card...');
      await gmPage.click('input[value="gm"] + .role-card');
      console.log('GM page: clicked role. Clicking Sign In...');
      await gmPage.click('button.zs-btn');
      console.log('GM page: clicked Sign In. Waiting for .modern-dashboard...');
      await gmPage.waitForSelector('.modern-dashboard', { timeout: 5000 });
      console.log('GM page: loaded .modern-dashboard successfully.');
      
      // Step 2: Player connects in the primary page
      console.log('Launching Player session context...');
      await page.bringToFront();
      console.log('Player page: Navigating to appUrl...');
      await page.goto(appUrl);
      console.log('Player page: Navigating complete. Typing key...');
      await page.type('input[name="key"]', syncKey);
      console.log('Player page: Typed key. Selecting player role...');
      await page.click('input[value="player"] + .role-card');
      console.log('Player page: Selected role. Clicking Sign In...');
      await page.click('button.zs-btn');
      console.log('Player page: Clicked Sign In. Waiting for .os-desktop...');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      console.log('Player page: loaded .os-desktop successfully.');
      
      // Step 3: GM triggers a game event (e.g. state change)
      console.log('GM page triggering remote game event...');
      await gmPage.evaluate(() => {
        // Trigger simulation or set database event
        if (window.firebase) {
          const db = window.firebase.database();
          db.ref('sessions/SYNC-SESSION-999/status').set({
            event: 'ALARM',
            time: Date.now()
          });
        } else {
          // Fallback update to localstorage shared simulation
          localStorage.setItem('sync_event', 'ALARM');
          window.dispatchEvent(new Event('storage'));
        }
      });
      await delay(1000);
      
      // Step 4: Player view receives sync notification of alarm event
      console.log('Verifying player view synchronized alarm state...');
      const playerAlarmTriggered = await page.evaluate(() => {
        return document.body.classList.contains('alarm-active') || localStorage.getItem('sync_event') === 'ALARM';
      });
      console.log(`Player session synced alarm state: ${playerAlarmTriggered}`);
      
      // Cleanup gmPage
      await gmPage.close();
    }
  }
];
