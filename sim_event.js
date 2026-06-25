import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';

const config = {
    databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};
const app = initializeApp(config);
const db = getDatabase(app);

async function run() {
    console.log("Pushing trauma log...");
    await push(ref(db, `sessions/6060/gameState/traumaLog`), {
        timestamp: Date.now(),
        civilian: 'p1',
        action: 'TEST',
        severity: 'CRITICAL',
        message: 'This is a persistent test event.'
    });
    console.log("Done");
    process.exit(0);
}
run();
