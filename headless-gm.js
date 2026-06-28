const readline = require('readline');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onChildAdded, remove, set, get, push } = require('firebase/database');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const util = require('util');

// Initialize Agent Network Clients
const opticsProtoPath = path.resolve(__dirname, 'contracts/protobuf/optics.proto');
const mechanicsProtoPath = path.resolve(__dirname, 'contracts/protobuf/mechanics.proto');
const acousticsProtoPath = path.resolve(__dirname, 'contracts/protobuf/acoustics.proto');

let calculateEncumbranceAsync, calculateTrajectoryAsync, calculateFOVAsync, soundPropagationAsync;

try {
    const opticsPackage = protoLoader.loadSync(opticsProtoPath, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [path.resolve(__dirname, 'contracts/protobuf')] });
    const mechanicsPackage = protoLoader.loadSync(mechanicsProtoPath, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [path.resolve(__dirname, 'contracts/protobuf')] });
    const acousticsPackage = protoLoader.loadSync(acousticsProtoPath, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [path.resolve(__dirname, 'contracts/protobuf')] });

    const opticsProto = grpc.loadPackageDefinition(opticsPackage).zero_sum.optics;
    const mechanicsProto = grpc.loadPackageDefinition(mechanicsPackage).zero_sum.mechanics;
    const acousticsProto = grpc.loadPackageDefinition(acousticsPackage).zero_sum.acoustics;

    const opticsClient = new opticsProto.OpticsService('localhost:50051', grpc.credentials.createInsecure());
    const acousticsClient = new acousticsProto.AcousticsService('localhost:50053', grpc.credentials.createInsecure());
    const mechanicsClient = new mechanicsProto.MechanicsService('localhost:50054', grpc.credentials.createInsecure());

    calculateEncumbranceAsync = util.promisify(mechanicsClient.CalculateEncumbrance).bind(mechanicsClient);
    calculateTrajectoryAsync = util.promisify(mechanicsClient.CalculateTrajectory).bind(mechanicsClient);
    calculateFOVAsync = util.promisify(opticsClient.CalculateFieldOfView).bind(opticsClient);
    soundPropagationAsync = util.promisify(acousticsClient.GetHearingRange).bind(acousticsClient);
} catch (e) {
    // Ignore protobuf load errors in standalone testing
}

