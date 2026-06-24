const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function takeScreenshots() {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    const url = 'https://zero-sum-rpg-2026.web.app';
    const viewport = { width: 1920, height: 1080 };
    await page.setViewport(viewport);
    
    console.log(`Loading URL...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    const artifactDir = '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/artifacts/screenshots_redesign';
    if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
    }

    // Helper for timeouts since waitForTimeout is deprecated in newer puppeteer
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Lobby
    console.log("Taking Lobby screenshot");
    await delay(2000);
    await page.screenshot({ path: path.join(artifactDir, '0_lobby.png') });

    // Join as GM
    console.log("Joining as GM...");
    await page.type('input[placeholder="Enter Session ID"]', 'TEST');
    await page.type('input[placeholder="Enter Handle"]', 'GM');
    await page.type('input[placeholder="Admin PIN (GM/Spectator)"]', '0000');
    const buttons = await page.$$('.cyber-button');
    for (let btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes('AS GM')) {
            await btn.click();
            break;
        }
    }
    await delay(3000);
    await page.screenshot({ path: path.join(artifactDir, '1_gm_view.png') });

    // Refresh and join as Spectator
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log("Joining as Spectator...");
    await delay(1000);
    await page.type('input[placeholder="Enter Session ID"]', 'TEST');
    await page.type('input[placeholder="Admin PIN (GM/Spectator)"]', '0000');
    const buttons2 = await page.$$('.cyber-button');
    for (let btn of buttons2) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes('AS SPECTATOR')) {
            await btn.click();
            break;
        }
    }
    await delay(3000);
    await page.screenshot({ path: path.join(artifactDir, '2_spectator_view.png') });

    // Refresh and join as Player
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log("Joining as Player...");
    await delay(1000);
    await page.type('input[placeholder="Enter Session ID"]', 'TEST');
    await page.type('input[placeholder="Enter Handle"]', 'PLAYER1');
    const buttons3 = await page.$$('.cyber-button');
    for (let btn of buttons3) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes('AS PLAYER')) {
            await btn.click();
            break;
        }
    }
    await delay(3000);
    await page.screenshot({ path: path.join(artifactDir, '3_player_view.png') });

    // Refresh and join as Billboard
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log("Joining as Billboard...");
    await delay(1000);
    await page.type('input[placeholder="Enter Session ID"]', 'TEST');
    const buttons4 = await page.$$('.cyber-button');
    for (let btn of buttons4) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes('BILLBOARD')) {
            await btn.click();
            break;
        }
    }
    await delay(3000);
    await page.screenshot({ path: path.join(artifactDir, '4_billboard_view.png') });

    await browser.close();
    console.log("Screenshots done.");
}

takeScreenshots().catch(console.error);
