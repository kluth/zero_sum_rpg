const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push } = require('firebase/database');

const firebaseConfig = {
  projectId: "zero-sum-rpg-2026",
  databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const PIN = process.argv[2] || '6060';

console.log(`[Player Bots] Dropping p1 and p2 into session ${PIN}...`);

function pushAction(action) {
    push(ref(db, `sessions/${PIN}/apiQueue`), action);
}

// Spawn them with a zero-move
pushAction({ type: 'MOVE', playerId: 'p1', dx: 0, dy: 0, weight: 15 });
pushAction({ type: 'MOVE', playerId: 'p2', dx: 0, dy: 0, weight: 15 });

setInterval(() => {
    // Player 1 moves and looks around
    if (Math.random() > 0.3) {
        const dirs = [ {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1} ];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        pushAction({ type: 'MOVE', playerId: 'p1', dx: dir.dx, dy: dir.dy, weight: 15 });
    } else {
        pushAction({ type: 'TURN', playerId: 'p1', rotation: Math.random() * Math.PI * 2 });
    }
    
    // Player 2 is more aggressive, moves and occasionally fires
    if (Math.random() > 0.4) {
        const dirs = [ {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1} ];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        pushAction({ type: 'MOVE', playerId: 'p2', dx: dir.dx, dy: dir.dy, weight: 20 });
    } else if (Math.random() > 0.95) { // Very rare firing now (5% chance)
        pushAction({ type: 'ACTION', playerId: 'p2', payload: 'FIRE' });
    } else {
        pushAction({ type: 'TURN', playerId: 'p2', rotation: Math.random() * Math.PI * 2 });
    }
}, 3000);

console.log("[Player Bots] Simulating player interactions. Press Ctrl+C to stop.");
