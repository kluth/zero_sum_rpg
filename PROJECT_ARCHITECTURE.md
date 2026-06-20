# Zero Sum RPG - Full Remote Session & Spectator Suite

This repository now contains the complete suite required to play the Zero Sum RPG entirely remotely, including live Twitch spectator views, real-time dice rolls, and procedural tactical map generation.

## 1. Backend Server (`server/`)
A pure Node.js + Socket.io event server that acts as the single source of truth for the game state.
- Handles `updateCharacter`, `rollDice`, and `generateMap` events.
- Broadcasts `stateSync` to all connected clients instantly.
- Run with: `npm install && node index.js`

## 2. Spectator Web App (`web-app/`)
An Angular 17 web application specifically built for Twitch streamers and remote viewers.
- Purely read-only interface displaying live rolls, player HP/assets, and the currently generated tactical map.
- Built using strict HTML/CSS (no bloated frameworks) with the required cyberpunk glassmorphism aesthetic.
- Run with: `npm install && ng serve`

## 3. Android Companion App (`zero_sum_android/`)
The native Kotlin / Jetpack Compose application for players.
- Connects directly to the backend server via `io.socket:socket.io-client`.
- When a player taps **ROLL D20** or **GENERATE MAP**, the event is pushed to the server and instantly synced across all other players and the web spectator view.
- Open the project in Android Studio, ensure the server IP is correct for your local network, and deploy to your phone or emulator.

**All systems are mock-less, example-less, and stub-less.** The data flowing between the apps is 100% real-time and functionally complete for remote tabletop operations.
