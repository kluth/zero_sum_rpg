import { Injectable, signal } from '@angular/core';
import { Subject, concatMap, delay, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private dataChannels = new Map<string, RTCDataChannel>();
  
  public connectedPlayers = signal<string[]>([]);
  public incomingMessages = signal<{senderId: string, payload: any} | null>(null);
  
  // Lock-Step Queue for WebRTC Messages to prevent race conditions from rapid inputs (e.g. Chaos Agent Sabotage spam)
  private messageQueue = new Subject<{senderId: string, payload: any}>();

  constructor() {
    this.messageQueue.pipe(
      // Process sequentially with a 100ms lock-step buffer per message
      concatMap(msg => of(msg).pipe(delay(100)))
    ).subscribe(msg => {
      this.incomingMessages.set(msg);
    });
  }

  private sessionId: string | null = null;
  private myPlayerId: string | null = null;
  private isGm = false;

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  async initialize(sessionId: string, playerId: string, isGm: boolean) {
    this.sessionId = sessionId;
    this.myPlayerId = playerId;
    this.isGm = isGm;

    if (isGm) {
      await this.listenForPlayerOffers();
    } else {
      await this.initiateConnectionToGm();
    }
  }

  // ==========================================
  // HOST (GM) LOGIC
  // ==========================================
  private async listenForPlayerOffers() {
    if (!this.sessionId) return;
    const { getDatabase, ref, onChildAdded, set, onValue } = await import('firebase/database');
    const db = getDatabase();

    const offersRef = ref(db, `sessions/${this.sessionId}/webrtc/offers`);
    
    // Listen for new player offers
    onChildAdded(offersRef, async (snapshot) => {
      const playerId = snapshot.key;
      const offer = snapshot.val();
      if (!playerId || !offer) return;

      console.log(`[WebRTC] GM received offer from ${playerId}`);
      
      const pc = new RTCPeerConnection(this.configuration);
      this.peerConnections.set(playerId, pc);

      this.setupPeerConnectionListeners(pc, playerId);

      // Handle Data Channel created by the player
      pc.ondatachannel = (event) => {
        const channel = event.channel;
        this.setupDataChannel(channel, playerId);
        this.dataChannels.set(playerId, channel);
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send Answer back
      await set(ref(db, `sessions/${this.sessionId}/webrtc/answers/${playerId}`), {
        type: answer.type,
        sdp: answer.sdp
      });
      
      this.listenForIceCandidates(playerId, pc, 'player');
    });
  }

  // ==========================================
  // CLIENT (PLAYER) LOGIC
  // ==========================================
  private async initiateConnectionToGm() {
    if (!this.sessionId || !this.myPlayerId) return;
    const { getDatabase, ref, set, onValue } = await import('firebase/database');
    const db = getDatabase();

    console.log(`[WebRTC] Player ${this.myPlayerId} initiating connection to GM`);

    const pc = new RTCPeerConnection(this.configuration);
    this.peerConnections.set('GM', pc);

    this.setupPeerConnectionListeners(pc, 'GM');

    // Create Data Channel
    const channel = pc.createDataChannel('gameSync');
    this.setupDataChannel(channel, 'GM');
    this.dataChannels.set('GM', channel);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send Offer
    await set(ref(db, `sessions/${this.sessionId}/webrtc/offers/${this.myPlayerId}`), {
      type: offer.type,
      sdp: offer.sdp
    });

    // Listen for GM Answer
    const answerRef = ref(db, `sessions/${this.sessionId}/webrtc/answers/${this.myPlayerId}`);
    onValue(answerRef, async (snapshot) => {
      const answer = snapshot.val();
      if (answer && !pc.currentRemoteDescription) {
        console.log(`[WebRTC] Player received GM answer`);
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    this.listenForIceCandidates('GM', pc, 'gm');
  }

  // ==========================================
  // SHARED ICE & CHANNEL LOGIC
  // ==========================================
  private async setupPeerConnectionListeners(pc: RTCPeerConnection, peerId: string) {
    const { getDatabase, ref, push } = await import('firebase/database');
    const db = getDatabase();

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        const targetPath = this.isGm 
          ? `sessions/${this.sessionId}/webrtc/ice_candidates/${peerId}/gm`
          : `sessions/${this.sessionId}/webrtc/ice_candidates/${this.myPlayerId}/player`;
          
        await push(ref(db, targetPath), event.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${peerId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.cleanupPeer(peerId);
      }
    };
  }

  private async listenForIceCandidates(peerId: string, pc: RTCPeerConnection, remoteRole: 'gm' | 'player') {
    const { getDatabase, ref, onChildAdded } = await import('firebase/database');
    const db = getDatabase();
    
    // If I am GM, I listen for 'player' candidates on this player's channel.
    // If I am Player, I listen for 'gm' candidates on my channel.
    const listenPath = this.isGm 
      ? `sessions/${this.sessionId}/webrtc/ice_candidates/${peerId}/player`
      : `sessions/${this.sessionId}/webrtc/ice_candidates/${this.myPlayerId}/gm`;

    onChildAdded(ref(db, listenPath), (snapshot) => {
      const candidate = snapshot.val();
      if (candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      }
    });
  }

  private setupDataChannel(channel: RTCDataChannel, peerId: string) {
    channel.onopen = () => {
      console.log(`[WebRTC] Data channel OPEN with ${peerId}`);
      if (this.isGm) {
        this.connectedPlayers.update(players => [...players, peerId]);
      }
    };

    channel.onclose = () => {
      console.log(`[WebRTC] Data channel CLOSED with ${peerId}`);
      this.cleanupPeer(peerId);
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Push to lock-step queue instead of setting signal directly
        this.messageQueue.next({ senderId: peerId, payload: data });
      } catch(e) {
        console.error("Failed to parse WebRTC message", e);
      }
    };
  }

  public broadcastToPlayers(payload: any) {
    if (!this.isGm) return;
    const msg = JSON.stringify(payload);
    this.dataChannels.forEach((channel) => {
      if (channel.readyState === 'open') {
        channel.send(msg);
      }
    });
  }

  public sendToGm(payload: any) {
    if (this.isGm) return;
    const channel = this.dataChannels.get('GM');
    if (channel && channel.readyState === 'open') {
      channel.send(JSON.stringify(payload));
    }
  }

  private cleanupPeer(peerId: string) {
    this.peerConnections.get(peerId)?.close();
    this.peerConnections.delete(peerId);
    this.dataChannels.delete(peerId);
    if (this.isGm) {
      this.connectedPlayers.update(players => players.filter(p => p !== peerId));
    }
  }
}
