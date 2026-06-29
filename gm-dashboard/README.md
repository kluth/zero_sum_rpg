# Zero Sum GM Terminal

This is a local Web Dashboard that allows the Game Master to control the Zero Sum RPG Companion App in real-time.

## Setup

1. Simply open `index.html` in any web browser (Chrome, Safari, Firefox).
2. Ensure you have an active internet connection so the Firebase SDK can load and sync.

## Features

- **Paramedic Controls**: Update patient vitals live. The `Trigger Cardiac Arrest` button drops heart rate and blood pressure critically, triggering the `FLATLINE_MONITOR` alarm and heavy haptic feedback on the Paramedic's device!
- **Coordinator Controls**: Update the situation label and time elapsed. Add or remove Map Markers dynamically (e.g. drop a marker for "Roadblock" at [X: 100, Y: -50]).
- **Comms Controls**: Update the active dispatch feed and broadcast new operational messages to the Journalist/Activist's radio.

## Technology
- Vanilla HTML/CSS/JS (no build steps required).
- Firebase JS SDK v10 (Modular via CDN).
- Styling aligns with the Silk/Neomorphic design system of the Android App.
