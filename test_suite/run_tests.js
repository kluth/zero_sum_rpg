const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const path = require('path');
const fs = require('fs');
const { launchBrowser, setupPage } = require('./helpers');

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
  // Parse command line arguments
  const args = process.argv.slice(2);
  let tiersToRun = [];
  if (args.length > 0) {
    tiersToRun = args.filter(a => ['tier1', 'tier2', 'tier3', 'tier4'].includes(a));
  }
  if (tiersToRun.length === 0) {
    tiersToRun = ['tier1', 'tier2', 'tier3', 'tier4'];
  }

  console.log(`Selected Tiers to Run: ${tiersToRun.join(', ')}`);

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

    // 5. Run tests for each tier
    for (const tierName of tiersToRun) {
      console.log(`\n========================================`);
      console.log(`Running Test Tier: ${tierName}`);
      console.log(`========================================`);
      
      const tierPath = path.resolve(__dirname, `${tierName}.js`);
      if (!fs.existsSync(tierPath)) {
        console.error(`Tier file not found: ${tierPath}`);
        continue;
      }
      
      delete require.cache[require.resolve(tierPath)];
      const tests = require(tierPath);
      for (const test of tests) {
        summary.total++;
        console.log(`\n[${summary.total}] TEST START: ${test.name}`);
        const page = await browser.newPage();
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
        await setupPage(page);
        
        const startTime = Date.now();
        try {
          await test.fn(page, `http://localhost:${APP_PORT}/`, browser);
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          console.log(`[PASS] ${test.name} (${duration}s)`);
          summary.passed++;
        } catch (err) {
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          console.error(`[FAIL] ${test.name} (${duration}s)`);
          console.error(err.message || err);
          summary.failed++;
          summary.failures.push({ tier: tierName, name: test.name, error: err.message || String(err) });
        } finally {
          try {
            await page.close();
          } catch (e) {}
        }
      }
    }

    console.log(`\n========================================`);
    console.log(`TEST RUN COMPLETE`);
    console.log(`Total Run: ${summary.total}`);
    console.log(`Passed   : ${summary.passed}`);
    console.log(`Failed   : ${summary.failed}`);
    console.log(`========================================`);

    if (summary.failed > 0) {
      console.error('\nDetailed Failures:');
      summary.failures.forEach((f, idx) => {
        console.error(`${idx + 1}. [${f.tier}] ${f.name} -> ${f.error}`);
      });
    }

    console.log('Closing browser...');
    await browser.close();

    await cleanup();
    process.exit(summary.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('Failed to run test infrastructure:', error);
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
