const { firefox } = require('playwright');
const fs = require('fs');

function generatePin() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

(async () => {
  console.log('Launching Firefox for 15 AAA Simulation Sessions...');
  const browser = await firefox.launch({ headless: true });
  
  const targetDir = 'test_suite/massive_sessions';
  if (!fs.existsSync(targetDir)){
      fs.mkdirSync(targetDir, { recursive: true });
  }

  for (let sessionIndex = 1; sessionIndex <= 15; sessionIndex++) {
      const pin = generatePin();
      console.log(`\n--- Starting Session ${sessionIndex}/15 | PIN: ${pin} ---`);
      
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const gmPage = await context.newPage();
      const specPage = await context.newPage();
      const p1Page = await context.newPage();

      // Setup Session
      await gmPage.goto('http://localhost:4200/');
      await gmPage.waitForSelector('.lobby-container');
      
      await gmPage.fill('.pin-input', pin);
      await gmPage.evaluate(() => {
        const buttons = document.querySelectorAll('.cyber-button');
        for (let b of buttons) { if (b.innerText.includes('GM OVERRIDE')) b.click(); }
      });
      await gmPage.waitForSelector('.gm-panel', { timeout: 10000 });

      await specPage.goto(`http://localhost:4200/?session=${pin}&mode=spectator`);
      await p1Page.goto(`http://localhost:4200/?session=${pin}&mode=player&player=p1`);
      
      await gmPage.waitForTimeout(2000);

      const sessionDir = `${targetDir}/session_${sessionIndex}_${pin}`;
      fs.mkdirSync(sessionDir, { recursive: true });

      // Step 1: GM builds a random map
      console.log(`[${sessionIndex}] GM is generating map...`);
      await gmPage.evaluate(() => {
         const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('GENERATE SQUEEZE'));
         if(btn) btn.click();
      });
      await gmPage.waitForTimeout(1000);
      await gmPage.screenshot({ path: `${sessionDir}/01_gm_map_generation.png` });

      // Step 2: GM simulates 7-player chaos
      console.log(`[${sessionIndex}] Triggering 7-Player Chaos Agent...`);
      await gmPage.evaluate(() => {
         const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('SIMULATE 7-PLAYER CHAOS'));
         if(btn) btn.click();
      });
      await gmPage.waitForTimeout(1500); // Wait for chaos to propagate
      await gmPage.screenshot({ path: `${sessionDir}/02_gm_chaos_view.png` });
      await specPage.screenshot({ path: `${sessionDir}/03_spectator_chaos_view.png` });

      // Step 3: Twitch Donation triggers heat spike
      console.log(`[${sessionIndex}] Simulating Twitch Donation Heat Spike...`);
      await specPage.evaluate(() => {
         const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('SIMULATE TWITCH DONATION'));
         if(btn) btn.click();
      });
      await gmPage.waitForTimeout(1000);
      
      // Step 4: Player 1 Uses the New Emergency Heal (Phase 3 Adapter)
      console.log(`[${sessionIndex}] Player 1 triggers Emergency Heal...`);
      // Dismiss the native browser alert that the logic creates so playwright doesn't hang
      p1Page.on('dialog', async dialog => {
          console.log(`[${sessionIndex}] Alert observed: ${dialog.message()}`);
          await dialog.accept();
      });

      await p1Page.evaluate(() => {
         const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('EMERGENCY HEAL'));
         if(btn) btn.click();
      });
      await gmPage.waitForTimeout(1000); // Wait for state mutation (equivalent exchange) to propagate

      // Final Screenshots
      await gmPage.screenshot({ path: `${sessionDir}/04_gm_post_heal.png` });
      await specPage.screenshot({ path: `${sessionDir}/05_spectator_trauma_alert.png` });
      await p1Page.screenshot({ path: `${sessionDir}/06_player1_post_heal.png` });

      console.log(`[${sessionIndex}] Session complete. Screenshots saved to ${sessionDir}`);
      await context.close();
  }

  await browser.close();
  console.log('\n--- 15 Massive Sessions Completed! ---');
})();
