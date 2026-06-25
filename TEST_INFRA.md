# Zero Sum RPG E2E Test Suite Infrastructure

## 1. Test Philosophy
The Zero Sum RPG UI Overhaul E2E Test Suite is structured as a **Dual Track** system that mirrors the game's immersive, in-universe dual-system aesthetics (Corporate OS vs. Underground Terminal). 
Testing verifies:
- **Diegetic OS immersion**: Ensuring that UI elements behave as in-universe computer terminals, biometric scanners, and air-gapped hardware controllers rather than generic game screens.
- **Accessibility & Stability**: Ensuring that high-stress game states (like alarms, visual glitching, or CRT screens) can be stabilized dynamically by the user to avoid motion sickness or accessibility issues.
- **Touch & Mobile ergonomics**: Validating layouts on standard mobile dimensions, ensuring touch boundaries adhere to standard target guidelines (minimum 44x44px), and swipe area navigations function reliably.
- **Robustness**: Running comprehensive test suites divided into specific quality tiers, including standard feature tests, boundary checks, pairwise integration, and actual user journeys.

---

## 2. Feature Inventory
The E2E test suite validates the following 5 main features:
1. **Routing & Shells**: Landing page login flow, role-based shell routing (GM Dashboard `/gm`, Player Desktop `/player`, Spectator Broadcast `/spectator`), and visual glitch transition loaders (`.reception-loader-container` or `.glitch-text`).
2. **Theme Switching**: Seamless swapping between the *Corporate OS* theme (`theme-corporate` body class) and *Underground Terminal* theme (`theme-terminal` body class) using the `[data-test-id="theme-toggle"]` toggle control, persisting across page refreshes.
3. **Diegetic Elements**: Core operational interaction points like the biometric scanner hold-trigger (`[data-test-id="biometric-scanner"]`), Netrunner terminal inputs/logs (`[data-test-id="terminal-input"]`, `[data-test-id="terminal-logs"]`), and legal/lore verification agreements via the signature canvas (`canvas[data-test-id="nda-canvas"]`, `[data-test-id="nda-approve-btn"]`).
4. **Accessibility & Stabilizer**: Toggling visual noise reduction (`[data-test-id="stabilizer-toggle"]` yielding a `motion-stabilized` or `stabilized` state class) and emergency action triggers (`[data-test-id="emergency-heal-btn"]`).
5. **Touch & Mobile Ergonomics**: Layout adaptation and interactions like the touch-friendly swipe container (`[data-test-id="swipe-area"]`) and overlapping desktop task layouts (`.os-window`).

---

## 3. Test Architecture
The test suite utilizes a unified test runner (`run_tests.js`) and Puppeteer framework to programmatically control Chromium:
```
                              +----------------------------+
                              |      npm / node runner     |
                              +-------------+--------------+
                                            |
                                  spawns / starts
                                            |
                      +---------------------+---------------------+
                      |                                           |
        +-------------v-------------+               +-------------v-------------+
        |  Static Angular App Server|               | Firebase RTDB Emulator    |
        |  (Port 4200 via Node http) |               | (Port 9000 Emulator suite)|
        +-------------+-------------+               +-------------+-------------+
                      |                                           |
                      |                 interacts                 |
                      +---------------------+---------------------+
                                            |
                                            |
                              +-------------v-------------+
                              |      Puppeteer Browser    |
                              |   (In-Process Execution)  |
                              +-------------+--------------+
                                            |
                                       runs tests
                                            |
                      +---------------------+---------------------+
                      |             |             |               |
                 +----v----+   +----v----+   +----v----+    +-----v-----+
                 |  Tier 1 |   |  Tier 2 |   |  Tier 3 |    |   Tier 4  |
                 |  Core   |   | Boundary|   | Pairwise|    |  Journeys |
                 +---------+   +---------+   +---------+    +-----------+
```

### Mocks & Interceptions
To keep tests deterministic:
- **Network Interception**: Handled in `test_suite/helpers.js#setupPage()`. Outgoing image requests targeting unsplash, picsum, or ui-avatars are intercepted and served dummy SVG placeholders to eliminate external web dependencies.
- **Hardware Mocks**: `navigator.bluetooth` API is mocked on page document creation so that device requests, GATT connection simulations, and custom telemetry data work without physical hardware.

---

## 4. Test Selector Contract
To decouple development implementation from tests, a formal Selectors Contract is established:

