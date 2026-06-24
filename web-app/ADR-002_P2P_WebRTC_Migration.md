# ADR 002: Migration to P2P WebRTC / WebSocket for High-Frequency Game State

## Status
Proposed

## Context
Currently, the Zero Sum RPG uses Firebase Realtime Database (RTDB) as the central nervous system for all game state synchronizations. While RTDB offers excellent out-of-the-box reactivity and persistence, we have identified two critical risk factors:
1. **Pricing / Cost:** Firebase charges per GB downloaded. In a tabletop RPG where 6+ clients (GM, 4 Players, Billboard, Spectators) are continuously receiving map updates, coordinates, and high-frequency `onPlayerMoved` events, the bandwidth can quickly explode.
2. **Latency:** Routing every minor coordinate update (e.g. dragging a token) through a central cloud server introduces latency, reducing the "snappy" feel of local tactical combat.

## Decision
We will migrate high-frequency, non-critical state updates (e.g., cursor positions, dragging operations, temporary map pings) to a **Peer-to-Peer (P2P) WebRTC** mesh network, or a lightweight custom WebSocket server if TURN server costs for WebRTC become prohibitive.
Firebase RTDB will be retained **exclusively** for:
- Low-frequency, permanent state mutations (e.g., Action Queue submissions, final HP deductions, item consumption).
- Initial Session Bootstrapping / Handshake (Signaling server for WebRTC).

### Architecture
1. **Signaling:** When a client joins the session via `?session=123`, they read the RTDB to find the GM's WebRTC Offer. They reply with an Answer via RTDB.
2. **Data Channels:** Once connected, a WebRTC `RTCDataChannel` is established directly between the Players and the GM.
3. **The GM as the Host:** The Game Master's client acts as the authoritative host for the WebRTC mesh. All player actions are sent directly to the GM via P2P.
4. **Resolution:** The GM's client runs the `ResolutionEngine`, calculates the new absolute state, and broadcasts it back via P2P.
5. **Persistence:** The GM's client flushes the final validated `gameState` to Firebase RTDB every 10 seconds or upon critical events (e.g., Combat over), ensuring data is not lost if the GM disconnects.

## Consequences
### Positive
- **Drastic Cost Reduction:** Firebase bandwidth will drop by an estimated 95%, as 99% of network messages will route over free P2P channels.
- **Ultra-Low Latency:** P2P connections on the same network or same region will have <20ms latency.
- **True Decentralization:** Aligns perfectly with the Cyberpunk/Hacker ethos of the game.

### Negative
- **Complexity:** Implementing WebRTC requires handling ICE Candidates, STUN/TURN servers, and NAT traversal failovers.
- **GM Bandwidth:** The GM's local network must handle the upload traffic for all connected clients.
- **State Recovery:** If the GM's browser crashes, the last 10 seconds of state might be lost unless we implement local `IndexedDB` failovers.

## Next Steps
1. Implement a prototype `WebRtcService` in Angular.
2. Use Firebase RTDB at `sessions/{id}/webrtc/` for the signaling handshake.
3. Route the `ActionQueueService` to try WebRTC first, and fallback to Firebase if the channel is disconnected.
