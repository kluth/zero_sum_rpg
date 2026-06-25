import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const config = {
    databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};
const app = initializeApp(config);
const db = getDatabase(app);

async function run() {
    const snap = await get(ref(db, `sessions/6060/gameState/traumaLog`));
    console.log(JSON.stringify(snap.val(), null, 2));
    process.exit(0);
}
run();