const firebaseConfig = {
  projectId: "zero-sum-rpg-2026",
  appId: "1:941946145190:web:89539148cced56ecf42767",
  storageBucket: "zero-sum-rpg-2026.firebasestorage.app",
  apiKey: "AIzaSyCAPKXPuhtVJ48dXIP5ZlEXk5jI_3fpWd0",
  databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const PIN = process.argv[2] || '4040';

const colors = {
    reset: "\x1b[0m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
    blue: "\x1b[34m", magenta: "\x1b[35m", cyan: "\x1b[36m", white: "\x1b[37m",
    dim: "\x1b[2m", bold: "\x1b[1m", bgRed: "\x1b[41m", bgBlue: "\x1b[44m", bgBlack: "\x1b[40m"
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let bandwidthMB = 150.0;
let fieldAgents = 4;
let morale = 75;
let turn = 1;
let martialLawActive = true;
let isPrompting = false;

const typeWriter = async (text, speed = 10) => {
    for (let i = 0; i < text.length; i++) {
        process.stdout.write(text.charAt(i));
        await sleep(speed);
    }
    console.log();
};

const printHeader = () => {
    console.clear();
    console.log(colors.cyan + colors.bold);
    console.log(`╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║          [ COMMAND CENTER UPLINK ] - ZERO-SUM RPG              ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝`);
    console.log(colors.reset);
    console.log(`  SESSION PIN:  ${colors.yellow}${PIN}${colors.reset}`);
    console.log(`  STATUS:       ${martialLawActive ? colors.bgRed + colors.white + ' MARTIAL LAW ACTIVE ' + colors.reset : colors.green + 'STABLE' + colors.reset}`);
    console.log(`  SATELLITE BW: ${bandwidthMB < 30 ? colors.red + colors.bold : colors.green}${bandwidthMB.toFixed(2)} MB${colors.reset} REMAINING`);
    console.log(`  AGENTS ALIVE: ${colors.magenta}${fieldAgents}${colors.reset}`);
    console.log(`  MORALE:       ${morale < 30 ? colors.red : colors.blue}${morale}%${colors.reset}`);
    console.log(colors.dim + `──────────────────────────────────────────────────────────────────` + colors.reset);
};

const updateGameStateDB = async (logMsg, mbCost = 0) => {
    bandwidthMB -= mbCost;
    try {
        await push(ref(db, `sessions/${PIN}/gameState/traumaLog`), {
            timestamp: Date.now(),
            civilian: "UPLINK",
            severity: "CRITICAL",
            message: logMsg
        });
    } catch (e) {}
    
    if (bandwidthMB <= 0) {
        bandwidthMB = 0;
        printHeader();
        await typeWriter(colors.red + colors.bold + "\n[CRITICAL ERROR] SATELLITE BANDWIDTH DEPLETED. UPLINK SEVERED." + colors.reset, 30);
        await typeWriter(colors.red + "[FATAL] You have abandoned your agents. The mission is compromised." + colors.reset, 30);
        process.exit(0);
    }
};

const processQueueAction = async (action, snapshotRef) => {
    if (!action) return;
    
    // Wait for prompt to be free
    while(isPrompting) await sleep(500);
    isPrompting = true;
    
    printHeader();
    await typeWriter(colors.yellow + `\n[INCOMING] Action requested by Agent ${action.playerId}: ${action.type}` + colors.reset);
    
    if (action.type === 'MOVE') {
        console.log(`Agent wants to move dx:${action.dx}, dy:${action.dy}.`);
        console.log(`1. Approve movement (-0.5 MB)`);
        console.log(`2. Deny movement (Save bandwidth, -Morale)`);
        
        let choice = await askQuestion(colors.cyan + "> " + colors.reset);
        if (choice.trim() === '1') {
            await typeWriter(colors.green + "Movement approved." + colors.reset);
            await updateGameStateDB(`Approved movement for ${action.playerId}`, 0.5);
            
            // Execute the movement logic from old headless-gm
            const pId = action.playerId;
            const charRef = ref(db, `sessions/${PIN}/gameState/characters/${pId}`);
            const charSnap = await get(charRef);
            if (charSnap.exists()) {
                const char = charSnap.val();
                const newX = (char.x || 0) + (action.dx || 0);
                const newY = (char.y || 0) + (action.dy || 0);
                await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/x`), newX);
                await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/y`), newY);
            }
        } else {
            await typeWriter(colors.red + "Movement denied." + colors.reset);
            morale -= 5;
            await updateGameStateDB(`Denied movement for ${action.playerId}`, 0);
        }
    } else if (action.type === 'ACTION') {
        console.log(`Agent wants to perform action: ${action.payload}`);
        console.log(`1. Authorize action (-2.5 MB)`);
        console.log(`2. Veto action (-Morale)`);
        
        let choice = await askQuestion(colors.cyan + "> " + colors.reset);
        if (choice.trim() === '1') {
            await typeWriter(colors.green + "Action authorized." + colors.reset);
            await updateGameStateDB(`Authorized action: ${action.payload} for ${action.playerId}`, 2.5);
            
            if (String(action.payload || '').toUpperCase().includes("FIRE")) {
                const pId = action.playerId;
                const charRef = ref(db, `sessions/${PIN}/gameState/characters/${pId}`);
                const charSnap = await get(charRef);
                if (charSnap.exists() && calculateTrajectoryAsync) {
                    const char = charSnap.val();
                    try {
                        const targetX = char.x + Math.floor(Math.random() * 10 - 5);
                        const targetY = char.y + Math.floor(Math.random() * 10 - 5);
                        const trajectory = await calculateTrajectoryAsync({
                            origin: { x: char.x, y: char.y, z: 1 },
                            velocity: { dx: targetX - char.x, dy: targetY - char.y, dz: 0 },
                            mass: { kg: 0.05 }
                        });
                        if (trajectory) {
                             const balRef = ref(db, `sessions/${PIN}/gameState/sensoryData/ballistics`);
                             const balSnap = await get(balRef);
                             const currentBal = balSnap.val() || [];
                             currentBal.push(trajectory);
                             if (currentBal.length > 5) currentBal.shift();
                             await set(balRef, currentBal);
                        }
                    } catch(e) {}
                }
            }
        } else {
            await typeWriter(colors.red + "Action vetoed." + colors.reset);
            morale -= 10;
            await updateGameStateDB(`Vetoed action for ${action.playerId}`, 0);
        }
    } else {
        await typeWriter(colors.dim + `Auto-processing background task: ${action.type}... (-0.1 MB)` + colors.reset);
        await updateGameStateDB(`Processed ${action.type}`, 0.1);
    }
    
    await remove(snapshotRef);
    isPrompting = false;
    await sleep(500);
    triggerRandomEvent();
};

