const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push } = require('firebase/database');

const firebaseConfig = {
  projectId: "zero-sum-rpg-2026",
  appId: "1:941946145190:web:89539148cced56ecf42767",
  storageBucket: "zero-sum-rpg-2026.firebasestorage.app",
  apiKey: "AIzaSyCAPKXPuhtVJ48dXIP5ZlEXk5jI_3fpWd0",
  databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PIN = '4041';

async function run() {
    const qRef = ref(db, `sessions/${PIN}/apiQueue`);
    
    console.log("Pushing action 1 (MOVE)...");
    await push(qRef, {"playerId":"p1","type":"MOVE","payload":{"dx":3,"dy":0,"weight":15}});
    
    console.log("Pushing action 2 (MOVE)...");
    await push(qRef, {"playerId":"p2","type":"MOVE","payload":{"dx":0,"dy":5,"weight":25}});
    
    console.log("Pushing action 3 (ACTION)...");
    await push(qRef, {"playerId":"p1","type":"ACTION","payload":{"actionType":"fire","targetX":10,"targetY":10,"weaponNoise":80}});
    
    console.log("Actions pushed. Wait a few seconds then kill this process.");
    setTimeout(() => process.exit(0), 2000);
}

run();
