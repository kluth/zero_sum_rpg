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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Configures request interception and hardware mocks
async function setupPage(page) {
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('unsplash.com') || url.includes('picsum.photos') || url.includes('ui-avatars.com')) {
      if (url.includes('ui-avatars.com')) {
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
  });
}

async function launchBrowser() {
  return await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required'
    ],
    executablePath: '/usr/bin/chromium'
  });
}

module.exports = {
  delay,
  assert,
  setupPage,
  launchBrowser,
  SCREENSHOT_DIR
};
