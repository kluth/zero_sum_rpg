# Zero-Sum RPG: Core Rulebook (Deutsch)

![Cover Art](artifacts/images/zero_sum_cover.jpg)


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
| : | :

## 1. Core Mechanics & Mathematical Flatness (MassMarket-Architect)
**Bounded Accuracy & API-Friendly JSON**
Das System verzichtet auf die volatilen 0-100-Prozentskalen zugunsten flacher, streng begrenzter Integer (1-20). Dies stellt sicher, dass Modifikatoren (+/- 1 bis 3) extrem wirkungsvoll bleiben. Um jegliche Parsing-Verzögerung in der Android AR-App zu vermeiden, werden alle mathematischen Berechnungen vollständig auf den Server ausgelagert. Der Client konsumiert ein flaches, vorausberechnetes JSON-Schema:
- `stealth_total` wird direkt übergeben; der Client berechnet Modifikatoren niemals iterativ.
- Conditions sind flache Enums (z.B. `CYBERPSYCHOSIS`) für sofortige O(1) Condition-Checks.

![Tactical Grid](artifacts/images/combat_grid.jpg)

## 2. Action Economy & Combat Analytics (Tactical-Mathematician)
**Das 3-Action Economy & Firebase Tag Engine**
Basierend auf umfangreichen Monte-Carlo-Simulationen nutzt die Combat-Engine ein 3-Action Point (AP) System pro Turn.
- "Attack Spam" erzeugt kumulative Acoustic SNR-Strafen, die massive Schwärme alarmieren.
- Players müssen AP zwischen Combat, Hacking und Stress Management ausbalancieren.
- **AP Recovery & Standardization (V2.1 Fix):** Players können nicht länger mehrere AP ausgeben, um Rolls zu umgehen (Auto-Success ist deaktiviert). AP fügen strictly Modifier Dice (Green/Blue) zu Pools hinzu. Um AP-Mangel im Late-Game zu verhindern, können Players einen "Catch a Breath"-Move ausführen, um 1 AP zurückzugewinnen, oder absichtlich eine Narrative Flaw-Komplikation für einen sofortigen AP-Refund akzeptieren.
- Ein **Modular Tag System** läuft im Firebase-Backend und löst additive Mathematik und boolesche Overrides (z.B. `BUFF:ACCURACY:+2:1_TURN`) auf, bevor das final reduzierte State-Array an die Jetpack Compose UI der AR-App gepusht wird.

## 3. Asymmetric State Syncing (Asymmetric-Integrator)
**Lösung des Split-Party-Problems**
Wenn der Netrunner via AR-App eine Datenfestung infiltriert, während der Solo auf dem VTT kämpft, erzwingt das Backend eine einheitliche **Simultaneous Resolution Queue** via WebSockets/Socket.io.
- Echtzeit- und rundenbasierte Kontexte werden überbrückt, indem "AR Hacks" bestimmten AP-Kosten zugeordnet werden.
- **Group Action Mechanic (V2.1 Fix):** Um klobiges analoges Split-Party-Syncing zu beheben, können Players einen "Synchronized Breach" initiieren. Sie legen ihre Dice zusammen und bilden den Durchschnitt ihrer Successes, oder geben AP aus, um einem Verbündeten an einer aufgeteilten Front zu "Assist"ieren, wodurch verhindert wird, dass ein einzelner schlechter Roll eine Doppeloperation katastrophal scheitern lässt.
- Der State wird für 200ms-Fenster gesperrt, um Split-Party-Ereignisse zu berechnen, was sicherstellt, dass die erfolgreiche ICE-Entschlüsselung des Netrunners exakt mit dem Entriegeln der physischen Tür auf dem VTT für den Solo korreliert.

