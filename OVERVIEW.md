# Zero Sum RPG - Complete Project Overview & Technical Architecture

## 1. What it is all about
**Zero Sum RPG** is a mathematically rigorous, highly asymmetric, and psychologically intense next-generation tabletop roleplaying game engine set in a Cyberpunk infiltration universe. It serves as the digital connective tissue between players, the Game Master (GM), and Twitch Spectators. 

Unlike traditional companion apps that merely track dice rolls, Zero Sum RPG acts as a **Cyber-Warfare Engine**. It calculates real-world acoustic physics for stealth, tracks psychological trauma via Allostatic Load models, simulates chaotic Twitch viewer interference markets, and enforces brutal "zero-sum" economic transfers where healing a player requires permanently murdering a generated civilian in the facility's life support systems.

## 2. What is included
The repository encompasses a highly synchronized, cross-platform suite of digital hacking and oversight tools:

- **`web-app/`**: An Angular 17 Web Application that acts as the primary hub. It serves 5 completely distinct, dynamically routed views:
  1. **GM Override**: A god-mode dashboard for the GM. Features a 2D Graphical Map Builder, Global Heat Level controls, intel broadcasting, and the Zero-Sum Trauma casualty ledger.
  2. **Spectator View**: A Twitch-ready overlay showing public facility maps, dice rolls, and the live Chaos Market index.
  3. **Player Uplink**: A web-based player dashboard for tracking specific Character HP, Stress, and their isolated Fog of War map.
  4. **Netrunner Terminal**: A functional, green-on-black command-line interface where the squad hacker can manually type terminal commands (`scan map`, `overload`, `breach`) to attack the game state.
  5. **Corporate Billboard**: A diegetic (in-universe) view designed to be cast to a physical TV in the playing room. It features flashing alarms, Heat Level warnings, and a live scrolling stock ticker that crashes as the players cause collateral damage.

- **`zero_sum_android/`**: A native Android Companion App. It operates entirely as a "Player Uplink" device in the physical world, allowing players to connect via `char_id`, track their Allostatic Load (Stress), utilize NFC hardware for kinetic hacking, and access the Acoustic Physics SNR calculator.

- **`assets/` & `scenarios/`**: Extensive narrative scripts and procedural map generations, backed by a massive library of high-fidelity cyber-punk intel assets and server room imagery.

- **`tools/`**: A suite of Python utilities, including the `monte_carlo_sim.py` for game balance probability heatmaps, the `chaos_monkey.py` for stress testing the backend, and asset conversion scripts.

## 3. Architecture & Cyber-Warfare Mechanics
The system recently underwent a massive architectural refactor to support hyper-scalability, fog of war, and deep simulation.

- **The Core Engine**: The entire ecosystem uses **Firebase Realtime Database (RTDB)** as the single source of truth, creating a zero-latency WebSocket connection across all frontends.
- **Dynamic Namespaces**: Connections are no longer tied to a global `/gameState`. Users enter a 6-digit Lobby PIN, routing all state synchronization to dynamically isolated namespaces (e.g., `sessions/A1B2C3/gameState`).
- **PixiJS Tactical Map Engine ([pixi-map.component.ts](https://github.com/kluth/zero_sum_rpg/blob/master/web-app/src/app/pixi-map.component.ts))**: The HTML grid has been completely replaced with a high-performance WebGL 2D canvas utilizing `PixiJS` and `pixi-viewport`. It provides massive 50x30 grids with pinch, zoom, and drag functionality.
- **Granular Tile Painter & WFC Generator ([app.component.ts](https://github.com/kluth/zero_sum_rpg/blob/master/web-app/src/app/app.component.ts))**: The Game Master can procedurally generate rooms via the Wave Function Collapse algorithm OR manually click-and-drag to paint Neon Walls, Locked Doors, CCTV Nodes, and Furniture.
- **True Line of Sight (Bresenham Raycasting)**: Fog of War is no longer a simple distance radius. The system calculates true Line of Sight using a customized Bresenham raycaster. Painted walls and locked doors physically block player visibility calculations, forcing tactical exploration.
- **Dense Spectator Broadcast View**: The Twitch spectator view is engineered as a robust 3-column CSS Grid. It tracks live dice rolls, monitors the live Chaos Market value which responds to Twitch Donations, and provides real-time Squad Status cards with stealth and stress indicators.
- **Acoustic Physics & SNR**: The Android app replaces standard dice rolls with a Signal-to-Noise Ratio (SNR) physics calculator. It uses the Inverse Square Law against ambient dB vs gunshot dB to calculate exact audio drop-off ranges.
- **Psychological Trauma & Cyberpsychosis**: Characters track "Allostatic Load" (Stress) alongside HP. If Stress crosses 75%, the Android UI glitches out via Jetpack Compose animations and the device issues physical Haptic feedback tremors, simulating Cyberpsychosis.
- **Zero-Sum Mechanics**: The core philosophical mechanic. Players have an "Emergency Heal" button. Pressing it restores 25 HP, but mathematically deducts life support from a randomly generated civilian in the facility, logging the irreversible casualty permanently in the GM's Trauma Ledger.

## 4. Technology Used
- **Android Companion App**: Native Kotlin and Jetpack Compose. Utilizes the Firebase Android SDK for database bindings, `LocalHapticFeedback` for analog tremors, and the Android NFC API for physical "Air-Gap" hacks.
- **Web App**: Angular 17, TypeScript, and raw HTML/CSS. The design relies heavily on Cyberpunk glassmorphism, CRT scanline VFX, and CSS Grid. It entirely eschews bloated frameworks like Tailwind for highly tailored, hyper-optimized Vanilla CSS.
- **Automated E2E Testing ([capture_screenshots_playwright.js](https://github.com/kluth/zero_sum_rpg/blob/master/capture_screenshots_playwright.js))**: The project heavily relies on a custom Playwright test suite to automatically boot up headless browsers, simulate multi-user sessions, execute netrunner commands, draw maps, and capture 24 distinct screenshot milestones to validate UI correctness.
- **Build & Pipeline**: Google Firebase Hosting for instantaneous web deployment, and Gradle Configuration Caching for Android.

## 5. Compile Times
Following aggressive build optimizations (`esbuild` and Gradle caching):
- **Android Compilation (`assembleDebug`)**: ~28 seconds for incremental builds.
- **Angular Web Compilation (`ng build`)**: ~26 seconds for complete production bundling.

## 6. Separated File Sizes (Post-Optimization)
The repository recently underwent a brutal git history rewrite and asset compression pass. WebP conversions and `.gitignore` strictness reduced the footprint massively from >6GB to a hyper-optimized state:

| File / Directory | Size | Description |
| :--- | :--- | :--- |
| `zero_sum_android` | **< 200MB** | Android Studio project (Build caches and artifacts successfully stripped from source control) |
| `web-app` | **< 150MB** | Angular project (`node_modules` successfully ignored) |
| `assets` | **~ 150MB** | High-fidelity imagery (Strictly compressed to lightweight `.webp` formats via `tools/convert_assets.py`) |
| `scenarios` | **~ 20MB** | Markdown narrative scripts, procedural parameters, and [map_and_playthrough_review.md](https://github.com/kluth/zero_sum_rpg/blob/master/map_and_playthrough_review.md) |
| `test_suite` | **~ 20MB** | End-to-end testing scripts and automated UI screenshots |
| `tools` | **< 10MB** | Custom Python algorithms (Monte Carlo, Chaos Monkey, Asset Converter) |
| `server` | **Deprecated** | Legacy Node.js socket server (Removed in favor of Firebase) |
