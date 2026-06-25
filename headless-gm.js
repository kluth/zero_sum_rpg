const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onChildAdded, remove, set, get, push } = require('firebase/database');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Initialize Agent Network Clients
const opticsProtoPath = path.resolve(__dirname, 'contracts/protobuf/optics.proto');
const mechanicsProtoPath = path.resolve(__dirname, 'contracts/protobuf/mechanics.proto');
const acousticsProtoPath = path.resolve(__dirname, 'contracts/protobuf/acoustics.proto');

const opticsPackage = protoLoader.loadSync(opticsProtoPath, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [path.resolve(__dirname, 'contracts/protobuf')] });
const mechanicsPackage = protoLoader.loadSync(mechanicsProtoPath, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [path.resolve(__dirname, 'contracts/protobuf')] });
const acousticsPackage = protoLoader.loadSync(acousticsProtoPath, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true, includeDirs: [path.resolve(__dirname, 'contracts/protobuf')] });

const opticsProto = grpc.loadPackageDefinition(opticsPackage).zero_sum.optics;
const mechanicsProto = grpc.loadPackageDefinition(mechanicsPackage).zero_sum.mechanics;
const acousticsProto = grpc.loadPackageDefinition(acousticsPackage).zero_sum.acoustics;

const opticsClient = new opticsProto.OpticsService('localhost:50051', grpc.credentials.createInsecure());
const acousticsClient = new acousticsProto.AcousticsService('localhost:50053', grpc.credentials.createInsecure());
const mechanicsClient = new mechanicsProto.MechanicsService('localhost:50054', grpc.credentials.createInsecure());