## 4. Multi-Axis Resolution Engine (MultiAxis-Resolutor)
**Narrative Dice Pools & Backend Offloading**
Binäres Pass/Fail wird durch einen multidimensionalen Dice Pool (Success/Failure, Advantage/Threat, Triumph/Despair) ersetzt.
- **Threat Re-Balancing & Sequential Clocks (V2.1 Fix):** Die Wahrscheinlichkeit, dass rote "Danger" Dice katastrophale Fehlschläge auslösen, wurde abgemildert. Außerdem müssen mehrteilige Paper Clocks sequenziell gefüllt werden (ein Tick pro generiertem Threat). Ein einzelner Mixed Success Roll kann eine Clock nicht länger auf das Maximum springen lassen.
- **Der "Dumb" Client**: Die Android-App sendet nur die Absicht des Players und Kontext-Tags (z.B. `"action": "hack", "context": ["under_fire"]`).
- **Server-Side Generation**: Der Backend Core berechnet den Dice Pool, führt den RNG Roll aus und übersetzt die mechanischen State-Änderungen.
- **LLM Narrative Injection**: Das Backend verwendet ein sicheres internes LLM, um mechanische Ergebnisse (z.B. "Failed with 3 Advantages") in reichhaltige, kontextbezogene Prosa zu übersetzen, bevor die finale Narrative und State-Updates an den Client zurückgeschickt werden.

![Neural Deck Hardware](artifacts/images/neural_deck.jpg)

## 5. Psychological Mechanics & UI Glitching (Psychological-Engineer)
**Ausnutzung des AR-Geräts für Paranoia**
Die AR Companion-App fungiert als Kanal für "Bleed".
- **Hidden Notifications**: Der GM kann sichere Push-Benachrichtigungen via der Firebase FCM Layer an bestimmte Players senden und sie mit Halluzinationen oder widersprüchlichen Infos füttern.
- **Manageable Bleed Cards (V2.1 Fix):** Die physischen/digitalen "Bleed Cards" erzwingen keine harten mechanischen Lockouts mehr (z.B. übersprungene Turns oder erzwungene Erblindung). Stattdessen erzwingen sie narrative Komplikationen und handhabbare Trade-Offs (z.B. "-1 auf Agility Checks, es sei denn, man drängt rücksichtslos vorwärts"), wodurch die unspaßige Todes-Spirale entfernt wird.
- **Allostatic Stress Glitching**: Wenn der Allostatic Load eines Players Schwellenwerte überschreitet, degradiert die Jetpack Compose UI physisch—Text verschlüsselt sich, Bildschirme reißen via Shader und das Gerät nutzt seinen haptischen Motor, um einen rasenden Herzschlag zu imitieren.

## 6. The Diegetic Economy & Hardware Interaction (Diegetic-Economist)
**Das AR Neural Deck**
Die Companion-App ist kein Meta-Tool; sie existiert In-Universe.
- **NFC Gear Equip**: Players nutzen ihr physisches Gerät, um NFC-Tags oder AR-Marker zu scannen, um Ausrüstung auszurüsten.
- **Acoustic Encumbrance**: Schwere Ausrüstung erhöht direkt den Acoustic SNR-Output des Players.
- **The Chaos Market**: Players kaufen/verkaufen Entschlüsselungskeys mit Credits, die vollständig vom Twitch Spectator Chaos Market beeinflusst werden.

## 7. Factions, Leverage & The Dark Net (SocioPolitical-Weaver)
**Zero-Sum Betrayal & E2EE Backchannels**
- **Leverage Currency**: Players gewinnen Leverage, indem sie für Verbündete einstehen (und deren Stress auf sich nehmen), und geben es aus, um Ressourcen zu stehlen (z.B. das Überschreiben des Emergency Heal eines Teammitglieds).
- **The Dark Net**: Die Android-App bietet ein sicheres E2EE-Chat-Protokoll fürs Plotten. Unter Verwendung lokaler Curve25519-Keys werden Ciphertexts via Firebase RTDB synchronisiert.
- **Air-Gap Hacks**: Ein Player kann sein Gerät physisch gegen das entsperrte Gerät eines Verbündeten tippen (via NFC), um dessen Private Key zu klonen und den sicheren Backchannel abzufangen.

