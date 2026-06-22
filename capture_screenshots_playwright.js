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

  // 1. LOBBY
  await gmPage.goto('http://localhost:4200/');
  await gmPage.waitForSelector('.lobby-container');
  await gmPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_0_lobby.png' });
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
  await gmPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase0_1_gm_placing.png' });
  
  // Select MedBay and place
  await gmPage.evaluate(() => {
     const blocks = document.querySelectorAll('.prefab-block');
     for(let b of blocks) { if(b.innerText.includes('MedBay')) b.click(); }
  });
  await gmPage.mouse.click(box.x + 300, box.y + 250);
  await gmPage.waitForTimeout(500);
  await gmPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase0_2_gm_placing.png' });

  // Generate Squeeze
  await gmPage.evaluate(() => {
     const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('GENERATE SQUEEZE'));
     if(btn) btn.click();
  });
  await gmPage.waitForTimeout(500);
  await gmPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase0_3_gm_generated.png' });

  // Sync
  await gmPage.evaluate(() => {
     const btn = Array.from(document.querySelectorAll('.cyber-button')).find(b => b.innerText.includes('SYNC GRID'));
     if(btn) btn.click();
  });
  await gmPage.waitForTimeout(2000);
  console.log('Saved Phase 0 screenshots.');

  // Take Phase 1 Screenshots (After Sync)
  await gmPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase1_1_gm.png' });
  await specPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase1_2_spectator.png' });
  await billPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase1_3_billboard.png' });
  await netPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase1_4_netrunner.png' });
  console.log('Saved Phase 1 screenshots.');

  // --- PHASE 2: CRISIS EVENT (Heat up, Netrunner hack) ---
  // GM increases heat to 9
  await gmPage.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('.cyber-button'));
     const plus = btns.find(b => b.innerText === '+');
     for(let i=0; i<8; i++) { if(plus) plus.click(); }
  });
  
  // Netrunner runs overload
  await netPage.fill('input', 'overload');
  await netPage.keyboard.press('Enter');
  
  await gmPage.waitForTimeout(2000); // wait for syncs
  
  // Take Phase 2 Screenshots
  await gmPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase2_1_gm.png' });
  await specPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase2_2_spectator.png' });
  await billPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase2_3_billboard.png' });
  await netPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase2_4_netrunner.png' });
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
  await gmPage.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase3_1_gm_chaos.png' });
  await p1Page.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase3_2_player1.png' });
  await p2Page.screenshot({ path: '/home/matthias/.gemini/antigravity-cli/brain/5d20c266-f3bf-43ba-b50f-a0640a3ef24d/screenshot_phase3_3_player2.png' });
  console.log('Saved Phase 3 screenshots.');

  await browser.close();
  console.log('Done capturing playwright session screenshots.');
})();
