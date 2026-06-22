# Zero Sum RPG - Complete Project Overview

## 1. What it is all about
**Zero Sum RPG** is a next-generation real-time multiplayer tabletop roleplaying game companion system set in a Cyberpunk infiltration universe. It is designed to act as the digital interface for players, the Game Master (GM), and Twitch spectators simultaneously. It handles complex gameplay mechanics—such as character health tracking, stealth monitoring, tactical map generation, and dice rolling—and synchronizes them globally across all devices in real-time.

## 2. What is included
The repository encompasses the entire suite of digital tools needed to play the game:
- **`zero_sum_android/`**: The primary Android Companion App used by the players to track their stats, roll dice, and view the tactical map.
- **`web-app/`**: An Angular 17 Web Application built for Twitch spectators and the GM. It includes a Spectator Mode (read-only monitoring) and a GM Override Dashboard for adjusting global parameters like Heat Levels and the Debt Ledger.
- **`server/`**: A legacy Node.js + Socket.io event server (now deprecated in favor of Firebase).
- **`cloud_simulation_logs/` & `simulation_logs/`**: Test reports, logs, and screenshots produced by Google Firebase Test Lab's automated cloud device farms.
- **`tools/` & `scenarios/`**: Various load testing automation scripts, programmatic Espresso UI tests, and large-scale semantic diversity reports for procedural narrative generation.

## 3. Architecture
The system recently completed a massive architectural refactor to support extreme scalability and zero-latency session isolation. 
- **The Core Engine**: The entire ecosystem uses **Firebase Realtime Database (RTDB)** as the single source of truth.
- **Dynamic Namespaces**: Connections are no longer tied to a global `/gameState`. Instead, users enter a 6-digit Lobby PIN, routing all state synchronization to dynamically isolated namespaces (e.g., `sessions/A1B2C3/gameState`).
- **Data Flow**: The Android app functions as both a reader and writer (pushing dice rolls, stat changes, and map generation events to the cloud), while the Web App reacts dynamically via strict Angular state bindings.

## 4. Technology Used
- **Android Companion App**: Native Kotlin and Jetpack Compose for the UI. Uses the Firebase Android SDK for database bindings and `LocalHapticFeedback` for analog-feeling interactions.
- **Web App**: Angular 17, TypeScript, and raw HTML/CSS. The design relies heavily on Cyberpunk glassmorphism, CRT scanline VFX, and CSS Grid (eschewing bloated frameworks like Tailwind for highly tailored styling).
- **Testing**: Espresso UI testing frameworks integrated directly with Google Cloud's Firebase Test Lab device farms.

## 5. Compile Times
- **Android Compilation (`assembleDebug`)**: ~37 seconds for incremental builds (up to ~2 minutes for cold, full-scale Gradle rebuilds).
- **Angular Web Compilation (`ng build`)**: ~18.5 seconds for production bundling.

## 6. Separated File Sizes
Below is the size footprint of the project directories and files:

| File / Directory | Size | Description |
| :--- | :--- | :--- |
| `zero_sum_android` | **2.9G** | Android Studio project (including Gradle build caches and outputs) |
| `assets` | **953M** | High-fidelity graphical assets and audio |
| `scenarios` | **882M** | Extensive narrative scripts and procedural map generations |
| `web-app` | **726M** | Angular project (including `node_modules` and `dist`) |
| `venv` | **407M** | Python virtual environment |
| `tools` | **346M** | Custom Python algorithms and automation scripts |
| `docs` | **76M** | Developer documentation |
| `server` | **76M** | Legacy Node.js socket server |
| `simulation_logs` | **1.9M** | Agent simulation textual logs |
| `cloud_simulation_logs` | **360K** | Test Lab PNG screenshots |
| `templates` | **116K** | File generation templates |
| `sdk_list_canary.txt` | **108K** | Dependency logging |
| *Various config/docs* | **< 100K** | Markdown docs (`PROJECT.md`, `README.md`) and bash scripts |