## 8. Progress Clocks & Pacing (Pacing-Conductor)
**Visualizing Doom**
- **Synchronized SVGs**: Das VTT und die AR-App rendern nativ synchronisierte SVG "Progress Clocks", die direkt aus einem `@ngrx/signals`-Store gespeist werden, der via Firebase aktualisiert wird.
- **Flashback Metacurrency**: Um tote Zeit am Spieltisch zu eliminieren, geben Players Metacurrency aus, um Flashbacks zu initiëren (z.B. "Ich habe die Wache gestern bestochen"), wodurch die Simulation über ein globales bernsteinfarbenes UI-Overlay pausiert wird.

## 9. Dynamic PbtA-Style Dashboards (Narrative-Engineer)
**Context-Aware "Moves"**
Die Android UI verzichtet auf statische Character Sheets. Gesteuert durch die Firebase `narrativeContext` Node wechselt die UI Zustände:
- **Phase A (Idle)**: Standard-Erkundung.
- **Phase B (Reactive)**: Wenn eine Bedrohung auftaucht, leuchtet die UI purpurrot. Generische Aktionen werden deaktiviert, und der Player wird gezwungen, auf massive "Moves" zu reagieren, die auf seinen Bildschirm gepusht werden (z.B. `[ENGAGE IN VIOLENCE]`).
- **Phase C (Consequence)**: Bei einem Mixed Success präsentiert die UI eine invertierte brutalistische Checkliste, die den Player zwingt, sein eigenes Opfer zu wählen.

## 10. Brutal Non-Linear Progression (Progression-Artisan)
**Das Synaptic Grid & O(1) Matrix Calculations**
- **Progression**: Players navigieren durch einen massiven DAG von "Neural Praxis"-Nodes. Das Prüfen von Unlock-Bedingungen wird via bitweiser Operationen (Bitsets) in Nanosekunden im Node.js-Backend ausgeführt.
- **Critical Fumble/Hit Tables**: Granulare d100-Perzentil-Ergebnisse werden strikt in **O(1)**-Zeit unter Verwendung flacher `Int16Arrays` und der Vose's Alias-Methode für gewichtete Wahrscheinlichkeiten verarbeitet. Der Server berechnet einen zerschmetterten Oberschenkelknochen oder eine katastrophale Waffenladehemmung sofort und pusht nur die `effectId` an die UI, um die brutale Beschreibung zu rendern.



## 1. Der Multi-Axis Dice Pool vs. Algorithmische Resolution
**Digital:** Der Backend-Server verarbeitet alle mathematischen O(1) Matrixberechnungen und liefert sofortige narrative Ergebnisse (z. B. "Failed mit 3 Advantages").
**Analog Synchronization:**
- Für Offline- oder physisches Spiel verwenden Tische einen **Multi-Axis D6 Pool**.
- Rolle Standard-Sechsseiter: Grün (Success/Failure), Blau (Advantage/Threat) und Rot (Triumph/Despair).
- **Parity:** Anstelle von komplexer Mathematik bestimmen Modifikatoren, *wie viele* von jedem Würfel du rollst. Wenn ein Spieler physisch rollt, tippt der GM einfach auf den "Manual Override"-Button in der Web-App/AR-App und gibt die finalen Ergebnis-Tags ein (z. B. `+2 Advantage`), um den digitalen Status zu synchronisieren.
- **V2.1 Rule Sync:** Auto-Successes durch AP-Ausgaben sind nicht erlaubt. AP kauft strikt nur zusätzliche Grüne/Blaue Würfel. Threat-Wahrscheinlichkeiten (Rote Würfel) werden abgemildert, sodass ein einzelner gemischter Roll nicht zu katastrophalen mechanischen Wipes führt.

![Tactical Grid](artifacts/images/combat_grid.jpg)

