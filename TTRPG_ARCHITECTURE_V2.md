# TTRPG ARCHITECTURE V2: LIMIT-BREAK INITIATIVE

This document represents the synthesized architectural roadmap for the next generation of the Zero Sum RPG engine and its augmented reality (AR) Android companion app. It integrates the core philosophies of 10 TTRPG titans into a seamless, highly performant real-time system.

---

## 1. Core Mechanics & Mathematical Flatness (MassMarket-Architect)
**Bounded Accuracy & API-Friendly JSON**
The system abandons the volatile 0-100 percentile scales in favor of flat, strictly bounded integers (1-20). This ensures modifiers (+/- 1 to 3) remain highly impactful. To guarantee zero parsing lag in the Android AR app, all mathematical calculations are completely offloaded to the server. The client consumes a flat, pre-computed JSON schema:
- `stealth_total` is passed directly; the client never iteratively calculates modifiers.
- Conditions are flat enums (e.g., `CYBERPSYCHOSIS`) for instant O(1) condition checks.

## 2. Action Economy & Combat Analytics (Tactical-Mathematician)
**The 3-Action Economy & Firebase Tag Engine**
Based on extensive Monte Carlo simulations, the combat engine utilizes a 3-Action Point (AP) system per turn. 
- "Attack Spam" generates compounding Acoustic SNR penalties, alerting massive swarms.
- Players must balance AP across Combat, Hacking, and Stress Management.
- **AP Recovery & Standardization (V2.1 Fix):** Players can no longer spend multiple AP to bypass rolls (auto-success is disabled). AP strictly adds modifier dice (Green/Blue) to pools. To prevent late-game AP starvation, players can execute a "Catch a Breath" move to regain 1 AP, or deliberately accept a Narrative Flaw complication for an instant AP refund.
- A **Modular Tag System** runs on the Firebase Backend, resolving additive maths and boolean overrides (e.g., `BUFF:ACCURACY:+2:1_TURN`) before pushing the final reduced state array down to the AR app's Jetpack Compose UI.

## 3. Asymmetric State Syncing (Asymmetric-Integrator)
**Solving the Split-Party Problem**
When the Netrunner is infiltrating a data-fortress via the AR app while the Solo is fighting on the VTT, the backend enforces a unified **Simultaneous Resolution Queue** via WebSockets/Socket.io. 
- Real-time and turn-based contexts are bridged by mapping "AR Hacks" to specific AP costs.
- **Group Action Mechanic (V2.1 Fix):** To fix clunky split-party analog syncing, players can initiate a "Synchronized Breach." They pool their dice and average their successes, or spend AP to "Assist" an ally on a split-front, preventing a single bad roll from catastrophically failing a dual-operation.
- The state is locked for 200ms windows to calculate split-party events, ensuring the Netrunner's successful ICE decryption exactly correlates to the physical door unlocking on the VTT for the Solo.

## 4. Multi-Axis Resolution Engine (MultiAxis-Resolutor)
**Narrative Dice Pools & Backend Offloading**
Binary pass/fail is replaced with a multidimensional dice pool (Success/Failure, Advantage/Threat, Triumph/Despair). 
- **Threat Re-Balancing & Sequential Clocks (V2.1 Fix):** The probability of Red "Danger" dice triggering catastrophic failures has been softened. Furthermore, multi-segment Paper Clocks must fill sequentially (one tick per Threat generated). A single mixed-success roll can no longer jump a clock to maximum.
- **The "Dumb" Client**: The Android app sends only the player's intent and context tags (e.g., `"action": "hack", "context": ["under_fire"]`).
- **Server-Side Generation**: The backend Core calculates the dice pool, executes the RNG roll, and translates the mechanical state changes.
- **LLM Narrative Injection**: The backend uses a secure internal LLM to translate mechanical results (e.g., "Failed with 3 Advantages") into rich, contextual prose before piping the finalized narrative and state updates back to the client.

