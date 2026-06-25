# Project: Zero Sum RPG UI Overhaul

## Architecture
Zero Sum RPG web client is built on Angular Standalone components. The overhaul reorganizes the application into routed view shells, migrates standard CSS to SCSS, integrates Tailwind utility tokens, and implements a Diegetic dual-system aesthetic (Corporate OS vs. Underground Terminal) with accessibility stabilizer and touch-mobile ergonomics.

### Data Flow & Routing
- Root layout (`app.component.html`) contains the router outlet.
- Routes:
  - `/` -> `LandingComponent` (Lobby)
  - `/gm` -> `GmViewComponent` (GameMaster Dashboard)
  - `/player` -> `PlayerViewComponent` (Player desktop environment)
  - `/spectator` -> `SpectatorViewComponent` (Spectator feed layout)
- Navigation requires a stored authentication token `zero_sum_token` in `localStorage`. If missing, direct routes redirect to `/`.

### Component State & Real-Time Sync
- **Firebase Database**: Real-time game state synchronization via `sessions/${sessionId}/gameState`.
- **WebRTC P2P**: Ultra-low-latency sync (e.g. coordinates movement) direct between Player & GM nodes.
- **GridStore**: Local signal-based state tracking for grid rooms, dimensions, and visual assets.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | SCSS Migration | Convert all 12 CSS files to SCSS, configure workspace styles, resolve MD3 token mismatches in `styles.scss` | None | PLANNED |
| 2 | Routing & Access Guards | Configure `app.routes.ts` with guards. Restrict direct navigation without `zero_sum_token` in localStorage (redirect to `/`). Introduce a loading glitch transition loader. | M1 | PLANNED |
| 3 | Diegetic UI & Theming | Implement theme switcher (`theme-corporate` vs `theme-terminal`), biometric scanner hold action, NDA signature canvas, stabilizer motion reduction, and mobile swipe controls. | M2 | PLANNED |
| 4 | E2E test verification | Run `node test_suite/run_tests.js` to ensure 100% test passes (60/60 tests) across all four tiers. | M3 | PLANNED |

## Interface Contracts
### Route Guard Contract
- If `localStorage.getItem('zero_sum_token')` is falsy, navigation to `/gm`, `/player`, or `/spectator` must redirect back to `/`.

### Theme Switching Contract
- Selector: `[data-test-id="theme-toggle"]`
- Action: Toggles body class between `theme-corporate` (default, or when terminal theme is inactive) and `theme-terminal`.
- Persistence: Store theme state in `localStorage` (`zero_sum_theme` = `'terminal'` or `'corporate'`) and apply it on boot.

### Biometric Scanner Contract
- Selector: `[data-test-id="biometric-scanner"]`
- Action: Requires continuous mouse down (holding) for > 1.0 seconds. 
- Success indicator: If successfully held, adds class `scan-success` to scanner element and sets inner text to contain 'Success' or 'Authorized'.
- Interruption: Releasing early (< 1.0s) or dragging pointer out of bounds resets scan progress.

### NDA Signature Canvas Contract
- Selector: `canvas[data-test-id="nda-canvas"]`
- Submit selector: `[data-test-id="nda-approve-btn"]`
- Behavior: Canvas tracks drawing path. Cannot approve signature if canvas is blank. Window resizing must not disrupt signature state.
- Stabilization: When stabilizer mode is enabled, canvas element receives `data-stabilized="true"` or class `stabilized-draw`.

### Accessibility Stabilizer Contract
- Selector: `[data-test-id="stabilizer-toggle"]`
- Action: Toggles visual noise/glitch. Adds `motion-stabilized` class to `<body>` and `stabilized` class to `.os-desktop`.

### Touch & Mobile Swipe Contract
- Selector: `[data-test-id="swipe-area"]`
- Action: Detects touch horizontal swiping gestures. If swiped above 50px threshold, triggers navigation transition (or simulates action).

## Code Layout
- `web-app/src/styles.scss` - Global style entrypoint
- `web-app/src/app/`
  - `app.routes.ts` - Routing configuration
  - `app.component.ts` - Main shell component
  - `views/` - Routed standalone shell views
    - `landing/` - Workspace Sign In & Role selection
    - `player-view/` - Player desktop environment
    - `gm-view/` - GameMaster control dashboard
    - `spectator-view/` - Spectator monitor layout
