import { Injectable, signal } from '@angular/core';


export interface PendingAction {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'resolved' | 'failed';
}

@Injectable({ providedIn: 'root' })
export class ActionQueueService {
  private queue = signal<PendingAction[]>([]);
  public isLocked = signal<boolean>(false);

  // Enqueues an action and locks the UI to prevent spamming/desync
  public async dispatchAction(sessionId: string, playerId: string, type: string, payload: any): Promise<void> {
    if (this.isLocked()) {
       console.warn('Action queue is locked. Wait for the server to acknowledge.');
       return;
    }

    const actionId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    this.queue.update(q => [...q, { id: actionId, type, payload, status: 'pending' }]);
    this.isLocked.set(true); // Lock optimistic updates

    try {
      const { getDatabase, ref, push } = await import('firebase/database');
      const db = getDatabase();
      const queueRef = ref(db, `sessions/${sessionId}/actionQueue`);
      
      // Push the action to the secure queue for the GM/Backend to resolve
      await push(queueRef, {
        playerId,
        type,
        payload,
        apCost: payload.apCost || 1,
        timestamp: Date.now()
      });

      // Unlock happens when the server state syncs back via Firebase onValue listener
      // For now, we simulate an optimistic unlock after 500ms to keep it playable
      setTimeout(() => {
         this.resolveAction(actionId, 'resolved');
      }, 500);

    } catch (error) {
      console.error('Action rejected by Firebase Security Rules:', error);
      this.resolveAction(actionId, 'failed');
    }
  }

  public resolveAction(id: string, status: 'resolved' | 'failed') {
    this.queue.update(q => q.map(a => a.id === id ? { ...a, status } : a));
    
    // If no pending actions remain, unlock the UI
    const hasPending = this.queue().some(a => a.status === 'pending');
    if (!hasPending) {
       this.isLocked.set(false);
    }
  }
}