const triggerRandomEvent = async () => {
    if (isPrompting) return;
    
    const shouldTrigger = Math.random() < 0.4;
    if (!shouldTrigger) {
        showIdleMenu();
        return;
    }

    isPrompting = true;
    
    const events = [
        {
            title: "CIVILIAN CASUALTIES IN SECTOR 4",
            desc: "A drone strike missed its target. Civilians are trapped under rubble. Your field team is nearby but heavily traumatized.",
            options: [
                { text: "Send team to rescue (+Morale, High Trauma risk, -15MB bandwidth)", cost: 15, mDelta: 15, aDelta: (Math.random() > 0.7 ? -1 : 0) },
                { text: "Ignore and proceed with mission (-Morale, -5MB bandwidth)", cost: 5, mDelta: -20, aDelta: 0 }
            ]
        },
        {
            title: "SATELLITE INTERFERENCE",
            desc: "Martial law jammers are scrambling our uplink. We need to boost the signal or risk losing comms.",
            options: [
                { text: "Boost signal (-25MB bandwidth)", cost: 25, mDelta: 5, aDelta: 0 },
                { text: "Conserve bandwidth, let agents operate blind (-Morale, risk of agent death)", cost: 0, mDelta: -10, aDelta: (Math.random() > 0.5 ? -1 : 0) }
            ]
        },
        {
            title: "AGENT TRAUMA BREAKDOWN",
            desc: "Agent 'Viper' is having a severe PTSD episode. They are compromising the stealth operation.",
            options: [
                { text: "Remotely administer sedatives (-10MB bandwidth for medical uplink)", cost: 10, mDelta: -5, aDelta: 0 },
                { text: "Order team to leave Viper behind (-Morale, -1 Agent)", cost: 2, mDelta: -25, aDelta: -1 }
            ]
        },
        {
            title: "MARTIAL LAW ESCALATION",
            desc: "Local enforcers have instituted a shoot-on-sight curfew. Enemy patrols doubled.",
            options: [
                { text: "Upload updated tactical maps (-12MB bandwidth)", cost: 12, mDelta: 0, aDelta: 0 },
                { text: "Rely on outdated intel (-Morale, risk of ambush)", cost: 0, mDelta: -15, aDelta: (Math.random() > 0.4 ? -1 : 0) }
            ]
        },
        {
            title: "SUPPLY DROP COMPROMISED",
            desc: "A vital supply drop was intercepted by military police. Your agents are low on ammo.",
            options: [
                { text: "Hack supply manifest to reroute (-20MB bandwidth)", cost: 20, mDelta: 10, aDelta: 0 },
                { text: "Order agents to scavenge (-Morale, risk of injury)", cost: 0, mDelta: -10, aDelta: (Math.random() > 0.5 ? -1 : 0) }
            ]
        }
    ];

    const ev = events[Math.floor(Math.random() * events.length)];
    
    printHeader();
    await typeWriter(colors.bgRed + colors.white + colors.bold + `\n>>> CRITICAL INCIDENT: ${ev.title} <<<` + colors.reset);
    await typeWriter(colors.white + ev.desc + colors.reset);
    console.log();
    
    for (let i = 0; i < ev.options.length; i++) {
        console.log(`  [${i + 1}] ${ev.options[i].text}`);
    }
    
    console.log();
    let choice = -1;
    while (choice < 0 || choice >= ev.options.length) {
        const ans = await askQuestion(colors.cyan + "COMMAND> " + colors.reset);
        choice = parseInt(ans) - 1;
    }
    
    const selected = ev.options[choice];
    morale += selected.mDelta;
    fieldAgents += selected.aDelta;
    
    await typeWriter(colors.dim + `\nExecuting directive... (-${selected.cost} MB)` + colors.reset);
    await updateGameStateDB(`Uplink executed directive: ${ev.title} - Choice: ${choice+1}`, selected.cost);
    
    checkGameOver();
    isPrompting = false;
    await sleep(1000);
    showIdleMenu();
};

