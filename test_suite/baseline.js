const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to configure page interception and bluetooth mocks
async function setupPage(page) {
  // 1. Enable Request Interception
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('unsplash.com') || url.includes('picsum.photos') || url.includes('ui-avatars.com')) {
      console.log(`[Mock System] Intercepting request to: ${url}`);
      
      if (url.includes('ui-avatars.com')) {
        // Return dummy SVG for ui-avatars.com
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
          <rect width="64" height="64" fill="#2563eb"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="24">Z S</text>
        </svg>`;
        request.respond({
          status: 200,
          contentType: 'image/svg+xml',
          body: svg
        });
      } else {
        // Return dummy image SVG for unsplash and picsum
        const mockImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
          <rect width="200" height="200" fill="#cccccc"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#666666">Mock Image</text>
        </svg>`;
        request.respond({
          status: 200,
          contentType: 'image/svg+xml',
          body: mockImageSvg
        });
      }
    } else {
      request.continue();
    }
  });

  // 2. Mock hardware like navigator.bluetooth before the page loads
  await page.evaluateOnNewDocument(() => {
    const mockBluetooth = {
      getAvailability: async () => true,
      requestDevice: async () => {
        return {
          id: 'mock-device-id',
          name: 'Mock Zero-Sum Bluetooth Device',
          gatt: {
            connect: async () => {
              return {
                getPrimaryService: async () => {
                  return {
                    getCharacteristic: async () => {
                      return {
                        readValue: async () => new DataView(new ArrayBuffer(8)),
                        writeValue: async () => {},
                        startNotifications: async () => {}
                      };
                    }
                  };
                }
              };
            },
            connected: true
          }
        };
      },
      getDevices: async () => []
    };

    Object.defineProperty(navigator, 'bluetooth', {
      value: mockBluetooth,
      writable: true,
      configurable: true
    });
    console.log('[Mock System] navigator.bluetooth mocked successfully');
  });
}

async function run() {
  console.log('Launching Puppeteer for baseline E2E test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required'
    ],
    executablePath: '/usr/bin/chromium'
  });

  try {
    const sessionKey = 'TEST-E2E-SESSION';

    // --- TEST 1: GM Login Flow & View Verification ---
    console.log('--- TEST 1: Testing GM Login & View ---');
    const gmPage = await browser.newPage();
    await setupPage(gmPage);
    await gmPage.goto('http://localhost:4200/');
    await gmPage.setViewport({ width: 1200, height: 800 });
    
    // Fill session key
    await gmPage.waitForSelector('input[name="key"]');
    await gmPage.type('input[name="key"]', sessionKey);
    
    // Select GM/Administrator radio button
    await gmPage.click('input[value="gm"] + .role-card');
    
    // Click Sign In
    await gmPage.click('button.zs-btn');
    
    // Wait for routing navigation to /gm
    console.log('Waiting for routing to /gm...');
    await gmPage.waitForFunction(() => window.location.pathname === '/gm', { timeout: 5000 });
    console.log('Successfully navigated to /gm');
    
    // Verify GM Page loaded (check for System Controls text or branding element)
    await gmPage.waitForSelector('.modern-dashboard');
    console.log('GM view loaded successfully');
    
    // Verify bluetooth mock on the page
    const bluetoothAvailableGm = await gmPage.evaluate(async () => {
      return typeof navigator.bluetooth !== 'undefined' && await navigator.bluetooth.getAvailability();
    });
    console.log(`navigator.bluetooth mock verified on GM page: ${bluetoothAvailableGm}`);
    if (!bluetoothAvailableGm) {
      throw new Error('Bluetooth mock was not found or was disabled on the GM page');
    }
    
    await delay(1000);
    await gmPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'baseline_gm_view.png') });
    console.log('GM page screenshot captured');
    await gmPage.close();


    // --- TEST 2: Player Login Flow & View Verification ---
    console.log('--- TEST 2: Testing Player Login & View ---');
    const playerPage = await browser.newPage();
    await setupPage(playerPage);
    await playerPage.goto('http://localhost:4200/');
    await playerPage.setViewport({ width: 1200, height: 800 });
    
    // Fill session key
    await playerPage.waitForSelector('input[name="key"]');
    await playerPage.type('input[name="key"]', sessionKey);
    
    // Select Player/Agent radio button (should be default but click to be sure)
    await playerPage.click('input[value="player"] + .role-card');
    
    // Click Sign In
    await playerPage.click('button.zs-btn');
    
    // Wait for routing navigation to /player
    console.log('Waiting for routing to /player...');
    await playerPage.waitForFunction(() => window.location.pathname === '/player', { timeout: 5000 });
    console.log('Successfully navigated to /player');
    
    // Verify Player Page loaded (check for os-desktop element)
    await playerPage.waitForSelector('.os-desktop');
    console.log('Player view loaded successfully');
    
    // Verify bluetooth mock on the page
    const bluetoothAvailablePlayer = await playerPage.evaluate(async () => {
      return typeof navigator.bluetooth !== 'undefined' && await navigator.bluetooth.getAvailability();
    });
    console.log(`navigator.bluetooth mock verified on Player page: ${bluetoothAvailablePlayer}`);
    if (!bluetoothAvailablePlayer) {
      throw new Error('Bluetooth mock was not found or was disabled on the Player page');
    }
    
    await delay(1000);
    await playerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'baseline_player_view.png') });
    console.log('Player page screenshot captured');
    await playerPage.close();


    // --- TEST 3: Spectator Login Flow & View Verification ---
    console.log('--- TEST 3: Testing Spectator Login & View ---');
    const spectatorPage = await browser.newPage();
    await setupPage(spectatorPage);
    await spectatorPage.goto('http://localhost:4200/');
    await spectatorPage.setViewport({ width: 1200, height: 800 });
    
    // Fill session key
    await spectatorPage.waitForSelector('input[name="key"]');
    await spectatorPage.type('input[name="key"]', sessionKey);
    
    // Select Spectator radio button
    await spectatorPage.click('input[value="spectator"] + .role-card');
    
    // Click Sign In
    await spectatorPage.click('button.zs-btn');
    
    // Wait for routing navigation to /spectator
    console.log('Waiting for routing to /spectator...');
    await spectatorPage.waitForFunction(() => window.location.pathname === '/spectator', { timeout: 5000 });
    console.log('Successfully navigated to /spectator');
    
    // Verify Spectator Page loaded (check for spectator-layout element)
    await spectatorPage.waitForSelector('.spectator-layout');
    console.log('Spectator view loaded successfully');
    
    // Verify bluetooth mock on the page
    const bluetoothAvailableSpec = await spectatorPage.evaluate(async () => {
      return typeof navigator.bluetooth !== 'undefined' && await navigator.bluetooth.getAvailability();
    });
    console.log(`navigator.bluetooth mock verified on Spectator page: ${bluetoothAvailableSpec}`);
    if (!bluetoothAvailableSpec) {
      throw new Error('Bluetooth mock was not found or was disabled on the Spectator page');
    }
    
    await delay(1000);
    await spectatorPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'baseline_spectator_view.png') });
    console.log('Spectator page screenshot captured');
    await spectatorPage.close();

    console.log('ALL E2E BASELINE TESTS PASSED SUCCESSFULLY.');
    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('E2E Baseline Test Failed:', error);
    await browser.close();
    process.exit(1);
  }
}

run();
