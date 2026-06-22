const { firefox } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('Launching firefox...');
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  
  // Create pages
  const gmPage = await context.newPage();
  const specPage = await context.newPage();
  const billPage = await context.newPage();
  const netPage = await context.newPage();
  const p1Page = await context.newPage();
  const p2Page = await context.newPage();

  const targetDir = 'test_suite/screenshots';
  if (!fs.existsSync(targetDir)){
      fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. LOBBY
  await gmPage.goto('http://localhost:4200/');
  await gmPage.waitForSelector('.lobby-container');
  await gmPage.screenshot({ path: `${targetDir}/screenshot_0_lobby.png` });
  console.log('Saved lobby screenshot.');

  // Join GM
  await gmPage.fill('.pin-input', 'TESTING');
  await gmPage.evaluate(() => {
    const buttons = document.querySelectorAll('.cyber-button');
    for (let b of buttons) { if (b.innerText.includes('GM OVERRIDE')) b.click(); }
  });
  await gmPage.waitForSelector('.gm-panel', { timeout: 10000 });

  // Join Spectator
  await specPage.goto('http://localhost:4200/?session=TESTIN&mode=spectator');
  // Join Billboard
  await billPage.goto('http://localhost:4200/?session=TESTIN&mode=billboard');
  // Join Netrunner
  await netPage.goto('http://localhost:4200/?session=TESTIN&mode=netrunner');
  // Join Players
  await p1Page.goto('http://localhost:4200/?session=TESTIN&mode=player&player=p1');
  await p2Page.goto('http://localhost:4200/?session=TESTIN&mode=player&player=p2');

  await gmPage.waitForTimeout(2000);

  // --- PHASE 0: MAP CREATION PROCESS ---
  // Click on canvas to manually place a few blocks
  const canvas = await gmPage.$('canvas');
  const box = await canvas.boundingBox();
  
  // Select Corridor and place
  await gmPage.evaluate(() => {
     const blocks = document.querySelectorAll('.prefab-block');
     for(let b of blocks) { if(b.innerText.includes('Corridor')) b.click(); }
  });
  await gmPage.mouse.click(box.x + 200, box.y + 200);
  await gmPage.waitForTimeout(500);
  await gmPage.screenshot({ path: `${targetDir}/screenshot_phase0_1_gm_placing.png` });
  
  // Select MedBay and place
  await gmPage.evaluate(() => {
     const blocks = document.querySelectorAll('.prefab-block');
     for(let b of blocks) { if(b.innerText.includes('MedBay')) b.click(); }
  });
  await gmPage.mouse.click(box.x + 300, box.y + 250);
  await gmPage.waitForTimeout(500);
  await gmPage.screenshot({ path: `${targetDir}/screenshot_phase0_2_gm_placing.png` });

  // --- PROPERTIES TAB EDIT ---
  // Select the MedBay block to edit properties
  await gmPage.mouse.click(box.x + 300, box.y + 250);
  await gmPage.waitForTimeout(500);
  await gmPage.evaluate(() => {
     const tabs = document.querySelectorAll('.cyber-button');
     for(let t of tabs) { if(t.innerText.includes('PROPERTIES')) t.click(); }
  });
  await gmPage.waitForTimeout(500);
  // Modify room properties
  await gmPage.fill('input[type="text"]:not(.pin-input)', 'COMMAND_CTR');
  await gmPage.evaluate(() => {
     const selects = document.querySelectorAll('select');
     if (selects.length >= 2) {
         selects[0].value = 'flash_red_alert';
         selects[0].dispatchEvent(new Event('change'));
         selects[1].value = 'critical';
         selects[1].dispatchEvent(new Event('change'));
     }
  });
  await gmPage.waitForTimeout(500);
  await gmPage.evaluate(() => {
     const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('SYNC ROOM STATE'));
     if(btn) btn.click();
  });
  await gmPage.waitForTimeout(500);
  await gmPage.screenshot({ path: `${targetDir}/screenshot_phase0_properties_edit.png` });

  // WFC Generate Squeeze failure output
  await gmPage.evaluate(() => {
     const tabs = document.querySelectorAll('.cyber-button');
     for(let t of tabs) { if(t.innerText.includes('BUILDING BLOCKS')) t.click(); }
  });
  await gmPage.waitForTimeout(500);
  await gmPage.evaluate(() => {
     const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('GENERATE SQUEEZE'));
     if(btn) btn.click();
  });
  await gmPage.waitForTimeout(500);
  await gmPage.screenshot({ path: `${targetDir}/screenshot_phase0_wfc_failure.png` });
  await gmPage.screenshot({ path: `${targetDir}/screenshot_phase0_3_gm_generated.png` });

  // Paint some walls
  await gmPage.evaluate(() => {
     const tabs = document.querySelectorAll('.cyber-button');
     for(let t of tabs) { if(t.innerText.includes('TILE PAINTER')) t.click(); }
  });
  await gmPage.waitForTimeout(500);
  await gmPage.evaluate(() => {
     const blocks = document.querySelectorAll('.prefab-block');
     for(let b of blocks) { if(b.innerText.includes('Neon Wall')) b.click(); }
  });
  // Simulate drag paint
  await gmPage.mouse.move(box.x + 400, box.y + 400);
  await gmPage.mouse.down();
  await gmPage.mouse.move(box.x + 600, box.y + 400, { steps: 10 });
  await gmPage.mouse.up();
  await gmPage.waitForTimeout(500);
  await gmPage.screenshot({ path: `${targetDir}/screenshot_phase0_4_gm_painting.png` });

  // Sync
  await gmPage.evaluate(() => {
     const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('SYNC GRID'));
     if(btn) btn.click();
  });
  await gmPage.waitForTimeout(2000);
  console.log('Saved Phase 0 screenshots.');

  // Take Phase 1 Screenshots (After Sync)
  await gmPage.screenshot({ path: `${targetDir}/screenshot_phase1_1_gm.png` });
  await specPage.screenshot({ path: `${targetDir}/screenshot_phase1_2_spectator.png` });
  await billPage.screenshot({ path: `${targetDir}/screenshot_phase1_3_billboard.png` });
  await netPage.screenshot({ path: `${targetDir}/screenshot_phase1_4_netrunner.png` });
  console.log('Saved Phase 1 screenshots.');

  // --- PHASE 2: CRISIS EVENT (Heat up, Netrunner hack) ---
  // GM increases heat to 9
  await gmPage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('.cyber-button'));
     const plus = btns.find(b => b.innerText === '+');
     for(let i=0; i<8; i++) { if(plus) plus.click(); }
  });
  await gmPage.waitForTimeout(500);

  // Trigger trauma alarm
  await billPage.evaluate(async () => {
     await fetch('http://localhost:9000/sessions/TESTIN/gameState/traumaLog/t_1.json?ns=zero-sum-rpg-2026-default-rtdb', {
         method: 'PUT',
         body: JSON.stringify({ civilian: "Combat Medic Nakamura", timestamp: Date.now() })
     });
  });
  await billPage.waitForTimeout(2000);
  await billPage.screenshot({ path: `${targetDir}/screenshot_phase2_high_heat_alarm.png` });

  // Netrunner console help and grep commands
  // execute help
  await netPage.fill('input', 'help');
  await netPage.keyboard.press('Enter');
  await netPage.waitForTimeout(1500);
  await netPage.screenshot({ path: `${targetDir}/screenshot_phase2_netrunner_help.png` });

  // execute grep
  await netPage.fill('input', 'grep');
  await netPage.keyboard.press('Enter');
  await netPage.waitForTimeout(1500);
  await netPage.screenshot({ path: `${targetDir}/screenshot_phase2_netrunner_grep.png` });

  // execute overload (LLM-ICE output)
  await netPage.fill('input', 'overload');
  await netPage.keyboard.press('Enter');
  await netPage.waitForTimeout(1500);
  await netPage.screenshot({ path: `${targetDir}/screenshot_phase2_netrunner_overload.png` });

  // Netrunner BLE beacon connection attempt
  await netPage.evaluate(() => {
     const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('CONNECT BEACON'));
     if (btn) btn.click();
  });
  await netPage.waitForTimeout(1000);
  await netPage.screenshot({ path: `${targetDir}/screenshot_phase2_netrunner_ble_beacon.png` });

  // Twitch Donation simulator click
  await specPage.click('.donation-btn');
  await specPage.waitForTimeout(1000);
  await specPage.screenshot({ path: `${targetDir}/screenshot_phase2_twitch_donation.png` });
  
  // Take Phase 2 Screenshots
  await gmPage.screenshot({ path: `${targetDir}/screenshot_phase2_1_gm.png` });
  await specPage.screenshot({ path: `${targetDir}/screenshot_phase2_2_spectator.png` });
  await billPage.screenshot({ path: `${targetDir}/screenshot_phase2_3_billboard.png` });
  await netPage.screenshot({ path: `${targetDir}/screenshot_phase2_4_netrunner.png` });
  console.log('Saved Phase 2 screenshots.');

  // --- PHASE 3: 7-PLAYER CHAOS SESSION ---
  await gmPage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('.cyber-button'));
     const chaosBtn = btns.find(b => b.innerText.includes('SIMULATE 7-PLAYER CHAOS'));
     if (chaosBtn) chaosBtn.click();
  });

  // Let them run around for 5 seconds
  await gmPage.waitForTimeout(5000);

  // Take Phase 3 Screenshots
  await gmPage.screenshot({ path: `${targetDir}/screenshot_phase3_1_gm_chaos.png` });
  await p1Page.screenshot({ path: `${targetDir}/screenshot_phase3_2_player1.png` });
  await p2Page.screenshot({ path: `${targetDir}/screenshot_phase3_3_player2.png` });
  console.log('Saved Phase 3 screenshots.');

  await browser.close();
  console.log('Done capturing playwright session screenshots.');
})();
