# Zero Sum RPG - Komplette Projektübersicht & Technische Architektur

## 1. Worum es geht
**Zero Sum RPG** ist eine mathematisch rigorose, hochgradig asymmetrische und psychologisch intensive Next-Generation Tabletop Roleplaying Game Engine, angesiedelt in einem Cyberpunk-Infiltrationsuniversum. Es dient als digitales Bindeglied zwischen Playern, dem Game Master (GM) und Twitch Spectators.

Im Gegensatz zu traditionellen Companion Apps, die lediglich Dice Rolls tracken, fungiert Zero Sum RPG als eine **Cyber-Warfare Engine**. Es berechnet reale akustische Physik für Stealth, trackt psychologisches Trauma über Allostatic Load Modelle, simuliert chaotische Twitch-Viewer-Interferenzmärkte und erzwingt brutale "Zero-Sum" ökonomische Transfers, bei denen das Heilen eines Players permanent das Morden eines generierten Zivilisten in den Lebenserhaltungssystemen der Einrichtung erfordert.

## 2. Was enthalten ist
Das Repository umfasst eine hochgradig synchronisierte, plattformübergreifende Suite von digitalen Hacking- und Oversight-Tools:

- **`web-app/`**: Eine Angular 17 Web Application, die als primärer Hub dient. Sie bietet 5 komplett unterschiedliche, dynamisch geroutete Views:
  1. **GM Override**: Ein God-Mode Dashboard für den GM. Features sind ein 2D Graphical Map Builder, globale Heat Level Controls, Intel Broadcasting und das Zero-Sum Trauma Casualty Ledger.
  2. **Spectator View**: Ein Twitch-ready Overlay, das öffentliche Facility Maps, Dice Rolls und den Live Chaos Market Index zeigt.
  3. **Player Uplink**: Ein webbasiertes Player Dashboard zum Tracken spezifischer Character HP, Stress und ihrer isolierten Fog of War Map.
  4. **Netrunner Terminal**: Ein funktionales, grün-auf-schwarzes Command-Line Interface, in dem der Squad Hacker manuell Terminal-Commands (`scan map`, `overload`, `breach`) tippen kann, um den Game State anzugreifen.
  5. **Corporate Billboard**: Ein diegetischer (In-Universe) View, der entwickelt wurde, um auf einen physischen TV im Spielraum gecastet zu werden. Es bietet blinkende Alarme, Heat Level Warnungen und einen Live-Scrolling Stock Ticker, der abstürzt, wenn die Player Collateral Damage verursachen.

- **`zero_sum_android/`**: Eine native Android Companion App. Sie operiert komplett als "Player Uplink" Device in der physischen Welt und erlaubt es den Playern, sich via `char_id` zu verbinden, ihren Allostatic Load (Stress) zu tracken, NFC Hardware für kinetisches Hacking zu nutzen und auf den Acoustic Physics SNR Calculator zuzugreifen.

- **`assets/` & `scenarios/`**: Umfangreiche narrative Scripts und prozedurale Map Generations, unterstützt durch eine massive Bibliothek von High-Fidelity Cyber-Punk Intel Assets und Server Room Imagery.

- **`tools/`**: Eine Suite von Python Utilities, einschließlich der `monte_carlo_sim.py` für Game Balance Probability Heatmaps, der `chaos_monkey.py` für Stresstests des Backends und Asset Conversion Scripts.

## 3. Architektur & Cyber-Warfare Mechanics
Das System durchlief kürzlich ein massives architektonisches Refactoring, um Hyper-Skalierbarkeit, Fog of War und Deep Simulation zu unterstützen.

