const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '..', '..', '..', '.gemini', 'antigravity-cli', 'brain', '5d20c266-f3bf-43ba-b50f-a0640a3ef24d', 'artifacts', 'screenshots');
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
const LOG_FILE = path.join(ARTIFACTS_DIR, '..', 'simulation_log.txt');

function logEvent(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`);
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSession(sessionId, scenario) {
    logEvent(`\n=== INITIATING SESSION: ${sessionId} (${scenario}) ===`);
    
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
        headless: 'new', // Use new headless mode
    });

    try {
        const gmPage = await browser.newPage();
        await gmPage.setViewport({ width: 1280, height: 800 });
        
        logEvent(`[${sessionId}] GM Agent booting up...`);
        await gmPage.goto(`https://zero-sum-rpg-2026.web.app/?session=${sessionId}&mode=gm`, { waitUntil: 'networkidle2' });
        
        await delay(2000);
        await gmPage.screenshot({ path: path.join(ARTIFACTS_DIR, `${sessionId}_01_gm_joined.png`) });

        logEvent(`[${sessionId}] GM Agent generates procedural facility.`);
        // Evaluate clicking the generate button
        await gmPage.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('GENERATE FACILITY'));
            if(btn) btn.click();
        });
        await delay(2000);
        await gmPage.screenshot({ path: path.join(ARTIFACTS_DIR, `${sessionId}_02_gm_generated.png`) });

        // Players Join
        logEvent(`[${sessionId}] Player Agents connecting...`);
        const p1Page = await browser.newPage();
        await p1Page.setViewport({ width: 1280, height: 800 });
        await p1Page.goto(`https://zero-sum-rpg-2026.web.app/?session=${sessionId}&mode=player&player=p1`, { waitUntil: 'networkidle2' });

        const p2Page = await browser.newPage();
        await p2Page.setViewport({ width: 1280, height: 800 });
        await p2Page.goto(`https://zero-sum-rpg-2026.web.app/?session=${sessionId}&mode=player&player=p2`, { waitUntil: 'networkidle2' });

        await delay(2000);
        await p1Page.screenshot({ path: path.join(ARTIFACTS_DIR, `${sessionId}_03_p1_joined.png`) });
        await p2Page.screenshot({ path: path.join(ARTIFACTS_DIR, `${sessionId}_04_p2_joined.png`) });

        // GM Operations
        logEvent(`[${sessionId}] GM executing scenario: ${scenario}`);
        
        if (scenario === 'Combat Rush') {
            // GM sets threat level and forces trauma
            await gmPage.evaluate(() => {
                const heatBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('+ HEAT'));
                if(heatBtn) { heatBtn.click(); heatBtn.click(); heatBtn.click(); heatBtn.click(); heatBtn.click(); }
                
                const traumaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('FORCE TRAUMA'));
                if(traumaBtn) traumaBtn.click();
            });
            await delay(1000);
            logEvent(`[${sessionId}] High heat detected. Player 1 sustains trauma.`);
        } else if (scenario === 'Stealth Infiltration') {
            // GM spawns CCTV
            await gmPage.evaluate(() => {
                const cctvBtn = Array.from(document.querySelectorAll('.prefab-block')).find(b => b.textContent.includes('CCTV'));
                if(cctvBtn) cctvBtn.click();
            });
            await delay(1000);
            logEvent(`[${sessionId}] GM deployed CCTV grid.`);
        } else if (scenario === 'Lore Run') {
            // GM places server room template
            await gmPage.evaluate(() => {
                const roomBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SERVER ROOM'));
                if(roomBtn) roomBtn.click();
            });
            await delay(1000);
            logEvent(`[${sessionId}] GM deployed Server Mainframe.`);
        }

        // Reveal Map
        await gmPage.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('REVEAL ALL TO ALL'));
            if(btn) btn.click();
        });
        logEvent(`[${sessionId}] GM revealed map to all players.`);
        await delay(2000);

        // Final screenshots
        await gmPage.screenshot({ path: path.join(ARTIFACTS_DIR, `${sessionId}_05_gm_final.png`) });
        await p1Page.screenshot({ path: path.join(ARTIFACTS_DIR, `${sessionId}_06_p1_final.png`) });

        logEvent(`[${sessionId}] Session concluded.`);
    } catch (e) {
        logEvent(`[${sessionId}] ERROR: ${e.message}`);
    } finally {
        await browser.close();
    }
}

async function runAll() {
    logEvent("STARTING ZERO-SUM RPG AUTOMATED SIMULATIONS");
    await runSession('sim_alpha', 'Combat Rush');
    await runSession('sim_beta', 'Stealth Infiltration');
    await runSession('sim_gamma', 'Lore Run');
    logEvent("ALL SIMULATIONS CONCLUDED");
}

runAll();