## 5. Psychological Mechanics & UI Glitching (Psychological-Engineer)
**Exploiting the AR Device for Paranoia**
The AR companion app acts as a conduit for "bleed." 
- **Hidden Notifications**: The GM can send secure push notifications to specific players via the Firebase FCM layer, feeding them hallucinations or contradictory intel.
- **Manageable Bleed Cards (V2.1 Fix):** The physical/digital "Bleed Cards" no longer enforce hard mechanical lockouts (e.g., skipped turns or forced blinding). Instead, they enforce narrative complications and manageable trade-offs (e.g., "-1 to Agility checks unless you recklessly push forward"), removing the un-fun death spiral.
- **Allostatic Stress Glitching**: As a player's Allostatic Load crosses thresholds, the Jetpack Compose UI physically degrades—text scrambles, screens tear via shaders, and the device utilizes its haptic motor to mimic a racing heartbeat.

## 6. The Diegetic Economy & Hardware Interaction (Diegetic-Economist)
**The AR Neural Deck**
The companion app is not a meta-tool; it exists in-universe.
- **NFC Gear Equip**: Players use their physical device to scan NFC tags or AR markers to equip gear.
- **Acoustic Encumbrance**: Heavy gear directly increases the player's Acoustic SNR output.
- **The Chaos Market**: Players buy/sell decryption keys using Credits influenced entirely by the Twitch spectator Chaos Market.

## 7. Factions, Leverage & The Dark Net (SocioPolitical-Weaver)
**Zero-Sum Betrayal & E2EE Backchannels**
- **Leverage Currency**: Players gain leverage by covering for allies (taking their Stress) and spend it to steal resources (e.g., overriding a teammate's Emergency Heal).
- **The Dark Net**: The Android app features a secure E2EE chat protocol for plotting. Using local Curve25519 keys, ciphertexts are synced via Firebase RTDB. 
- **Air-Gap Hacks**: A player can physically tap their device against an ally's unlocked device (via NFC) to clone their private key and intercept their secure backchannel.

## 8. Progress Clocks & Pacing (Pacing-Conductor)
**Visualizing Doom**
- **Synchronized SVGs**: The VTT and the AR app natively render synced SVG "Progress Clocks" fed directly from a `@ngrx/signals` store updated via Firebase.
- **Flashback Metacurrency**: To eradicate dead table time, players spend Metacurrency to initiate Flashbacks (e.g., "I bribed the guard yesterday"), pausing the simulation via a global UI amber tint overlay.

## 9. Dynamic PbtA-Style Dashboards (Narrative-Engineer)
**Context-Aware "Moves"**
The Android UI abandons static character sheets. Driven by the Firebase `narrativeContext` node, the UI shifts states:
- **Phase A (Idle)**: Standard exploration.
- **Phase B (Reactive)**: When a threat emerges, the UI glows crimson. Generic actions disable, and the player is forced to react to massive "Moves" pushed to their screen (e.g., `[ENGAGE IN VIOLENCE]`).
- **Phase C (Consequence)**: On a mixed success, the UI presents an inverted brutalist checklist forcing the player to choose their own sacrifice.

## 10. Brutal Non-Linear Progression (Progression-Artisan)
**The Synaptic Grid & O(1) Matrix Calculations**
- **Progression**: Players navigate a massive DAG of "Neural Praxis" nodes. Checking unlock conditions is executed via bitwise operations (Bitsets) in nanoseconds on the Node.js backend.
- **Critical Fumble/Hit Tables**: Granular d100 percentile outcomes are processed strictly in **O(1)** time using flat `Int16Arrays` and the Vose's Alias Method for weighted probabilities. The server calculates a shattered femur or catastrophic weapon jam instantly, pushing only the `effectId` to the UI to render the brutal description.

---

### Implementation & Deployment Plan (Stage 1)
1.  **Architecture Initialization**: Refactor `core-domain` into the proposed JSON schema. 
2.  **WebSockets & MCP Server Integration**: Build the Model Context Protocol (MCP) server endpoints allowing the internal LLM to directly interpret dice pool states.
3.  **Firebase Rule Locking**: Implement the E2E encryption namespaces and tighten RTDB `.read/.write` rules for the diegetic UI updates.

**Awaiting Executive `/approve` to begin iterative codebase rewrites.**
