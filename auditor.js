const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  projectId: "zero-sum-rpg-2026",
  appId: "1:941946145190:web:89539148cced56ecf42767",
  storageBucket: "zero-sum-rpg-2026.firebasestorage.app",
  apiKey: "AIzaSyCAPKXPuhtVJ48dXIP5ZlEXk5jI_3fpWd0",
  databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PIN = process.argv[2];
if (!PIN) {
    console.error("Usage: node auditor.js <SESSION_PIN>");
    process.exit(1);
}

async function auditSession() {
    console.log(`\n==============================================`);
    console.log(`[AUDITOR] ANALYZING SESSION LOGS: ${PIN}`);
    console.log(`==============================================\n`);

    const stateRef = ref(db, `sessions/${PIN}/gameState`);
    const snap = await get(stateRef);
    
    if (!snap.exists()) {
        console.error(`[AUDITOR] Error: No data found for session ${PIN}`);
        process.exit(1);
    }

    const state = snap.val();
    
    // 1. Core State
    console.log(`--- POST-MORTEM CORE METRICS ---`);
    console.log(`Final Heat Level:   ${state.heatLevel || 1}/10`);
    console.log(`Chaos Market Value: $${state.chaosMarketValue || 0}`);
    
    // 2. Character Analysis
    let totalHpLost = 0;
    let totalStressGained = 0;
    let deaths = 0;
    const chars = state.characters || {};
    
    console.log(`\n--- SQUAD VITALITY ANALYSIS ---`);
    for (const [id, char] of Object.entries(chars)) {
        const hp = char.stats ? char.stats.hp_current : (char.hp || 100);
        const stress = char.stats ? char.stats.stress_current : (char.stress || 0);
        
        console.log(`[${char.name || id}] HP: ${hp}, Stress: ${stress}, Position: (${char.x}, ${char.y})`);
        
        if (hp < 100) totalHpLost += (100 - hp);
        if (stress > 0) totalStressGained += stress;
        if (hp <= 0) deaths++;
    }
    
    console.log(`\nSquad Performance:`);
    console.log(`- Total HP Lost:       ${totalHpLost}`);
    console.log(`- Total Stress Loaded: ${totalStressGained}`);
    console.log(`- Fatalities:          ${deaths}`);
    
    if (deaths > 0) {
        console.log(`[!] CRITICAL WARNING: Session resulted in operator deaths. Review tactical choices.`);
    }

    // 3. Trauma Log
    const logs = state.traumaLog ? Object.values(state.traumaLog) : [];
    console.log(`\n--- INCIDENT LOGS (${logs.length} events) ---`);
    let warnings = 0;
    let errors = 0;
    let aiEvents = 0;
    let ruleViolations = 0;
    
    for (const log of logs) {
        if (log.severity === 'WARNING') warnings++;
        if (log.severity === 'FATAL') errors++;
        if (log.civilian === 'AI OVERLORD') aiEvents++;
        if (log.message && log.message.includes("out of stamina")) {
            ruleViolations++;
        }
    }
    
    console.log(`- System Warnings:  ${warnings}`);
    console.log(`- Fatal Errors:     ${errors}`);
    console.log(`- AI Interventions: ${aiEvents}`);
    console.log(`- Rule Violations:  ${ruleViolations} (e.g. movement over encumbrance)`);
    
    if (warnings > 10) {
        console.log(`[!] NOTICE: High volume of warnings. Check agent rules logic.`);
    }
    if (ruleViolations > 0) {
        console.log(`[!] AUDIT FLAG: ${ruleViolations} instances of rule violations detected!`);
    }
    
    // 4. Sensory Traces
    console.log(`\n--- SENSORY FOOTPRINT ---`);
    const fov = state.sensoryData?.fov || {};
    let fovCellsCount = 0;
    for (const playerFov of Object.values(fov)) {
        if (Array.isArray(playerFov)) fovCellsCount += playerFov.length;
    }
    const acoustics = state.sensoryData?.acoustics || [];
    const ballistics = state.sensoryData?.ballistics || [];
    
    console.log(`- Optics:     ${fovCellsCount} total player cells currently visible.`);
    console.log(`- Acoustics:  ${acoustics.length} recent sound waves tracked.`);
    console.log(`- Ballistics: ${ballistics.length} projectile trajectories tracked.`);
    
    console.log(`\n==============================================`);
    console.log(`[AUDITOR] ANALYSIS COMPLETE`);
    console.log(`==============================================\n`);
    
    process.exit(0);
}

auditSession();
