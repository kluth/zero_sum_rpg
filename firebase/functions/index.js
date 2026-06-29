const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

// Anti-Cheat: Lock accounts that spam incorrect decryptions
exports.detectSpam = functions.firestore.document('sessions/{sessionId}/decryptionAttempts/{attemptId}')
    .onCreate(async (snap, context) => {
        const sessionId = context.params.sessionId;
        const attempt = snap.data();
        const userId = attempt.userId;
        
        // Count how many failed attempts in the last 60 seconds
        const db = admin.firestore();
        const attemptsRef = db.collection(`sessions/${sessionId}/decryptionAttempts`);
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        const recentAttemptsSnap = await attemptsRef
            .where('userId', '==', userId)
            .where('timestamp', '>=', oneMinuteAgo)
            .get();
            
        let failedCount = 0;
        recentAttemptsSnap.forEach(doc => {
            if (doc.data().status === 'FAILED') {
                failedCount++;
            }
        });
        
        // If more than 5 failed attempts in 1 minute, lock the account
        if (failedCount > 5) {
            console.warn(`[ANTI-CHEAT] Locking user ${userId} in session ${sessionId} for spamming hashes.`);
            await db.doc(`sessions/${sessionId}/gameState/characters/${userId}`).set({ status: 'LOCKED', isBlackout: true }, { merge: true });
        }
        
        return null;
    });