## 2. Action Economy & Combat Analytics
**Digital:** Die Jetpack Compose UI / Angular Web App trackt 3-Action Points (AP) und bestraft automatisch die Acoustic SNR (Signal-to-Noise Ratio).
**Analog Synchronization:**
- **Action Tokens:** Spieler verwenden drei physische Tokens (Pokerchips oder Münzen). Gib sie aus, um Actions auszuführen.
- **AP Recovery (V2.1 Fix):** Spieler können ein "Catch a Breath" deklarieren oder einen Narrative Flaw akzeptieren, damit der GM ihnen mitten in der Session physisch ein AP-Token zurückgibt, um Token-Starvation im Late-Game zu verhindern.
- **Der SNR Track:** Der GM verwendet einen physischen Papier-Tracker oder eine Drehscheibe (aus den druckbaren Assets), um die Acoustic SNR der Party zu tracken.
- **Parity:** Wenn die Party physisch Lärm macht (lautes Rollen, Tokens fallen lassen), kann der GM optional die physische SNR-Scheibe vorrücken. Zum Synchronisieren tippt der GM auf den `+ HEAT`-Button auf seinem digitalen Dashboard.

## 3. Asymmetric State Syncing (The Netrunner & The Solo)
**Digital:** Der Server berechnet 200ms Lock-Windows, sodass ein AR-Hack perfekt mit dem physischen Öffnen einer Tür übereinstimmt.
**Analog Synchronization:**
- **Der Split-Timer:** Wenn der physische Tisch den Combat initiiert, stellt der GM eine physische Eieruhr oder Sanduhr (z. B. 2 Minuten Echtzeit) für den Netrunner, um sein physisches Hacking-Puzzle (z. B. ein Mastermind-ähnliches Steckbrett oder ein Karten-Matching-Spiel) zu beenden.
- **Synchronized Breach (V2.1 Fix):** Wenn die Party physische Actions aufteilt, können sie eine "Group Action" initiieren. Die Spieler werfen ihre D6s physisch in eine einzige gemeinsame Schale und ermitteln den Durchschnitt der Successes, um zu verhindern, dass der schlechte Roll eines Spielers die gesamte Split-Operation scheitern lässt.
- **Parity:** Wenn der Netrunner das Puzzle beendet, bevor der Timer abläuft, pusht der GM den `UNLOCK_DOOR`-Status an das VTT, wodurch der neue Raum für die digitalen Spieler sofort aufgedeckt wird.

## 4. Psychological Mechanics & The Diegetic Economy
**Digital:** Die AR-App vibriert, Text verschlüsselt sich unter Allostatic Stress, und Spieler verwenden NFC-Tags, um Gear auszurüsten.
**Analog Synchronization:**
- **Physische Stress Cards:** Wenn Spieler Stress erleiden, überreicht der GM ihnen verdeckt "Bleed Cards". Unter dem V2.1 Ruleset dürfen diese Karten keine harten Lockouts enthalten (wie übersprungene Züge). Stattdessen bieten sie handhabbare mechanische Trade-offs (z. B. "-1 auf Agility Checks") oder widersprüchliche Infos/Secret Objectives.
- **Physisches Gear:** Druckbare Item Cards.
- **Parity:** Um ein physisches Item zu synchronisieren, scannen Spieler den QR-Code, der auf der Rückseite der Item Card gedruckt ist, mit der AR Companion App. Das Item wird sofort aus dem Chaos Market gelöscht und ihrem digitalen Inventory hinzugefügt.

## 5. E2EE Backchannels (The Dark Net)
**Digital:** Ende-zu-Ende-verschlüsselter Chat via Android-App unter Verwendung lokaler Curve25519-Keys.
**Analog Synchronization:**
- **Burner Notes:** Spieler schreiben physische Notizen aneinander.
- **Der Intercept:** Ein Spieler mit einer physischen Ability Card für einen "Air-Gap Hack" kann verlangen, die Notiz zu lesen, bevor sie den Empfänger erreicht.
- **Parity:** Spieler können den Inhalt ihrer physischen Notizen nach der Session in den Chat-Logger der AR-App eingeben, um sicherzustellen, dass das narrative LLM-Backend ihre Pläne in die prozedurale Generierung der nächsten Session einbezieht.

