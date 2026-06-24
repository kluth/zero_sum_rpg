const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onChildAdded, remove, set, get, push } = require('firebase/database');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Initialize Agent Network Clients
const opticsProtoPath = path.resolve(__dirname, 'contracts/protobuf/optics.proto');
const mechanicsProtoPath = path.resolve(__dirname, 'contracts/protobuf/mechanics.proto');

const opticsPackage = protoLoader.loadSync(opticsProtoPath, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [path.resolve(__dirname, 'contracts/protobuf')] });
const mechanicsPackage = protoLoader.loadSync(mechanicsProtoPath, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [path.resolve(__dirname, 'contracts/protobuf')] });

const opticsProto = grpc.loadPackageDefinition(opticsPackage).zero_sum.optics;
const mechanicsProto = grpc.loadPackageDefinition(mechanicsPackage).zero_sum.mechanics;

const opticsClient = new opticsProto.OpticsService('localhost:50051', grpc.credentials.createInsecure());
const mechanicsClient = new mechanicsProto.MechanicsService('localhost:50054', grpc.credentials.createInsecure());

const util = require('util');
const calculateEncumbranceAsync = util.promisify(mechanicsClient.CalculateEncumbrance).bind(mechanicsClient);

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

console.log(`[Headless GM] Initializing connection to session ${PIN}...`);

const queueRef = ref(db, `sessions/${PIN}/apiQueue`);

onChildAdded(queueRef, async (snapshot) => {
  const action = snapshot.val();
  if (!action) return;
  
  console.log(`[Headless GM] Processing:`, action);
  
  const pId = action.playerId;
  const type = action.type;
  
  if (type === 'MOVE') {
    const charRef = ref(db, `sessions/${PIN}/gameState/characters/${pId}`);
    const charSnap = await get(charRef);
    if (charSnap.exists()) {
      const char = charSnap.val();
      
      const injuries = char.injuries || 0;
      const weight = char.inventoryWeight || 0;
      const baseMax = char.baseMaxStamina || 5;

      let maxStamina = baseMax;
      try {
        const encumbranceResponse = await calculateEncumbranceAsync({
          total_weight: { kg: weight },
          base_movement_range: baseMax,
          injury_penalty: injuries
        });
        maxStamina = encumbranceResponse.actual_movement_range;
      } catch (err) {
        console.error("[Agent Network] Mechanics Agent failed/offline, using fallback:", err.message);
        const penalty = Math.floor(weight / 10) + injuries;
        maxStamina = Math.max(1, baseMax - penalty);
      }
      
      let stamina = char.stamina !== undefined ? char.stamina : maxStamina;
      
      const distance = Math.abs(action.dx || 0) + Math.abs(action.dy || 0);
      
      if (stamina >= distance) {
          const newX = (char.x || 0) + (action.dx || 0);
          const newY = (char.y || 0) + (action.dy || 0);
          const newStamina = stamina - distance;
          
          await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/x`), newX);
          await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/y`), newY);
          await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/stamina`), newStamina);
          await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/maxStamina`), maxStamina);
          
          // Add trauma log
          await push(ref(db, `sessions/${PIN}/gameState/traumaLog`), {
            timestamp: Date.now(),
            civilian: "SYSTEM",
            severity: "INFO",
            message: `Bot ${pId} relocated to ${newX}, ${newY}.`
          });
      } else {
          await push(ref(db, `sessions/${PIN}/gameState/traumaLog`), {
            timestamp: Date.now(),
            civilian: "SYSTEM",
            severity: "WARNING",
            message: `Bot ${pId} out of stamina! Needs ${distance}, has ${stamina}.`
          });
      }
    } else {
        // Init character if missing
        await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}`), {
           x: 10 + (action.dx || 0),
           y: 10 + (action.dy || 0),
           hp: 100,
           baseMaxStamina: 5,
           stamina: 5,
           injuries: 0,
           inventoryWeight: 0
        });
    }
  } else if (type === 'NEW_TURN') {
    const charsRef = ref(db, `sessions/${PIN}/gameState/characters`);
    const charsSnap = await get(charsRef);
    if (charsSnap.exists()) {
      const chars = charsSnap.val();
      for (const [id, char] of Object.entries(chars)) {
          const injuries = char.injuries || 0;
          const weight = char.inventoryWeight || 0;
          const baseMax = char.baseMaxStamina || 5;
          
          let maxStamina = baseMax;
          try {
            const encumbranceResponse = await calculateEncumbranceAsync({
              total_weight: { kg: weight },
              base_movement_range: baseMax,
              injury_penalty: injuries
            });
            maxStamina = encumbranceResponse.actual_movement_range;
          } catch (err) {
            console.error("[Agent Network] Mechanics Agent failed/offline, using fallback:", err.message);
            const penalty = Math.floor(weight / 10) + injuries;
            maxStamina = Math.max(1, baseMax - penalty);
          }
          
          await set(ref(db, `sessions/${PIN}/gameState/characters/${id}/stamina`), maxStamina);
          await set(ref(db, `sessions/${PIN}/gameState/characters/${id}/maxStamina`), maxStamina);
      }
    }
  } else if (type === 'ACTION') {
    // Increase heat
    const heatRef = ref(db, `sessions/${PIN}/gameState/heatLevel`);
    const heatSnap = await get(heatRef);
    const newHeat = (heatSnap.val() || 0) + 1;
    await set(heatRef, newHeat);
    
    // Add trauma log
    await push(ref(db, `sessions/${PIN}/gameState/traumaLog`), {
      timestamp: Date.now(),
      civilian: pId,
      severity: "WARNING",
      message: `Bot executed: ${action.payload}`
    });
  } else if (type === 'CHAT') {
    await push(ref(db, `sessions/${PIN}/gameState/traumaLog`), {
      timestamp: Date.now(),
      civilian: pId,
      severity: "INFO",
      message: `${action.payload}`
    });
  }
  
  await remove(snapshot.ref);
});

async function initMap() {
    const mapRef = ref(db, `sessions/${PIN}/gameState/map`);
    const mapSnap = await get(mapRef);
    if (!mapSnap.exists()) {
        const grid = {};
        for(let x=0; x<30; x++) {
            for(let y=0; y<30; y++) {
                grid[`${x},${y}`] = { x, y, type: Math.random() > 0.8 ? 'wall' : 'corridor' };
            }
        }
        await set(mapRef, {
            dimensions: { width: 30, height: 30 },
            grid: grid,
            rooms: {}
        });
        console.log("[Headless GM] Generated 30x30 initial map.");
    }
}
initMap();

console.log(`[Headless GM] Listening for AI network actions on apiQueue...`);
