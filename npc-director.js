const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue, push, get } = require('firebase/database');

const firebaseConfig = {
  projectId: "zero-sum-rpg-2026",
  appId: "1:941946145190:web:89539148cced56ecf42767",
  storageBucket: "zero-sum-rpg-2026.firebasestorage.app",
  apiKey: "AIzaSyCAPKXPuhtVJ48dXIP5ZlEXk5jI_3fpWd0",
  databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const PIN = process.argv[2] || '6060';

console.log(`[NPC Director] Initializing connection to session ${PIN}...`);

let gameState = null;

// Listen to game state
onValue(ref(db, `sessions/${PIN}/gameState`), (snapshot) => {
    gameState = snapshot.val();
});

// Roles memory to give NPCs some personality/goals
const npcMemory = {};

function pushAction(action) {
    push(ref(db, `sessions/${PIN}/apiQueue`), action);
}

// Tick loop every 3 seconds
setInterval(() => {
    if (!gameState || !gameState.characters) return;
    
    const chars = gameState.characters;
    const grid = gameState.map?.grid || {};
    
    Object.keys(chars).forEach(charId => {
        const char = chars[charId];
        
        // Ensure memory exists
        if (!npcMemory[charId]) {
            // Assign random role: Guard (patrols), Worker (rotates/works), Civilian (wanders rarely)
            const isNpc = charId.startsWith('npc_');
            if (isNpc) {
                const r = Math.random();
                let role = 'CIVILIAN';
                if (r > 0.6) role = 'GUARD';
                else if (r > 0.3) role = 'WORKER';
                
                npcMemory[charId] = {
                    role: role,
                    lastMoved: Date.now(),
                    originX: char.x,
                    originY: char.y
                };
            } else {
                // Players
                npcMemory[charId] = { role: 'PLAYER', lastMoved: Date.now(), lastX: char.x, lastY: char.y };
            }
        }
        
        const mem = npcMemory[charId];
        
        // Logic based on role
        if (mem.role === 'PLAYER') {
            // Check if player hasn't moved in a while (e.g., 10 seconds), make them look around
            if (char.x !== mem.lastX || char.y !== mem.lastY) {
                mem.lastX = char.x;
                mem.lastY = char.y;
                mem.lastMoved = Date.now();
            } else if (Date.now() - mem.lastMoved > 10000 && Math.random() > 0.7) {
                // Look around randomly
                const newRot = char.rotation + (Math.random() * Math.PI/2 - Math.PI/4);
                pushAction({ type: 'TURN', playerId: charId, rotation: newRot });
            }
        } else if (mem.role === 'GUARD') {
            // Guards patrol frequently
            if (Math.random() > 0.5) {
                // Move 1 step randomly, avoiding walls
                const dirs = [ {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1} ];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                const nextX = char.x + dir.dx;
                const nextY = char.y + dir.dy;
                const cell = grid[`${nextX},${nextY}`];
                if (cell && cell.type !== 'wall' && cell.type !== 'structure_wall') {
                    pushAction({ type: 'MOVE', playerId: charId, dx: dir.dx, dy: dir.dy });
                } else {
                    // Turn to face the wall
                    const rot = Math.atan2(dir.dy, dir.dx);
                    pushAction({ type: 'TURN', playerId: charId, rotation: rot });
                }
            } else if (Math.random() > 0.5) {
                pushAction({ type: 'TURN', playerId: charId, rotation: char.rotation + Math.PI/2 });
            }
        } else if (mem.role === 'WORKER') {
            // Workers mostly stay in place and turn, rarely move
            if (Math.random() > 0.8) {
                pushAction({ type: 'TURN', playerId: charId, rotation: Math.random() * Math.PI * 2 });
            }
        } else if (mem.role === 'CIVILIAN') {
            // Civilians wander around their origin slowly
            if (Math.random() > 0.9) {
                const dirs = [ {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1} ];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                const nextX = char.x + dir.dx;
                const nextY = char.y + dir.dy;
                const cell = grid[`${nextX},${nextY}`];
                if (cell && cell.type !== 'wall' && cell.type !== 'structure_wall') {
                    // Keep them close to origin
                    const dist = Math.abs(nextX - mem.originX) + Math.abs(nextY - mem.originY);
                    if (dist <= 3) {
                        pushAction({ type: 'MOVE', playerId: charId, dx: dir.dx, dy: dir.dy });
                    }
                }
            }
        }
    });

}, 4000); // Act every 4 seconds

console.log("[NPC Director] Simulation loop active. Press Ctrl+C to stop.");
