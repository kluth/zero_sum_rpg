const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function checkOverflow(url, viewport) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport(viewport);
    
    console.log(`Testing viewport: ${viewport.width}x${viewport.height}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the main wrapper to be rendered
    await page.waitForSelector('.main-dashboard-wrapper, .billboard-container, .player-uplink-container', { timeout: 10000 }).catch(() => {});
    
    // Quick delay to let animations settle
    await new Promise(resolve => setTimeout(resolve, 2000));

    const artifactDir = '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d';
    if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
    }
    const screenshotPath = path.join(artifactDir, `screenshot_${viewport.width}x${viewport.height}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${screenshotPath}`);

    // Evaluate layout
    const metrics = await page.evaluate(() => {
        const issues = [];
        const winHeight = window.innerHeight;
        const winWidth = window.innerWidth;

        // Check body scroll
        if (document.body.scrollHeight > winHeight) {
            issues.push(`Body scrolls vertically. body.scrollHeight: ${document.body.scrollHeight}, winHeight: ${winHeight}`);
        }
        if (document.body.scrollWidth > winWidth) {
            issues.push(`Body scrolls horizontally. body.scrollWidth: ${document.body.scrollWidth}, winWidth: ${winWidth}`);
        }

        return {
            windowSize: `${winWidth}x${winHeight}`,
            hasIssues: issues.length > 0,
            issues: issues
        };
    });

    console.log(`\n--- Results for ${viewport.width}x${viewport.height} ---`);
    if (metrics.hasIssues) {
        console.error("FAIL: Overflows detected:");
        metrics.issues.forEach(i => console.error(" - " + i));
    } else {
        console.log("PASS: Everything fits inside the viewport beautifully.");
    }

    await browser.close();
}

async function runTests() {
    const url = 'https://zero-sum-rpg-2026.web.app';
    const viewports = [
        { width: 3840, height: 2160 }, // 4K TV
        { width: 1920, height: 1080 }, // Desktop HD
        { width: 1366, height: 768 },  // Small Laptop
        { width: 800, height: 600 },   // Very Small Display
    ];

    for (const vp of viewports) {
        await checkOverflow(url, vp);
    }
}

runTests().catch(console.error);
