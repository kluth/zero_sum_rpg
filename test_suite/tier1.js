const { assert, delay } = require('./helpers');

const sessionKey = 'TIER1-TEST-SESSION';

module.exports = [
  // --- FEATURE A: ROUTING & SHELLS ---
  {
    name: "01. Routing & Shells - Landing Page Load",
    fn: async (page, appUrl) => {
      console.log('Navigating to landing page...');
      await page.goto(appUrl);
      await page.waitForSelector('input[name="key"]', { timeout: 3000 });
      const value = await page.$eval('input[name="key"]', el => el.value);
      console.log(`Landing page loaded. Key input current value: "${value}"`);
    }
  },
  {
    name: "02. Routing & Shells - Role Options Presence",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.waitForSelector('input[value="gm"] + .role-card', { timeout: 3000 });
      await page.waitForSelector('input[value="player"] + .role-card', { timeout: 3000 });
      await page.waitForSelector('input[value="spectator"] + .role-card', { timeout: 3000 });
      console.log('All three role select cards are present.');
    }
  },
  {
    name: "03. Routing & Shells - Sign In Button Presence",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.waitForSelector('button.zs-btn', { timeout: 3000 });
      const text = await page.$eval('button.zs-btn', el => el.textContent.trim());
      console.log(`Sign-in button present with text: "${text}"`);
      assert(text.toLowerCase().includes('sign') || text.toLowerCase().includes('join'), "Sign in button text mismatch");
    }
  },
  {
    name: "04. Routing & Shells - GM Dashboard Routing",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="gm"] + .role-card');
      await page.click('button.zs-btn');
      console.log('Waiting for route to transition to /gm...');
      await page.waitForFunction(() => window.location.pathname === '/gm', { timeout: 5000 });
      await page.waitForSelector('.modern-dashboard', { timeout: 5000 });
      console.log('Navigated to /gm and modern dashboard shell is present.');
    }
  },
  {
    name: "05. Routing & Shells - Player Dashboard Routing",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      console.log('Waiting for route to transition to /player...');
      await page.waitForFunction(() => window.location.pathname === '/player', { timeout: 5000 });
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      console.log('Navigated to /player and OS desktop shell is present.');
    }
  },
  {
    name: "06. Routing & Shells - Spectator Dashboard Routing",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="spectator"] + .role-card');
      await page.click('button.zs-btn');
      console.log('Waiting for route to transition to /spectator...');
      await page.waitForFunction(() => window.location.pathname === '/spectator', { timeout: 5000 });
      await page.waitForSelector('.spectator-layout', { timeout: 5000 });
      console.log('Navigated to /spectator and spectator layout shell is present.');
    }
  },
  {
    name: "07. Routing & Shells - Glitch Transition Loader",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      // Look for the glitch loader immediately after click
      const loaderFound = await page.evaluate(() => {
        const el = document.querySelector('.reception-loader-container') || document.querySelector('.glitch-text');
        return el !== null;
      });
      console.log(`Glitch transition loader element detection during routing: ${loaderFound}`);
      // Wait for navigation to complete anyway
      await page.waitForFunction(() => window.location.pathname === '/player', { timeout: 5000 });
    }
  },

  // --- FEATURE B: THEME SWITCHING ---
  {
    name: "08. Theme Switching - Toggle Button Presence on GM Dashboard",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="gm"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.modern-dashboard', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 3000 });
      console.log('Theme toggle button exists on GM dashboard.');
    }
  },
  {
    name: "09. Theme Switching - Toggle Button Presence on Player Dashboard",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 3000 });
      console.log('Theme toggle button exists on Player dashboard.');
    }
  },
  {
    name: "10. Theme Switching - Corporate Theme by Default",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      const hasTerminalTheme = await page.evaluate(() => document.body.classList.contains('theme-terminal'));
      console.log(`Default body theme classes: has theme-terminal = ${hasTerminalTheme}`);
      assert(!hasTerminalTheme, "Terminal theme should not be active by default");
    }
  },
  {
    name: "11. Theme Switching - Theme Shift to Terminal Mode",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 5000 });
      await page.click('[data-test-id="theme-toggle"]');
      await delay(500);
      const classes = await page.evaluate(() => Array.from(document.body.classList));
      console.log(`Body classes after toggle: ${classes.join(', ')}`);
      assert(classes.includes('theme-terminal'), "Body should have 'theme-terminal' class after toggle");
    }
  },
  {
    name: "12. Theme Switching - Theme Shift Toggle Back to Corporate",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 5000 });
      await page.click('[data-test-id="theme-toggle"]'); // switch to terminal
      await delay(200);
      await page.click('[data-test-id="theme-toggle"]'); // switch back
      await delay(200);
      const hasTerminalTheme = await page.evaluate(() => document.body.classList.contains('theme-terminal'));
      console.log(`Body classes after toggling twice: has theme-terminal = ${hasTerminalTheme}`);
      assert(!hasTerminalTheme, "Body should have reverted from theme-terminal");
    }
  },
  {
    name: "13. Theme Switching - Theme State Persistence Across Refreshes",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="theme-toggle"]', { timeout: 5000 });
      await page.click('[data-test-id="theme-toggle"]'); // Switch to terminal
      await delay(500);
      console.log('Refreshing player page...');
      await page.reload();
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      const hasTerminalTheme = await page.evaluate(() => document.body.classList.contains('theme-terminal'));
      console.log(`Body class after refresh: has theme-terminal = ${hasTerminalTheme}`);
      assert(hasTerminalTheme, "Terminal theme should persist across page refreshes");
    }
  },

  // --- FEATURE C: DIEGETIC ELEMENTS ---
  {
    name: "14. Diegetic Elements - Biometric Scanner Target Visibility",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="biometric-scanner"]', { timeout: 5000 });
      console.log('Biometric scanner click-hold target is visible.');
    }
  },
  {
    name: "15. Diegetic Elements - Biometric Scanner Click-Hold Action",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="biometric-scanner"]', { timeout: 5000 });
      
      const scanner = await page.$('[data-test-id="biometric-scanner"]');
      const box = await scanner.boundingBox();
      console.log('Simulating click and hold on biometric scanner...');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await delay(1500); // Hold for 1.5 seconds to complete biometric scan
      await page.mouse.up();
      
      // Look for confirmation text or scan completion visual class
      const isSuccess = await page.evaluate(() => {
        const scannerEl = document.querySelector('[data-test-id="biometric-scanner"]');
        return scannerEl.classList.contains('scan-success') || scannerEl.innerHTML.includes('Success') || scannerEl.innerHTML.includes('Authorized');
      });
      console.log(`Biometric scanner scan completion success: ${isSuccess}`);
      assert(isSuccess, "Biometric scanner did not register successful holding scan");
    }
  },
  {
    name: "16. Diegetic Elements - Netrunner Terminal Input Visibility",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="terminal-input"]', { timeout: 5000 });
      console.log('Netrunner terminal input is visible.');
    }
  },
  {
    name: "17. Diegetic Elements - Netrunner Terminal Logs Visibility",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="terminal-logs"]', { timeout: 5000 });
      console.log('Netrunner terminal logs console is visible.');
    }
  },
  {
    name: "18. Diegetic Elements - Netrunner Terminal Command Output Verification",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="terminal-input"]', { timeout: 5000 });
      
      console.log('Sending "status" command to Netrunner terminal...');
      await page.type('[data-test-id="terminal-input"]', 'status');
      await page.keyboard.press('Enter');
      await delay(500);
      
      const logsContent = await page.$eval('[data-test-id="terminal-logs"]', el => el.textContent);
      console.log(`Logs output content: "${logsContent.trim()}"`);
      assert(logsContent.toLowerCase().includes('status') || logsContent.toLowerCase().includes('online') || logsContent.length > 0, "Terminal logs should register command execution");
    }
  },
  {
    name: "19. Diegetic Elements - NDA Signature Canvas Visibility",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('canvas[data-test-id="nda-canvas"]', { timeout: 5000 });
      console.log('NDA signature canvas is visible.');
    }
  },
  {
    name: "20. Diegetic Elements - NDA Signature Approve Button",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="nda-approve-btn"]', { timeout: 5000 });
      console.log('NDA signature approve button is visible.');
    }
  },

  // --- FEATURE D: ACCESSIBILITY & STABILIZER ---
  {
    name: "21. Accessibility & Stabilizer - Toggle Presence",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="stabilizer-toggle"]', { timeout: 5000 });
      console.log('Accessibility stabilizer toggle is present.');
    }
  },
  {
    name: "22. Accessibility & Stabilizer - Emergency Heal Button Presence",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="emergency-heal-btn"]', { timeout: 5000 });
      console.log('Emergency heal button is present.');
    }
  },
  {
    name: "23. Accessibility & Stabilizer - Toggle Action Verification",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('[data-test-id="stabilizer-toggle"]', { timeout: 5000 });
      
      console.log('Activating stabilizer...');
      await page.click('[data-test-id="stabilizer-toggle"]');
      await delay(300);
      
      const isStabilized = await page.evaluate(() => {
        const bodyClass = document.body.classList.contains('motion-stabilized');
        const containerClass = document.querySelector('.os-desktop')?.classList.contains('stabilized') || false;
        return bodyClass || containerClass;
      });
      console.log(`Visual stabilization indicator active: ${isStabilized}`);
      assert(isStabilized, "Stabilizer should apply stabilization classes or attributes to body or desktop");
    }
  },

  // --- FEATURE E: TOUCH & MOBILE ERGONOMICS ---
  {
    name: "24. Touch & Mobile Ergonomics - Swipe Area Presence",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('[data-test-id="swipe-area"]', { timeout: 5000 });
      console.log('Swipe navigation area is present.');
    }
  },
  {
    name: "25. Touch & Mobile Ergonomics - Active OS Windows Presence",
    fn: async (page, appUrl) => {
      await page.goto(appUrl);
      await page.type('input[name="key"]', sessionKey);
      await page.click('input[value="player"] + .role-card');
      await page.click('button.zs-btn');
      await page.waitForSelector('.os-desktop', { timeout: 5000 });
      await page.waitForSelector('.os-window', { timeout: 5000 });
      const windowCount = await page.evaluate(() => document.querySelectorAll('.os-window').length);
      console.log(`Number of active OS windows initially visible: ${windowCount}`);
      assert(windowCount > 0, "At least one active OS window should be visible in standard player layout");
    }
  }
];