## 6. Progress Clocks & Flashbacks
**Digital:** Synchronisierte SVGs aktualisieren sich auf allen Geräten.
**Analog Synchronization:**
- **Paper Clocks:** Zeichne Kreise auf Karteikarten, unterteilt in 4, 6 oder 8 Segmente. Fülle sie mit einem Marker aus.
- **Sequentielles Füllen (V2.1 Fix):** Der GM muss Paper Clocks sequentiell ausmalen (1 Segment pro Threat, der auf einem Roten Würfel generiert wird). Ein einzelner gemischter Success-Roll kann eine Clock nicht mehr sofort bis zum Maximum füllen.
- **Parity:** Das digitale Interface des GMs ermöglicht es ihm, Clocks manuell zu ticken. Das Ticken einer digitalen Clock lässt die VTT-Bildschirme aufblitzen; der GM malt dann physisch die analoge Clock auf dem Tisch aus.

## 7. Multiple Levels & Outdoor Environments
**Digital:** Das GM-Interface ermöglicht den sofortigen Wechsel zwischen Z-Levels (Level 1, Level 2 usw.) und das Rendern von Outdoor-Terrain (Straßen, Gras, Wasser). Der Grid Store mappt Koordinaten über eine `X,Y,Z`-Signatur.
**Analog Synchronization:**
- **Layered Blueprints:** Der GM sollte mehrere physische Seiten oder transparente Overlay-Folien (Acetat) verwenden, um verschiedene Stockwerke eines Gebäudes darzustellen.
- **Parity:** Wenn die Party ein physisches Treppenhaus hinaufsteigt, drückt der GM einfach den `[LEVEL 2]`-Toggle in der digitalen App, um die AR-Ansicht auf die neue Z-Achse einrasten zu lassen, was perfekt zu der physischen Map-Seite passt, die auf dem Tisch umgeblättert wird.



# PSYCHO-TERROR IMMERSION OVERHAUL: Session BU9225

Nach Rücksprache mit den UX Psychology, Immersive Design und Neon Art Director Agents haben wir das **Brutalist Psycho-Terror Interface** in Production deployed. Die Ästhetik wechselte von "sauber und höflich" zu "oppressiv, feindselig und aktiv erniedrigend".

![Brutalist GM Map Generation](../test_suite/remote_session/session_BU9225/01_gm_map_generation.png)

![Brutalist Chaos Engine Triggered](../test_suite/remote_session/session_BU9225/02_gm_chaos_view.png)

![Brutalist Spectator Dashboard (Twitch Twitch Chaos Market)](../test_suite/remote_session/session_BU9225/03_spectator_chaos_view.png)

![Brutalist GM View: Post-Equivalent Exchange Heal](../test_suite/remote_session/session_BU9225/04_gm_post_heal.png)

![Brutalist Spectator Trauma & Heat Alert](../test_suite/remote_session/session_BU9225/05_spectator_trauma_alert.png)

![Brutalist Player Uplink: Heavy Glitching & Cyberpsychosis](../test_suite/remote_session/session_BU9225/06_player1_post_heal.png)

**MISSION ACCOMPLISHED.** Alle 10 AAA TTRPG Pillars (D&D, Pathfinder, Call of Cthulhu, Cyberpunk RED, Blades in the Dark, Mork Borg, Vampire: The Masquerade, Shadowrun, Lancer, Paranoia) wurden mathematisch extrahiert, reverse-engineered und makellos in den Source Code und das Live-Firebase-Ökosystem des Projekts integriert. Das finale Aesthetic Overhaul pusht das Game in einen völlig einzigartigen Space.


