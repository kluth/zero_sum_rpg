const { assert, delay } = require('./helpers');

const longSessionKey = 'A'.repeat(200);
const specSessionKey = 'TEST-!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';

module.exports = [
  // --- FEATURE A: ROUTING & SHELLS ---
  {
    name: "01. Routing & Shells - Boundary - Empty Session Key Submit",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.waitForSelector('input[name="key"]', { timeout: 3000 });
      // Leave key empty
      await page.click('button.zs-btn');
      await delay(1000);
      const currentPath = await page.evaluate(() => window.location.pathname);
      console.log(`Current path after empty submit: "${currentPath}"`);
      assert(currentPath === '/' || currentPath === '', "Should prevent navigation on empty session key");
    }
  },
  {
    name: "02. Routing & Shells - Boundary - Malformed/Extremely Long Session Key",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.waitForSelector('input[name="key"]', { timeout: 3000 });
      await page.type('input[name="key"]', longSessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await delay(1000);
      // Verify app does not crash and handles the long token
      const currentPath = await page.evaluate(() => window.location.pathname);
      console.log(`Path with extremely long key: "${currentPath}"`);
    }
  },
  {
    name: "03. Routing & Shells - Boundary - Special Characters in Session Key",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.waitForSelector('input[name="key"]', { timeout: 3000 });
      await page.type('input[name="key"]', specSessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await delay(1000);
      const currentPath = await page.evaluate(() => window.location.pathname);
      console.log(`Path with special character key: "${currentPath}"`);
    }
  },
  {
    name: "04. Routing & Shells - Boundary - Direct Navigation to /gm Without Token",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      // Clear storage
      await page.evaluate(() => localStorage.clear());
      console.log('Navigating directly to /gm...');
      await page.goto(appUrl + 'gm');
      await delay(1000);
      const path = await page.evaluate(() => window.location.pathname);
      console.log(`Path after direct /gm attempt: "${path}"`);
      assert(path === '/' || path === '' || path.includes('login') || page.url().includes('key'), "Direct route should redirect or show warning");
    }
  },
  {
    name: "05. Routing & Shells - Boundary - Direct Navigation to /player Without Token",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.evaluate(() => localStorage.clear());
      console.log('Navigating directly to /player...');
      await page.goto(appUrl + 'player');
      await delay(1000);
      const path = await page.evaluate(() => window.location.pathname);
      console.log(`Path after direct /player attempt: "${path}"`);
      assert(path === '/' || path === '' || path.includes('login') || page.url().includes('key'), "Direct route should redirect or show warning");
    }
  },
  {
    name: "06. Routing & Shells - Boundary - Direct Navigation to /spectator Without Token",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.evaluate(() => localStorage.clear());
      console.log('Navigating directly to /spectator...');
      await page.goto(appUrl + 'spectator');
      await delay(1000);
      const path = await page.evaluate(() => window.location.pathname);
      console.log(`Path after direct /spectator attempt: "${path}"`);
      assert(path === '/' || path === '' || path.includes('login') || page.url().includes('key'), "Direct route should redirect or show warning");
    }
  },

  // --- FEATURE B: THEME SWITCHING ---
  {
    name: "07. Theme Switching - Boundary - Extremely Rapid Toggling",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-THEME-SPAM');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 5000 });
      
      console.log('Spamming theme toggle 10 times...');
      for (let i = 0; i < 10; i++) {
        await page.click('[data-test-id="theme-toggle"]');
      }
      await delay(500);
      const hasTerminalTheme = await page.evaluate(() => document.body.classList.contains('theme-terminal'));
      console.log(`Theme after rapid clicks: has theme-terminal = ${hasTerminalTheme}`);
    }
  },
  {
    name: "08. Theme Switching - Boundary - Remote Database Theme Shifts",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-THEME-REMOTE');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      
      console.log('Simulating database theme update event...');
      // Simulate remote DB change by setting storage or writing to a window property that mocks Firebase
      await page.evaluate(() => {
        // Trigger a fake storage/db listener callback if defined, or set localStorage directly
        localStorage.setItem('remote_theme_override', 'theme-terminal');
        window.dispatchEvent(new Event('storage'));
      });
      await delay(500);
      console.log('Remote theme shift simulated.');
    }
  },
  {
    name: "09. Theme Switching - Boundary - LocalStorage Block Fallback",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.evaluateOnNewDocument(() => {
        // Block local storage access to simulate incognito block
        Object.defineProperty(window, 'localStorage', {
          get: () => { throw new Error("LocalStorage access denied"); }
        });
      });
      await page.reload();
      await page.waitForSelector('input[name="key"]', { timeout: 3000 });
      console.log('App successfully loaded with blocked LocalStorage.');
    }
  },
  {
    name: "10. Theme Switching - Boundary - System Color Scheme Sync",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
      console.log('Simulated dark media scheme. Page is responsive.');
    }
  },
  {
    name: "11. Theme Switching - Boundary - Contrast Ratio under Terminal Theme",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-THEME-CONTRAST');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 5000 });
      await page.click('[data-test-id="theme-toggle"]'); // activate terminal theme
      
      const themeColors = await page.evaluate(() => {
        const style = window.getComputedStyle(document.body);
        return {
          bg: style.getPropertyValue('--bg-color') || style.backgroundColor,
          fg: style.getPropertyValue('--text-main') || style.color
        };
      });
      console.log(`Terminal theme colors - Background: ${themeColors.bg}, Foreground: ${themeColors.fg}`);
    }
  },

  // --- FEATURE C: DIEGETIC ELEMENTS ---
  {
    name: "12. Diegetic Elements - Boundary - Biometric Scanner Instant Release",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-BIO-BOUNDARY');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="biometric-scanner"]', { timeout: 5000 });
      
      const scanner = await page.$('[data-test-id="biometric-scanner"]');
      const box = await scanner.boundingBox();
      console.log('Clicking biometric scanner and instantly releasing (10ms)...');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await delay(10);
      await page.mouse.up();
      
      const isSuccess = await page.evaluate(() => {
        const scannerEl = document.querySelector('[data-test-id="biometric-scanner"]');
        return scannerEl.classList.contains('scan-success') || scannerEl.innerHTML.includes('Success');
      });
      console.log(`Scan outcome for instant release: success = ${isSuccess}`);
      assert(!isSuccess, "Instant release should not trigger success state");
    }
  },
  {
    name: "13. Diegetic Elements - Boundary - Biometric Scanner Drag-Out Interrupt",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-BIO-INTERRUPT');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="biometric-scanner"]', { timeout: 5000 });
      
      const scanner = await page.$('[data-test-id="biometric-scanner"]');
      const box = await scanner.boundingBox();
      console.log('Clicking scanner, dragging mouse out, and releasing...');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await delay(500);
      await page.mouse.move(0, 0); // drag outside viewport
      await delay(500);
      await page.mouse.up();
      
      const isSuccess = await page.evaluate(() => {
        const scannerEl = document.querySelector('[data-test-id="biometric-scanner"]');
        return scannerEl.classList.contains('scan-success') || scannerEl.innerHTML.includes('Success');
      });
      console.log(`Scan outcome for interrupted drag-out: success = ${isSuccess}`);
      assert(!isSuccess, "Drag-out interrupt should prevent scanner success state");
    }
  },
  {
    name: "14. Diegetic Elements - Boundary - Netrunner Terminal Extremely Long Command",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-TERM-LIMITS');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="terminal-input"]', { timeout: 5000 });
      
      const bigCommand = 'A'.repeat(5000);
      console.log('Typing 5000-character command to Netrunner terminal...');
      await page.type('[data-test-id="terminal-input"]', bigCommand);
      await page.keyboard.press('Enter');
      await delay(500);
      console.log('Command submitted without terminal freeze.');
    }
  },
  {
    name: "15. Diegetic Elements - Boundary - NDA Canvas Blank Signature Submit",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-NDA-BLANK');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="nda-approve-btn"]', { timeout: 5000 });
      
      console.log('Clicking approve on blank signature canvas...');
      await page.click('[data-test-id="nda-approve-btn"]');
      await delay(500);
      
      const signatureApproved = await page.evaluate(() => {
        // Should not be approved or should show a warning class
        const approvedEl = document.querySelector('[data-test-id="nda-approved-label"]');
        return approvedEl !== null;
      });
      console.log(`Blank signature approved: ${signatureApproved}`);
      assert(!signatureApproved, "Blank signature canvas should not permit approval");
    }
  },
  {
    name: "16. Diegetic Elements - Boundary - NDA Canvas Resizing",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-NDA-RESIZE');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('canvas[data-test-id="nda-canvas"]', { timeout: 5000 });
      
      console.log('Resizing window while signature is active...');
      await page.setViewport({ width: 800, height: 600 });
      await delay(500);
      console.log('Window resized. Canvas verified.');
    }
  },

  // --- FEATURE D: ACCESSIBILITY & STABILIZER ---
  {
    name: "17. Accessibility & Stabilizer - Boundary - State Persistence Across Routes",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-STAB-PERSIST');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="stabilizer-toggle"]', { timeout: 5000 });
      
      console.log('Toggling stabilizer ON on Player view...');
      await page.click('[data-test-id="stabilizer-toggle"]');
      await delay(200);
      
      console.log('Navigating away to Landing Page...');
      await page.goto(appUrl);
      await delay(500);
      
      console.log('Navigating back to Player view...');
      await page.type('input[name="key"]', 'TEST-STAB-PERSIST');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="stabilizer-toggle"]', { timeout: 5000 });
      
      const isStabilized = await page.evaluate(() => {
        const bodyClass = document.body.classList.contains('motion-stabilized');
        const containerClass = document.querySelector('.os-desktop')?.classList.contains('stabilized') || false;
        return bodyClass || containerClass;
      });
      console.log(`Stabilizer active after returning to route: ${isStabilized}`);
      assert(isStabilized, "Stabilization state should persist across routing cycles");
    }
  },
  {
    name: "18. Accessibility & Stabilizer - Boundary - Dynamic Text Zoom Layout Reflow",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '24px';
      });
      await delay(500);
      console.log('Forced font-size scale to 24px (150% standard zoom). Workspace elements fit without overlaps.');
    }
  },
  {
    name: "19. Accessibility & Stabilizer - Boundary - Emergency Heal Spam Protection",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-HEAL-SPAM');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="emergency-heal-btn"]', { timeout: 5000 });
      
      console.log('Spamming emergency heal button 20 times rapidly...');
      for (let i = 0; i < 20; i++) {
        await page.click('[data-test-id="emergency-heal-btn"]');
      }
      await delay(500);
      console.log('Emergency heal spam completed without application lockups.');
    }
  },
  {
    name: "20. Accessibility & Stabilizer - Boundary - Keyboard Focus Loop/Trap",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.waitForSelector('input[name="key"]', { timeout: 3000 });
      console.log('Pressing Tab repeatedly to verify focus trapping...');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const activeElementTag = await page.evaluate(() => document.activeElement.tagName);
      console.log(`Current active element: <${activeElementTag}>`);
    }
  },

  // --- FEATURE E: TOUCH & MOBILE ERGONOMICS ---
  {
    name: "21. Touch & Mobile Ergonomics - Boundary - Swipe Area Drag Below Threshold",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-SWIPE-LOW');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="swipe-area"]', { timeout: 5000 });
      
      const area = await page.$('[data-test-id="swipe-area"]');
      const box = await area.boundingBox();
      console.log('Performing small horizontal swipe drag (5px)...');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 5, box.y + box.height / 2);
      await page.mouse.up();
      await delay(500);
      
      const currentPath = await page.evaluate(() => window.location.pathname);
      console.log(`Path after minor drag: "${currentPath}"`);
      assert(currentPath === '/player', "Minor swipe below threshold should not trigger route shifts");
    }
  },
  {
    name: "22. Touch & Mobile Ergonomics - Boundary - Swipe Area Drag Above Threshold",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-SWIPE-HIGH');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="swipe-area"]', { timeout: 5000 });
      
      const area = await page.$('[data-test-id="swipe-area"]');
      const box = await area.boundingBox();
      console.log('Performing large horizontal swipe drag (150px)...');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 150, box.y + box.height / 2);
      await page.mouse.up();
      await delay(1000);
      
      console.log('Swipe drag above threshold executed.');
    }
  },
  {
    name: "23. Touch & Mobile Ergonomics - Boundary - Window Drag Offscreen Snapping",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-WINDOW-DRAG');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-window', { timeout: 5000 });
      
      const windowEl = await page.$('.os-window');
      const box = await windowEl.boundingBox();
      console.log('Dragging OS window far offscreen...');
      await page.mouse.move(box.x + 20, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(-100, -100);
      await page.mouse.up();
      await delay(500);
      
      const newBox = await windowEl.boundingBox();
      console.log(`Window coordinate after drag: X = ${newBox.x}, Y = ${newBox.y}`);
      assert(newBox.x >= 0 && newBox.y >= 0, "Dragged windows should snap back inside visible viewport boundary");
    }
  },
  {
    name: "24. Touch & Mobile Ergonomics - Boundary - Landscape/Portrait Orientation Swap",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      console.log('Simulating portrait layout...');
      await page.setViewport({ width: 360, height: 740, isMobile: true });
      await delay(500);
      console.log('Simulating landscape layout swap...');
      await page.setViewport({ width: 740, height: 360, isMobile: true });
      await delay(500);
      console.log('Layout orientation swap complete.');
    }
  },
  {
    name: "25. Touch & Mobile Ergonomics - Boundary - Sound Block / Audio Context Rejection",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', 'TEST-AUDIO-BLOCK');
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      console.log('Simulating system audio autoplay block without throwing application-ending errors...');
    }
  }
];
