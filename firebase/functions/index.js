const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Anti-Cheat: Lock accounts that spam incorrect decryptions
exports.detectSpam = functions.database.ref('/sessions/{sessionId}/decryptionAttempts/{userId}/{attemptId}')
    .onCreate(async (snapshot, context) => {
        const userId = context.params.userId;
        const sessionId = context.params.sessionId;
        const attempt = snapshot.val();
        
        // Count how many failed attempts in the last 60 seconds
        const db = admin.database();
        const attemptsRef = db.ref(`/sessions/${sessionId}/decryptionAttempts/${userId}`);
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        const recentAttemptsSnap = await attemptsRef.orderByChild('timestamp').startAt(oneMinuteAgo).once('value');
        const attempts = recentAttemptsSnap.val() || {};
        
        let failedCount = 0;
        for (const key in attempts) {
            if (attempts[key].status === 'FAILED') {
                failedCount++;
            }
        }
        
        // If more than 5 failed attempts in 1 minute, lock the account
        if (failedCount > 5) {
            console.warn(`[ANTI-CHEAT] Locking user ${userId} in session ${sessionId} for spamming hashes.`);
            await db.ref(`/sessions/${sessionId}/gameState/characters/${userId}/status`).set('LOCKED');
            await db.ref(`/sessions/${sessionId}/gameState/characters/${userId}/isBlackout`).set(true);
        }
        
        return null;
    });