const util = require('util');
const calculateEncumbranceAsync = util.promisify(mechanicsClient.CalculateEncumbrance).bind(mechanicsClient);
const calculateTrajectoryAsync = util.promisify(mechanicsClient.CalculateTrajectory).bind(mechanicsClient);
const calculateFOVAsync = util.promisify(opticsClient.CalculateFieldOfView).bind(opticsClient);
const soundPropagationAsync = util.promisify(acousticsClient.GetHearingRange).bind(acousticsClient);

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
          if (action.dx !== 0 || action.dy !== 0) {
              const rotation = Math.atan2(action.dy || 0, action.dx || 0);
              await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/rotation`), rotation);
          }
          await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/stamina`), newStamina);
          await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/maxStamina`), maxStamina);
          
          try {
               const fovRes = await calculateFOVAsync({
                   origin: { x: newX, y: newY, z: 1 },
                   range_meters: 10
               });
               if (fovRes && fovRes.fov && fovRes.fov.visible_cells) {
                   await set(ref(db, `sessions/${PIN}/gameState/sensoryData/fov/${pId}`), fovRes.fov.visible_cells);
               }
               
               // Heavy load = footsteps sound
               if (weight > 20) {
                   const soundRes = await soundPropagationAsync({
                      origin: { x: newX, y: newY, z: 1 },
                      source_intensity: { db: 40 + (weight - 20) },
                      hearing_threshold: { db: 0 }
                   });
                   if (soundRes && soundRes.audible_cells) {
                      const acoRef = ref(db, `sessions/${PIN}/gameState/sensoryData/acoustics`);
                      const acoSnap = await get(acoRef);
                      const currentAco = acoSnap.val() || [];
                      // Calculate max radius from audible cells
                      let maxRad = 0;
                      for (const cell of soundRes.audible_cells) {
                          const dist = Math.sqrt(Math.pow(cell.x - newX, 2) + Math.pow(cell.y - newY, 2));
                          if (dist > maxRad) maxRad = dist;
                      }
                      currentAco.push({ x: newX, y: newY, radius: maxRad || 5, type: "FOOTSTEPS", cells: soundRes.audible_cells });
                      if (currentAco.length > 5) currentAco.shift();
                      await set(acoRef, currentAco);
                   }
               }
          } catch (err) {
               console.error("[Agent Network] Sensory Agents Offline during MOVE.", err.message);
          }
          
      } else {
          // Bot is out of stamina, do not spam traumaLog
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
  } else if (type === 'TURN') {
    const rot = action.rotation;
    if (rot !== undefined) {
       await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/rotation`), rot);
       const charRef = ref(db, `sessions/${PIN}/gameState/characters/${pId}`);
       const charSnap = await get(charRef);
       if (charSnap.exists()) {
           const char = charSnap.val();
           try {
               const fovRes = await calculateFOVAsync({
                   origin: { x: char.x, y: char.y, z: 1 },
                   range_meters: 10
               });
               if (fovRes && fovRes.fov && fovRes.fov.visible_cells) {
                   await set(ref(db, `sessions/${PIN}/gameState/sensoryData/fov/${pId}`), fovRes.fov.visible_cells);
               }
           } catch (e) {
               console.error("[Agent Network] Optics Agent failed during TURN");
           }
       }
    }
  } else if (type === 'ACTION') {
    // Increase heat
    const heatRef = ref(db, `sessions/${PIN}/gameState/heatLevel`);
    const heatSnap = await get(heatRef);
    const newHeat = Math.min(10, (heatSnap.val() || 0) + 1);
    await set(heatRef, newHeat);
    
    // Check if ACTION is ATTACK, FIRE, or INVESTIGATE
    const pStr = String(action.payload || '').toUpperCase();
    const charsRef = ref(db, `sessions/${PIN}/gameState/characters/${pId}`);
    const charSnap = await get(charsRef);
    const char = charSnap.exists() ? charSnap.val() : { x: 0, y: 0 };
    
    if (pStr.includes("FIRE") || pStr.includes("ATTACK") || pStr.includes("SHOOT")) {
       try {
           const targetX = char.x + Math.floor(Math.random() * 10 - 5);
           const targetY = char.y + Math.floor(Math.random() * 10 - 5);
           const trajectory = await calculateTrajectoryAsync({
               origin: { x: char.x, y: char.y, z: 1 },
               velocity: { dx: targetX - char.x, dy: targetY - char.y, dz: 0 },
               mass: { kg: 0.05 }
           });
           
           if (trajectory && trajectory.path) {
                const mapRef = ref(db, `sessions/${PIN}/gameState/map/grid`);
                const mapSnap = await get(mapRef);
                const grid = mapSnap.exists() ? mapSnap.val() : {};
                
                let newPath = [];
                for (const pt of trajectory.path) {
                    newPath.push(pt);
                    const cellX = Math.round(pt.x);
                    const cellY = Math.round(pt.y);
                    const cell = grid[`${cellX},${cellY}`];
                    
                    if (cell && (cell.type === 'wall' || cell.type === 'structure_wall')) {
                        trajectory.collision_point = pt;
                        break;
                    }
                }
                trajectory.path = newPath;

                // Get existing ballistics
               const balRef = ref(db, `sessions/${PIN}/gameState/sensoryData/ballistics`);
               const balSnap = await get(balRef);
               const currentBal = balSnap.val() || [];
               currentBal.push(trajectory);
               if (currentBal.length > 5) currentBal.shift();
               await set(balRef, currentBal);
           }
           
           const rotation = Math.atan2(targetY - char.y, targetX - char.x);
           await set(ref(db, `sessions/${PIN}/gameState/characters/${pId}/rotation`), rotation);

           // Shooting also makes a loud sound
           const soundRes = await soundPropagationAsync({
              origin: { x: char.x, y: char.y, z: 1 },
              source_intensity: { db: 120 },
              hearing_threshold: { db: 0 }
           });
           
           if (soundRes && soundRes.audible_cells) {
              const acoRef = ref(db, `sessions/${PIN}/gameState/sensoryData/acoustics`);
              const acoSnap = await get(acoRef);
              const currentAco = acoSnap.val() || [];
              let maxRad = 0;
              for (const cell of soundRes.audible_cells) {
                  const dist = Math.sqrt(Math.pow(cell.x - char.x, 2) + Math.pow(cell.y - char.y, 2));
                  if (dist > maxRad) maxRad = dist;
              }
              currentAco.push({ x: char.x, y: char.y, radius: maxRad || 15, type: "GUNFIRE", cells: soundRes.audible_cells });
              if (currentAco.length > 5) currentAco.shift();
              await set(acoRef, currentAco);
           }
       } catch (err) {
           console.error("[Agent Network] Sensory Agents Offline during ACTION.", err);
       }
    }
    
    if (pStr.includes("LOOK") || pStr.includes("INVESTIGATE") || pStr.includes("SCAN")) {
       try {
           const fovRes = await calculateFOVAsync({
               origin: { x: char.x, y: char.y, z: 1 },
               range_meters: 10
           });
           if (fovRes && fovRes.fov && fovRes.fov.visible_cells) {
               await set(ref(db, `sessions/${PIN}/gameState/sensoryData/fov/${pId}`), fovRes.fov.visible_cells);
           }
       } catch (err) {
           console.error("[Agent Network] Optics Agent Offline during ACTION.", err);
       }
    }
    
    // Add trauma log
    await push(ref(db, `sessions/${PIN}/gameState/traumaLog`), {
      timestamp: Date.now(),
      civilian: pId,
      severity: "INFO",
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
    
    // Spawn NPCs if characters are empty
    const charsRef = ref(db, `sessions/${PIN}/gameState/characters`);
    const charsSnap = await get(charsRef);
    if (!charsSnap.exists() || Object.keys(charsSnap.val()).length === 0) {
        const initialChars = {};
        for(let i=0; i<8; i++) {
            initialChars[`npc_${i}`] = {
                name: `SecGuard-${100+i}`,
                x: Math.floor(Math.random() * 26) + 2,
                y: Math.floor(Math.random() * 26) + 2,
                hp: 100,
                baseMaxStamina: 5,
                stamina: 5,
                injuries: 0,
                inventoryWeight: 10,
                rotation: Math.random() * Math.PI * 2
            };
        }
        await set(charsRef, initialChars);
        console.log("[Headless GM] Spawned 8 test NPCs.");
    }
}
initMap();

console.log(`[Headless GM] Listening for AI network actions on apiQueue...`);