const showIdleMenu = async () => {
    if (isPrompting) return;
    isPrompting = true;
    printHeader();
    console.log(colors.dim + "Waiting for Agent Network pings or events...\n" + colors.reset);
    console.log(`[1] Run Diagnostics (-1 MB)`);
    console.log(`[2] Send Motivational Broadcast (+Morale, -5 MB)`);
    console.log(`[3] Pass Time`);
    console.log(`[4] Terminate Uplink (Quit)`);
    
    const ans = await askQuestion(colors.cyan + "IDLE COMMAND> " + colors.reset);
    
    if (ans.trim() === '1') {
        await typeWriter(colors.green + "Systems nominal. Signal stable." + colors.reset);
        await updateGameStateDB("Ran diagnostics", 1);
    } else if (ans.trim() === '2') {
        morale += 10;
        if (morale > 100) morale = 100;
        await typeWriter(colors.blue + "Broadcast sent. Morale improved." + colors.reset);
        await updateGameStateDB("Sent motivational broadcast", 5);
    } else if (ans.trim() === '4') {
        console.log(colors.red + "Terminating Uplink..." + colors.reset);
        process.exit(0);
    } else {
        await updateGameStateDB("Passed time", 0);
    }
    
    turn++;
    isPrompting = false;
    triggerRandomEvent();
};

const checkGameOver = () => {
    if (fieldAgents <= 0) {
        printHeader();
        console.log(colors.red + colors.bold + "\n[FATAL] All field agents KIA. Operation Failed." + colors.reset);
        process.exit(0);
    }
    
    if (morale <= 0) {
        printHeader();
        console.log(colors.red + colors.bold + "\n[FATAL] Team morale broken. Agents mutinied. Operation Failed." + colors.reset);
        process.exit(0);
    }
};

const initGame = async () => {
    console.clear();
    await typeWriter(colors.green + "Establishing secure connection to Agent Network..." + colors.reset);
    await sleep(500);
    
    try {
        const mapRef = ref(db, `sessions/${PIN}/gameState/map`);
        const mapSnap = await get(mapRef);
        if (!mapSnap.exists()) {
            await typeWriter(colors.dim + "Initializing tactical grid..." + colors.reset);
            const grid = {};
            for(let x=0; x<30; x++) {
                for(let y=0; y<30; y++) {
                    grid[`${x},${y}`] = { x, y, type: Math.random() > 0.8 ? 'wall' : 'corridor' };
                }
            }
            await set(mapRef, { dimensions: { width: 30, height: 30 }, grid: grid, rooms: {} });
        }
        
        const charsRef = ref(db, `sessions/${PIN}/gameState/characters`);
        const charsSnap = await get(charsRef);
        if (!charsSnap.exists() || Object.keys(charsSnap.val()).length === 0) {
            const initialChars = {};
            for(let i=0; i<fieldAgents; i++) {
                initialChars[`agent_${i}`] = {
                    name: `Agent-${100+i}`,
                    x: Math.floor(Math.random() * 26) + 2,
                    y: Math.floor(Math.random() * 26) + 2,
                    hp: 100, stamina: 5, injuries: 0, inventoryWeight: 10,
                    rotation: Math.random() * Math.PI * 2
                };
            }
            await set(charsRef, initialChars);
        }
    } catch(e) {
        await typeWriter(colors.red + "Firebase auth failed, proceeding in offline simulation..." + colors.reset);
    }

    await sleep(500);
    await typeWriter(colors.green + "Uplink Established. You are the Commander." + colors.reset);
    await sleep(1000);
    
    const queueRef = ref(db, `sessions/${PIN}/apiQueue`);
    onChildAdded(queueRef, (snapshot) => {
        processQueueAction(snapshot.val(), snapshot.ref);
    });
    
    triggerRandomEvent();
};

// Catch ctrl+c to exit gracefully
rl.on('SIGINT', () => {
    console.log(colors.red + "\nTerminating Uplink..." + colors.reset);
    process.exit(0);
});

initGame();
