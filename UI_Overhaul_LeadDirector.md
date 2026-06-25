# UI/UX Vision: "Everyday Hero / Diegetic OS" Overhaul

## 1. Core Mandate
We are transitioning the application interface to function as an immersive, in-universe artifact. The UI must feel like a genuine operating system or terminal used by characters within the game's world. This is not just a game interface; it is a Diegetic OS. 

## 2. The Dual-System Aesthetic

### A. Corporate OS (The Surface)
- **Vibe:** Sterile, efficient, imposing, over-engineered, heavily monitored.
- **Visuals:**
  - **Color Palette:** Cool whites, stark greys, muted corporate blues, with sharp, aggressive alert colors (e.g., piercing red).
  - **Typography:** Clean sans-serif, highly legible, overly structured (e.g., Inter, Roboto). 
  - **Design Language:** Glassmorphism, sharp edges, heavy use of grids, data tables, and restrictive borders. 
- **Micro-interactions:** Snappy, rigid animations. Sound effects should be synthetic, approved-sounding chimes.

### B. Underground Terminal (The Underbelly / Rebel Interface)
- **Vibe:** Hacked, raw, utilitarian, subversive, jury-rigged.
- **Visuals:**
  - **Color Palette:** High-contrast phosphor greens or amber on deep, absolute black. Occasional glitch-magenta or cyan for highlights.
  - **Typography:** Monospaced, terminal-style fonts (e.g., Fira Code, JetBrains Mono, VT323).
  - **Design Language:** Scanlines, CRT curve effects, visible command-line prompts, raw text outputs instead of polished icons.
- **Micro-interactions:** Blinking cursors, text-typing delays (typewriter effect), occasional intentional screen tearing or "glitch" artifacts during transitions.

## 3. Diegetic Elements (The "Everyday Hero" Feel)
- **No Traditional Game Menus:** Replace "Options" or "Settings" with in-universe equivalents like "System Config", "Hardware Calibration", or "Network Uplink".
- **Notifications:** Should appear as internal memos, priority overrides, or intercepted transmissions rather than generic pop-ups.
- **Loading Screens:** Represent these as "Establishing Connection...", "Decrypting DataStream...", or "Booting Core OS...".
- **User Identity:** The player is an operator. Address them by assigned ID, clearance level, or handle, reinforcing their role within the world.

## 4. Implementation Directives for the Team
- **Component Audit:** Review all existing UI components (buttons, modals, inputs) and classify them: Do they belong to the Corporate OS or the Underground Terminal? Build reusable components for both.
- **Sound Design:** Audio is crucial for the diegetic experience. Integrate mechanical keyboard clacks, CRT whines, and corporate boot-up chimes.
- **Accessibility vs. Immersion:** Ensure that CRT effects or glitch animations do not cause motion sickness or readability issues. Provide an "Accessibility Mode" (or "Stabilizer Module") that tones down extreme effects while maintaining the aesthetic.

## 5. Next Steps
- Create technical mood boards for both Corporate OS and Underground Terminal.
- Develop a CSS variable / token system that allows seamless switching between the two themes.
- Prototype a transition sequence (e.g., a "hack" sequence that visually breaks the Corporate OS to reveal the Underground Terminal).

*End of Directive.*