- **Die Core Engine**: Das gesamte Ökosystem nutzt die **Firebase Realtime Database (RTDB)** als Single Source of Truth und erschafft so eine Zero-Latency WebSocket Verbindung über alle Frontends hinweg.
- **Dynamic Namespaces**: Verbindungen sind nicht länger an einen globalen `/gameState` gebunden. User geben eine 6-stellige Lobby PIN ein, was die gesamte State Synchronization zu dynamisch isolierten Namespaces routet (z.B. `sessions/A1B2C3/gameState`).
- **PixiJS Tactical Map Engine ([pixi-map.component.ts](https://github.com/kluth/zero_sum_rpg/blob/master/web-app/src/app/pixi-map.component.ts))**: Das HTML Grid wurde komplett durch einen High-Performance WebGL 2D Canvas ersetzt, der `PixiJS` und `pixi-viewport` nutzt. Er bietet massive 50x30 Grids mit Pinch-, Zoom- und Drag-Funktionalität.
- **Granular Tile Painter & WFC Generator ([app.component.ts](https://github.com/kluth/zero_sum_rpg/blob/master/web-app/src/app/app.component.ts))**: Der Game Master kann Räume prozedural via Wave Function Collapse Algorithmus generieren ODER manuell klicken-und-ziehen, um Neon Walls, Locked Doors, CCTV Nodes und Furniture zu painten.
- **True Line of Sight (Bresenham Raycasting)**: Fog of War ist nicht länger ein simpler Distance Radius. Das System berechnet wahre Line of Sight mit einem angepassten Bresenham Raycaster. Gepaintete Walls und Locked Doors blockieren physisch die Visibility Calculations der Player und erzwingen taktische Exploration.
- **Dense Spectator Broadcast View**: Der Twitch Spectator View wurde als robustes 3-Column CSS Grid entwickelt. Er trackt Live Dice Rolls, überwacht den Live Chaos Market Value, der auf Twitch Donations reagiert, und bietet Real-Time Squad Status Cards mit Stealth- und Stress-Indicators.
- **Acoustic Physics & SNR**: Die Android App ersetzt Standard Dice Rolls durch einen Signal-to-Noise Ratio (SNR) Physics Calculator. Er nutzt das Inverse Square Law für Ambient dB vs Gunshot dB, um exakte Audio Drop-Off Ranges zu berechnen.
- **Psychological Trauma & Cyberpsychosis**: Characters tracken "Allostatic Load" (Stress) neben HP. Wenn der Stress 75% überschreitet, glitcht die Android UI über Jetpack Compose Animations aus und das Device gibt physische Haptic Feedback Tremors aus, was Cyberpsychosis simuliert.
- **Zero-Sum Mechanics**: Die philosophische Core Mechanic. Player haben einen "Emergency Heal" Button. Ihn zu drücken stellt 25 HP wieder her, zieht aber mathematisch Lebenserhaltung von einem zufällig generierten Zivilisten in der Einrichtung ab, was das irreversible Casualty permanent im Trauma Ledger des GM loggt.

## 4. Verwendete Technologie
- **Android Companion App**: Native Kotlin und Jetpack Compose. Nutzt das Firebase Android SDK für Database Bindings, `LocalHapticFeedback` für analoge Tremors und die Android NFC API für physische "Air-Gap" Hacks.
- **Web App**: Angular 17, TypeScript und reines HTML/CSS. Das Design stützt sich stark auf Cyberpunk Glassmorphism, CRT Scanline VFX und CSS Grid. Es verzichtet komplett auf aufgeblähte Frameworks wie Tailwind zugunsten von hochgradig maßgeschneidertem, hyper-optimiertem Vanilla CSS.
- **Automated E2E Testing ([capture_screenshots_playwright.js](https://github.com/kluth/zero_sum_rpg/blob/master/capture_screenshots_playwright.js))**: Das Projekt verlässt sich stark auf eine Custom Playwright Test Suite, um automatisch Headless Browser zu booten, Multi-User Sessions zu simulieren, Netrunner Commands auszuführen, Maps zu drawen und 24 unterschiedliche Screenshot Milestones zu erfassen, um UI Correctness zu validieren.
- **Build & Pipeline**: Google Firebase Hosting für instantanes Web Deployment und Gradle Configuration Caching für Android.

## 5. Compile Times
Nach aggressiven Build Optimizations (`esbuild` und Gradle Caching):
- **Android Compilation (`assembleDebug`)**: ~28 Sekunden für Incremental Builds.
- **Angular Web Compilation (`ng build`)**: ~26 Sekunden für vollständiges Production Bundling.

## 6. Separated File Sizes (Post-Optimization)
Das Repository erfuhr kürzlich ein brutales Git History Rewrite und einen Asset Compression Pass. WebP Conversions und `.gitignore` Strictness reduzierten den Footprint massiv von >6GB auf einen hyper-optimierten Zustand:

| File / Directory | Size | Description |
| :--- | :--- | :--- |
| `zero_sum_android` | **< 200MB** | Android Studio Project (Build Caches und Artifacts erfolgreich aus der Source Control entfernt) |
| `web-app` | **< 150MB** | Angular Project (`node_modules` erfolgreich ignoriert) |
| `assets` | **~ 150MB** | High-Fidelity Imagery (Strikt auf leichtgewichtige `.webp` Formate komprimiert via `tools/convert_assets.py`) |
| `scenarios` | **~ 20MB** | Markdown Narrative Scripts, Procedural Parameters und [map_and_playthrough_review.md](https://github.com/kluth/zero_sum_rpg/blob/master/map_and_playthrough_review.md) |
| `test_suite` | **~ 20MB** | End-to-End Testing Scripts und Automated UI Screenshots |
| `tools` | **< 10MB** | Custom Python Algorithms (Monte Carlo, Chaos Monkey, Asset Converter) |
| `server` | **Deprecated** | Legacy Node.js Socket Server (Entfernt zugunsten von Firebase) |
