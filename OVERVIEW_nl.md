# Zero Sum RPG - Compleet Projectoverzicht & Technische Architectuur

## 1. Waar het over gaat
**Zero Sum RPG** is een wiskundig rigoureuze, sterk asymmetrische en psychologisch intense next-generation tabletop roleplaying game engine, gesitueerd in een Cyberpunk infiltratie-universum. Het fungeert als het digitale bindweefsel tussen Players, de Game Master (GM) en Twitch Spectators.

In tegenstelling tot traditionele Companion Apps die alleen maar Dice Rolls tracken, werkt Zero Sum RPG als een **Cyber-Warfare Engine**. Het berekent echte akoestische fysica voor Stealth, trackt psychologisch trauma via Allostatic Load modellen, simuleert chaotische Twitch-viewer-interferentiemarkten en dwingt wrede "Zero-Sum" economische transfers af, waarbij het healen van een Player vereist dat een gegenereerde burger permanent wordt vermoord in de life support systemen van de faciliteit.

## 2. Wat is inbegrepen
De repository omvat een sterk gesynchroniseerde, cross-platform suite van digitale hacking- en oversight-tools:

- **`web-app/`**: Een Angular 17 Web Application die als de primaire hub dient. Het biedt 5 volledig verschillende, dynamisch gerouteerde views:
  1. **GM Override**: Een God-Mode Dashboard voor de GM. Bevat een 2D Graphical Map Builder, Global Heat Level controls, Intel Broadcasting en de Zero-Sum Trauma Casualty Ledger.
  2. **Spectator View**: Een Twitch-ready Overlay met openbare Facility Maps, Dice Rolls en de Live Chaos Market Index.
  3. **Player Uplink**: Een webgebaseerd Player Dashboard voor het tracken van specifieke Character HP, Stress en hun geïsoleerde Fog of War Map.
  4. **Netrunner Terminal**: Een functionele, groen-op-zwart Command-Line Interface waar de Squad Hacker handmatig Terminal Commands (`scan map`, `overload`, `breach`) kan typen om de Game State aan te vallen.
  5. **Corporate Billboard**: Een diegetische (in-universe) view ontworpen om naar een fysieke TV in de speelkamer gecast te worden. Het toont knipperende alarms, Heat Level waarschuwingen en een Live Scrolling Stock Ticker die crasht als de Players Collateral Damage veroorzaken.

- **`zero_sum_android/`**: Een native Android Companion App. Het functioneert volledig als een "Player Uplink" device in de fysieke wereld, waarmee Players kunnen verbinden via `char_id`, hun Allostatic Load (Stress) kunnen tracken, NFC Hardware kunnen gebruiken voor kinetische hacking, en toegang hebben tot de Acoustic Physics SNR Calculator.

- **`assets/` & `scenarios/`**: Uitgebreide narrative scripts en procedurale Map Generations, ondersteund door een enorme bibliotheek van high-fidelity Cyberpunk Intel Assets en Server Room Imagery.

- **`tools/`**: Een suite van Python Utilities, waaronder de `monte_carlo_sim.py` voor Game Balance Probability Heatmaps, de `chaos_monkey.py` voor het stresstesten van de backend, en Asset Conversion Scripts.

## 3. Architectuur & Cyber-Warfare Mechanics
Het systeem heeft onlangs een enorme architecturale refactor ondergaan om hyper-schaalbaarheid, Fog of War en deep simulation te ondersteunen.