| Selector | UI Element / Target Description | Expected View/Context |
|---|---|---|
| `input[name="key"]` | Landing page session key text input field | Landing page (`/`) |
| `input[value="gm"] + .role-card` | GM/Administrator role selection card trigger | Landing page (`/`) |
| `input[value="player"] + .role-card` | Player/Agent role selection card trigger | Landing page (`/`) |
| `input[value="spectator"] + .role-card` | Spectator role selection card trigger | Landing page (`/`) |
| `button.zs-btn` | Primary sign-in / join session action button | Landing page (`/`) |
| `[data-test-id="theme-toggle"]` | Clickable theme toggler button | GM / Player dashboards |
| `theme-corporate` vs `theme-terminal` | Theme body classes to toggle layout styles | `<body>` tag |
| `.reception-loader-container` or `.glitch-text` | Visual loading glitch animation container | Route transition state |
| `[data-test-id="biometric-scanner"]` | Fingerprint scanner target needing hold click | Player dashboard |
| `[data-test-id="terminal-input"]` | Text input line for typing console commands | Netrunner workspace |
| `[data-test-id="terminal-logs"]` | Text logs terminal console container | Netrunner workspace |
| `canvas[data-test-id="nda-canvas"]` | Drawing canvas for legal NDA operator sign-off | Player dashboard |
| `[data-test-id="nda-approve-btn"]` | Approval action button for signature canvas | Player dashboard |
| `[data-test-id="stabilizer-toggle"]` | Toggle button to enable motion stabilization | Player / GM workspaces |
| `[data-test-id="emergency-heal-btn"]` | Critical triage heal click button | Player dashboard |
| `[data-test-id="swipe-area"]` | Touch swipe region for mobile ergonomic switching | Mobile Player layout |
| `.os-window` | Active application/game task containers | Player desktop |

---

## 5. Coverage Tiers

### Tier 1: Core Functionality (25 Tests)
Ensures standard flows and UI shells render and basic navigation functions correctly under normal conditions. 
- *Feature A (Routing & Shells)*: Tests 1-7.
- *Feature B (Theme Switching)*: Tests 8-13.
- *Feature C (Diegetic Elements)*: Tests 14-20.
- *Feature D (Accessibility & Stabilizer)*: Tests 21-23.
- *Feature E (Touch & Mobile Ergonomics)*: Tests 24-25.

### Tier 2: Boundary & Corner Cases (25 Tests)
Verifies error boundary handling, resilience against malformed inputs, spamming of interface controls, state persistence, and system environment fallbacks.
- *Routing Limits*: Tests 1-6 (Empty inputs, length extremes, redirect blocks, special chars).
- *Theme Limits*: Tests 7-11 (Spam toggle, database override events, storage failures, system preferences).
- *Diegetic Limits*: Tests 12-16 (Scanner release/drag-out interrupt, terminal size overflow, blank signature canvas, scale adjustments).
- *Stabilizer Limits*: Tests 17-20 (State route persistence, extreme font zoom reflows, button cooling controls, focus loops).
- *Touch Limits*: Tests 21-25 (Drag offsets, viewport orientation, audio autoplay restrictions).

### Tier 3: Pairwise Combinations (5 Tests)
Validates cross-feature integrations:
1. **Theme Switch + Netrunner Terminal**: Verifies console logs maintain high-contrast legibility under the active terminal theme.
2. **Accessibility Stabilizer + Glitch Transition**: Ensures glitch animation loaders bypass intensive motion when stabilizer mode is toggled.
3. **One-Handed Mobile + Biometric Scanner**: Verifies scanner dimensions and position on mobile are within thumb-reach safety margins.
4. **Accessibility Stabilizer + Signature Canvas**: Confirms canvas input filters out minor pointer jitter when system stabilization is active.
5. **Mobile Viewport Swipe + Role Switcher**: Verifies horizontal swiping gestures trigger routing changes.

### Tier 4: Real-World Application Scenarios (5 Tests)
Simulates actual user session journeys:

| Scenario Name | Description | Key Features Exercised |
|---|---|---|
| **Hacked Uplink** | Netrunner logs in, switches to terminal theme, runs system override terminal commands, and checks console logs. | Routing, Theme Switching, Diegetic Elements (Terminal) |
| **Dystopian Stress Playtest** | Player undergoes hazard triggers (flashing colors/shake), uses emergency healing, and performs a biometric scanning authorization. | Diegetic Elements (Scanner), Accessibility, Routing |
| **One-Handed Mobile Operator** | Operator on mobile layout verifies task window auto-stacking and performs swipes to swap desktop modules. | Touch & Mobile Ergonomics, Routing |
| **High-Accessibility Rebel** | User activates stabilizer, zooms font size, draws signature path, and submits the NDA. | Accessibility (Stabilizer/Zoom), Diegetic Elements (NDA Canvas) |
| **Multi-Role Sync & Recovery** | GM triggers event on Firebase DB; Player's active UI receives real-time event signal, updating UI. | Routing, Diegetic Elements, Firebase Database Sync |

---

## 6. Invocation and Command Guide

All E2E tests are driven from the `/test_suite` directory.

### Run All Tiers
Starts the local server and Firebase emulator, runs all four test tiers, and reports the overall results.
```bash
node test_suite/run_tests.js
```

### Run a Specific Tier
Run a single tier file (`tier1`, `tier2`, `tier3`, or `tier4`) by appending it as an argument:
```bash
node test_suite/run_tests.js tier1
node test_suite/run_tests.js tier2
node test_suite/run_tests.js tier3
node test_suite/run_tests.js tier4
```

### Via NPM Scripts
You can also run the suite using NPM from the project root or the test_suite folder:
```bash
# From project root
npm --prefix test_suite run test tier1

# From test_suite directory
npm test tier1
```

*Note: Since the implementation track develops these visual components concurrently, some selector targets may fail on early code stages. The runner prints these errors clearly, logs detailed status, and exits with code 1 if failures occur.*
