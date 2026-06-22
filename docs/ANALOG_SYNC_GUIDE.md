# ZERO-SUM RPG: HYBRID REALITY SYNC GUIDE

This guide provides the official framework for synchronizing physical "analog" tabletop gameplay with the "augmented/digital" engine. Zero-Sum RPG is designed to be played seamlessly across both mediums, allowing tables to mix and match digital convenience with tactile physical play.

---

## 1. The Multi-Axis Dice Pool vs. Algorithmic Resolution
**Digital:** The backend server handles all O(1) mathematical matrix calculations, delivering immediate narrative results (e.g., "Failed with 3 Advantages").
**Analog Synchronization:**
- For offline or physical play, tables utilize a **Multi-Axis D6 Pool**. 
- Roll standard six-sided dice: Green (Success/Failure), Blue (Advantage/Threat), and Red (Triumph/Despair).
- **Parity:** Instead of complex math, modifiers dictate *how many* of each die you roll. If a player rolls physically, the GM simply taps the "Manual Override" button on the Web-App/AR-App and inputs the final result tags (e.g., `+2 Advantage`) to sync the digital state.

## 2. Action Economy & Combat Analytics
**Digital:** The Jetpack Compose UI / Angular Web App tracks 3-Action Points (AP) and automatically penalizes Acoustic SNR (Signal-to-Noise Ratio).
**Analog Synchronization:**
- **Action Tokens:** Players use three physical tokens (poker chips or coins). Spend them to take actions.
- **The SNR Track:** The GM uses a physical paper tracker or spinning dial (from the printable assets) to track the party's Acoustic SNR. 
- **Parity:** When the party makes noise physically (rolling loudly, dropping tokens), the GM can optionally advance the physical SNR dial. To sync, the GM taps the `+ HEAT` button on their digital dashboard.

## 3. Asymmetric State Syncing (The Netrunner & The Solo)
**Digital:** The server calculates 200ms lock-windows so an AR hack perfectly coincides with a physical door opening.
**Analog Synchronization:**
- **The Split-Timer:** When the physical table initiates combat, the GM sets a physical egg-timer or hourglass (e.g., 2 minutes real-time) for the Netrunner to complete their physical hacking puzzle (e.g., a mastermind-style peg board or card matching game).
- **Parity:** If the Netrunner finishes the puzzle before the timer drops, the GM pushes the `UNLOCK_DOOR` state to the VTT, instantly revealing the new room to the digital players.

## 4. Psychological Mechanics & The Diegetic Economy
**Digital:** The AR App vibrates, text scrambles under Allostatic Stress, and players use NFC tags to equip gear.
**Analog Synchronization:**
- **Physical Stress Cards:** As players take stress, the GM hands them "Bleed Cards" face down. These cards contain contradictory intel or secret objectives.
- **Physical Gear:** Printable item cards.
- **Parity:** To sync a physical item, players scan the QR code printed on the back of the item card using the AR Companion App. The item is instantly deleted from the Chaos Market and added to their digital inventory.

## 5. E2EE Backchannels (The Dark Net)
**Digital:** End-to-end encrypted chat via the Android app using local Curve25519 keys.
**Analog Synchronization:**
- **Burner Notes:** Players write physical notes to each other. 
- **The Intercept:** A player with an "Air-Gap Hack" physical ability card can demand to read the note before it reaches the recipient.
- **Parity:** Players can input the contents of their physical notes into the AR App's chat logger post-session to ensure the narrative LLM backend incorporates their plotting into the next session's procedural generation.

## 6. Progress Clocks & Flashbacks
**Digital:** Synchronized SVGs update across all devices.
**Analog Synchronization:**
- **Paper Clocks:** Draw circles on index cards, divided into 4, 6, or 8 segments. Fill them in with a marker.
- **Parity:** The GM's digital interface allows them to manually tick clocks. Ticking a digital clock will flash the VTT screens; the GM then physically shades in the analog clock on the table.

## 7. Multiple Levels & Outdoor Environments
**Digital:** The GM interface allows instantly toggling between Z-levels (Level 1, Level 2, etc.) and rendering outdoor terrain (streets, grass, water). The Grid Store maps coordinates via an `X,Y,Z` signature.
**Analog Synchronization:**
- **Layered Blueprints:** The GM should use multiple physical pages or transparent overlay sheets (acetate) to represent different floors of a building.
- **Parity:** When the party ascends a physical stairwell, the GM simply presses the `[LEVEL 2]` toggle on the digital app to snap the AR view to the new Z-axis, perfectly matching the physical map page being flipped on the table.

---
*All analog rulebooks and digital codebases are maintained in parity. Every digital action has a physical analog, and every physical roll can be ingested by the digital engine.*
