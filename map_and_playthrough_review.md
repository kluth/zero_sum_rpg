# Zero Sum RPG - Map-Building & Playthrough Review

This document provides a comparative analysis of the map-building mechanics in Zero Sum RPG relative to Pen & Paper (P&P) RPG standards, proposes UX/UI enhancements for the Angular Spectator Web App, and identifies missing playthrough scenarios to expand automated screenshot coverage.

---

## 1. P&P RPG Standards Comparison

| Mechanic | Pen & Paper (P&P) RPG Standards | Zero Sum RPG Implementation | Comparison & Recommendations |
| :--- | :--- | :--- | :--- |
| **Fog of War (FoW)** | Traditionally handled manually by GMs covering maps with paper sheets or dry-erase markers. VTTs (Virtual Tabletops) dynamically reveal areas based on grid distance and light sources. | Implemented programmatically. Players have an active field-of-view radius (e.g. 5-6 tiles) that reveals grid points and structures in real-time. | Zero Sum RPG aligns with modern VTT FoW. However, P&P standard requires memory/retention of structural layouts (drawing maps remains visible once explored, while dynamic entities like monsters/traps fade back into the fog). The room memory logic (`isMemory = true; isVisible = true;`) should be strictly enforced. |
| **Line of Sight (LoSight / LOS)** | Calculated via standard geometric raycasting or GM estimation. Blocked by heavy terrain, columns, walls, closed doors. | Raycasting is handled via Bresenham's line algorithm (`hasLineOfSight`) to evaluate tile visibility. A cell blocks line of sight if it is a `wall` or a `door_locked`. | The logic is robust, but rooms were previously checked solely by distance to center rather than verifying line of sight to the room entrance or center, leading to immersion-breaking room reveals through solid walls. Integrating LOS checks before revealing a room is critical to match standard P&P rules. |
| **Prep vs. Dynamic Painting** | GMs prep maps before sessions (static dungeon design) and paint dynamically (draw hazards, debris, grease, fires, barriers) during a scene. | GMs can place prefabs (e.g., Corridor, MedBay, Data Terminal) or use a "Tile Painter" to paint walls, doors, CCTV nodes, and furniture dynamically. | Zero Sum RPG successfully merges prep with dynamic painting. The grid sync mechanism (`SYNC GRID TO RTDB`) ensures the GM can manipulate the state mid-game. |
| **Block Limits** | Infinite in physical drawing (limited only by map size). In physical board games, constrained by physical tile pieces (e.g., 50 floor tiles in box). | Hard-capped at 50 blocks in the UI building block pool to prevent performance degradation on Firebase Realtime Database. | The 50-block limit mimics boxed tabletop board games. However, a warning/danger color threshold in the UI helps GMs manage resource constraints dynamically. |
| **Room Properties** | Rooms have descriptive notes (flavor text, threat, lock details, ambient traps). | Rooms have customizable metadata: Tag (e.g. MedBay), Threat Level (low/medium/critical), and VFX properties (red flash, blue flicker, glitch). | Matches P&P standards. However, in Zero Sum RPG, these properties sync instantly to database nodes to change visual indicators (like alarms or glitch effects) for spectator and player screens. |

---

## 2. Angular Spectator Web App UX/UI Improvements

To elevate the spectator experience to professional broadcast standards (similar to Twitch streaming overlays or professional tournament screens), the following improvements should be made:

1. **Dense Layout / CSS Grid Column Layout**:
   - Instead of a single vertical stack, a three-column dashboard is ideal:
     - **Left Column**: Live console logs (dice rolls, Twitch market value, donation logs).
     - **Center Column**: Large PixiJS tactical map canvas for high visual focus.
     - **Right Column**: Squad status cards detailing active characters, HP pools, stress levels, and stealth statuses.
2. **Accessibility & Contrast**:
   - Use high-contrast cyber-aesthetic palettes (e.g., bright neon greens `#00FF00`, neon blues `#00E5FF`, neon reds `#FF2A2A`).
   - Standardize sidebar borders with distinct glowing neon shadows (`box-shadow: 0 0 10px ...`) to improve visibility on low-contrast screens.
3. **Pulsating Alert Bar**:
   - A highly visible, pulsating alert bar at the top of the interface to warn viewers when the GM increases global threat/heat to high levels (heat >= 8) or when a trauma event occurs.
4. **Token Indicators**:
   - Visually distinct indicator rings around character tokens:
     - Green Ring: Stealth level is >= 50 (character is actively hiding/stealthy).
     - Red Ring: Stealth level is < 50 (character is compromised/exposed).
5. **Loaders & Feedback**:
   - Better feedback for asynchronous state operations (e.g., Netrunner network ping or Firebase sync status).

---

## 3. Playthrough Scenarios for Automated Screenshot Coverage

To fully validate client UI states under diverse game scenarios, we should expand automated Playwright screenshots to cover:

1. **GM Panel Properties Edit**:
   - GM clicks a room/prefab on the canvas, opens the properties tab, modifies the Threat/VFX metadata, and clicks the sync button.
2. **WFC Generate Squeeze Failure Output**:
   - Triggering the Wave Function Collapse (WFC) generation algorithm and showing the error fallback message when maximum recursion limits are reached.
3. **High Heat / Alarm State**:
   - Stepping global heat up to 8+ or triggering a trauma event to capture the blinking red alert bar / billboard visual overload.
4. **Netrunner Terminal Help & Grep Command**:
   - Inputting `help` and `grep` commands into the Netrunner terminal to verify LLM-ICE prompt processing and command assistance output.
5. **Netrunner BLE Connection Attempt**:
   - Interacting with the Bluetooth Low Energy beacon connection button and verifying terminal log outputs.
6. **Twitch Donation Simulator Click**:
   - Clicking the twitch donation simulator button to verify that the Spectator View's Twitch market value updates and changes color dynamically.
