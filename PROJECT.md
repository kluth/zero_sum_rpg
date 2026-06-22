# Project: Zero Sum RPG - Automated Multi-Agent Load Testing

## Architecture

The Zero Sum RPG suite is designed as a real-time multiplayer tabletop companion system. To ensure scalability and sub-second propagation latency under active gameplay, the architecture utilizes **Firebase Realtime Database (RTDB)** as the single source of truth for synchronization, replacing the previous Socket.io implementation.

```
       +---------------------------------------------+
       |          Firebase RTDB (Emulator / Cloud)   |
       +---------------------------------------------+
               ^                       ^
               | (Writes/Reads)        | (Reads-only)
               v                       v
  +-----------------------+   +-----------------------+
  |   Android Companion   |   |   Angular Spectator   |
  |      App (Kotlin)     |   |      Web App          |
  +-----------------------+   +-----------------------+
               ^
               |
  +-----------------------+
  |  Load Testing Agent   |
  |  (50 Simulated Users) |
  +-----------------------+
```

### Components

1. **Android Companion App (`zero_sum_android/`)**:
   - Built with Native Kotlin and Jetpack Compose.
   - Connects directly to Firebase Realtime Database.
   - Performs writes to update player character sheet stats, log dice rolls, and procedurally generate maps.
   - Listens to database updates to maintain visual sync.

2. **Angular Spectator Web App (`web-app/`)**:
   - Developed with Angular 17.
   - Listen-only connection to Firebase Realtime Database.
   - Synchronizes display components (live rolls feed, squad HP/stealth, and tactical map representation) with the global state in real-time.

3. **Node.js Client Simulator / Load Tester**:
   - A lightweight automation runner using the Firebase JS Client SDK (connected to local Firebase Emulator).
   - Dynamically spawns 50 simultaneous player sessions.
   - Measures and reports propagation latency across all clients when a client makes a transaction (e.g., rolling dice).

4. **Local Development (Firebase Emulator Suite)**:
   - Configured locally via `firebase.json`.
   - Emulates Realtime Database on port 9000, allowing offline development, styling, and deterministic load testing.

---

## Milestones

| # | Milestone Name | Description | Status |
|---|---|---|---|
| **M1** | **Explore & Design** | Analyze client/server sync codebase, identify Socket.io integration leftovers, formulate design for Firebase Realtime Database transition, and draft verification methodologies. | **DONE** |
| **M2** | **Android & DB Refactor** | Clean up `NetworkManager.socket` leftovers in Android app. Add character profile sync methods to `NetworkManager.kt` using Firebase SDK. Update both apps to connect to the local Firebase Emulator. | **DONE** |
| **M3** | **Load Test Runner** | Develop a Node.js test runner script using the Firebase JS SDK to spin up 50 simulated player sessions concurrently reading and writing to the local RTDB emulator. | **DONE** |
| **M4** | **Verification** | Implement programmatic propagation tracking and latency measurements (mean, median, P95, P99). Output latency metrics and verification summaries to reports. | **DONE** |

*Note on Verification: Verified by 2 Reviewers, 2 Challengers, and 1 Forensic Auditor (CLEAN verdict). Latencies were measured under 1000ms with a 100% sync success rate across 50 simulated player sessions.*

---

## Interface Contracts (State Synchronization Schemas)

State sync is structured under a single root node `/gameState` in the Realtime Database.

### 1. Character Profile Schema
- **Path**: `/gameState/characters/{characterId}`
- **Type**: Object
- **Fields**:
  - `name` (string, required): Player's character name. (e.g., `"KAIRO 'GHOST' CHEN"`)
  - `role` (string, required): Operational role/class. (e.g., `"CYBER-INFILTRATOR"`)
  - `hp` (integer, required): Current health pool, from `0` to `100`. (e.g., `78`)
  - `stealth` (integer, required): Stealth capability level, from `0` to `100`. (e.g., `85`)

### 2. Dice Roll Schema
- **Path**: `/gameState/recentRolls`
- **Type**: Array of Objects (holds the 10 most recent rolls)
- **Fields**:
  - `rollId` (string, required for tests): Unique UUID or timestamp identifier for tracking and matching.
  - `player` (string, required): Name of the player who rolled. (e.g., `"Ghost"`)
  - `result` (integer, required): Roll outcome of a D20, from `1` to `20`. (e.g., `18`)
  - `timestamp` (long, required): Unix timestamp in milliseconds indicating when the roll was cast. (e.g., `1718911200000`)

### 3. Map Data Schema
- **Path**: `/gameState/map`
- **Type**: Object
- **Fields**:
  - `archetype` (string, required): Theme classification of the facility. (e.g., `"Data Vault"`)
  - `layoutStructure` (string, required): Layout style of the facility. (e.g., `"Grid Matrix"`)
  - `rooms` (Array of Objects, required): Array of room configurations containing:
    - `id` (integer, required): Index sequence of the room. (e.g., `1`)
    - `name` (string, required): Name/type of the room. (e.g., `"Security Checkpoint"`)
    - `complication` (string, required): Hazards or lock status. (e.g., `"Biometric Lockdown"`, `"Clear"`)
    - `isObjective` (boolean, required): `true` if this room is the final extraction point or objective target.