- **De Core Engine**: Het hele ecosysteem gebruikt de **Firebase Realtime Database (RTDB)** als de single source of truth, wat een zero-latency WebSocket verbinding creëert over alle frontends.
- **Dynamic Namespaces**: Verbindingen zijn niet langer gebonden aan een globale `/gameState`. Users voeren een 6-cijferige Lobby PIN in, waardoor alle State Synchronization naar dynamisch geïsoleerde namespaces gerouteerd wordt (bijv. `sessions/A1B2C3/gameState`).
- **PixiJS Tactical Map Engine ([pixi-map.component.ts](https://github.com/kluth/zero_sum_rpg/blob/master/web-app/src/app/pixi-map.component.ts))**: De HTML Grid is volledig vervangen door een high-performance WebGL 2D Canvas dat `PixiJS` en `pixi-viewport` gebruikt. Het biedt massieve 50x30 Grids met Pinch, Zoom en Drag functionaliteit.
- **Granular Tile Painter & WFC Generator ([app.component.ts](https://github.com/kluth/zero_sum_rpg/blob/master/web-app/src/app/app.component.ts))**: De Game Master kan ruimtes procedureel genereren via het Wave Function Collapse algoritme OF handmatig klikken en slepen om Neon Walls, Locked Doors, CCTV Nodes en Furniture te painten.
- **True Line of Sight (Bresenham Raycasting)**: Fog of War is niet langer een simpele Distance Radius. Het systeem berekent echte Line of Sight met een aangepaste Bresenham raycaster. Gepainte Walls en Locked Doors blokkeren fysiek de Visibility Calculations van Players, wat tactische exploratie afdwingt.
- **Dense Spectator Broadcast View**: De Twitch Spectator View is ontworpen als een robuust 3-column CSS Grid. Het trackt Live Dice Rolls, monitort de Live Chaos Market Value die reageert op Twitch Donations, en biedt Real-Time Squad Status Cards met Stealth en Stress Indicators.
- **Acoustic Physics & SNR**: De Android App vervangt standaard Dice Rolls door een Signal-to-Noise Ratio (SNR) Physics Calculator. Het gebruikt de Inverse Square Law tegen Ambient dB vs Gunshot dB om exacte Audio Drop-Off Ranges te berekenen.
- **Psychological Trauma & Cyberpsychosis**: Characters tracken "Allostatic Load" (Stress) naast HP. Als Stress boven de 75% komt, glitcht de Android UI via Jetpack Compose Animations en geeft het device fysieke Haptic Feedback Tremors, wat Cyberpsychosis simuleert.
- **Zero-Sum Mechanics**: De filosofische Core Mechanic. Players hebben een "Emergency Heal" Button. Het indrukken hiervan herstelt 25 HP, maar trekt wiskundig life support af van een willekeurig gegenereerde burger in de faciliteit, wat de onomkeerbare casualty permanent in de Trauma Ledger van de GM logt.

## 4. Gebruikte Technologie
- **Android Companion App**: Native Kotlin en Jetpack Compose. Gebruikt de Firebase Android SDK voor database bindings, `LocalHapticFeedback` voor analoge tremors, en de Android NFC API voor fysieke "Air-Gap" Hacks.
- **Web App**: Angular 17, TypeScript en ruwe HTML/CSS. Het ontwerp leunt zwaar op Cyberpunk Glassmorphism, CRT Scanline VFX en CSS Grid. Het vermijdt volledig bloated frameworks zoals Tailwind voor zeer op maat gemaakte, hyper-geoptimaliseerde Vanilla CSS.
- **Automated E2E Testing ([capture_screenshots_playwright.js](https://github.com/kluth/zero_sum_rpg/blob/master/capture_screenshots_playwright.js))**: Het project leunt sterk op een custom Playwright Test Suite om automatisch Headless Browsers op te starten, Multi-User Sessions te simuleren, Netrunner Commands uit te voeren, Maps te drawen en 24 verschillende Screenshot Milestones vast te leggen om UI Correctness te valideren.
- **Build & Pipeline**: Google Firebase Hosting voor instantane web deployment, en Gradle Configuration Caching voor Android.

## 5. Compile Times
Na agressieve Build Optimizations (`esbuild` en Gradle caching):
- **Android Compilation (`assembleDebug`)**: ~28 seconden voor Incremental Builds.
- **Angular Web Compilation (`ng build`)**: ~26 seconden voor complete Production Bundling.

## 6. Separated File Sizes (Post-Optimization)
De repository heeft onlangs een brute Git History Rewrite en een Asset Compression Pass ondergaan. WebP conversies en `.gitignore` strictness hebben de voetafdruk massaal verkleind van >6GB naar een hyper-geoptimaliseerde staat:

| File / Directory | Size | Description |
| :--- | :--- | :--- |
| `zero_sum_android` | **< 200MB** | Android Studio Project (Build Caches en Artifacts succesvol gestript uit source control) |
| `web-app` | **< 150MB** | Angular Project (`node_modules` succesvol genegeerd) |
| `assets` | **~ 150MB** | High-Fidelity Imagery (Strikt gecomprimeerd naar lichtgewicht `.webp` formaten via `tools/convert_assets.py`) |
| `scenarios` | **~ 20MB** | Markdown Narrative Scripts, Procedural Parameters, en [map_and_playthrough_review.md](https://github.com/kluth/zero_sum_rpg/blob/master/map_and_playthrough_review.md) |
| `test_suite` | **~ 20MB** | End-to-End Testing Scripts en Automated UI Screenshots |
| `tools` | **< 10MB** | Custom Python Algorithms (Monte Carlo, Chaos Monkey, Asset Converter) |
| `server` | **Deprecated** | Legacy Node.js Socket Server (Verwijderd ten gunste van Firebase) |
