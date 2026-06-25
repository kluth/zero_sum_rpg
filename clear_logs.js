import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const config = {
    databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};
const app = initializeApp(config);
const db = getDatabase(app);

async function run() {
    console.log("Clearing traumaLog...");
    await set(ref(db, `sessions/6060/gameState/traumaLog`), null);
    console.log("Done");
    process.exit(0);
}
run();
