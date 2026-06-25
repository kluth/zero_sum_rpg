# Original User Request

## Initial Request — 2026-06-25T13:38:34Z

Overhaul the web application UI for Zero Sum RPG to implement a "Diegetic OS" dual-system aesthetic (Corporate OS vs Underground Terminal) and modernize the underlying Angular architecture.

Working directory: `/home/matthias/project/zero_sum_rpg/web-app`
Integrity mode: development

## Requirements

### R1. SCSS Migration
Migrate the existing styling architecture from standard CSS to SCSS, allowing for more complex state styles, mixins, and structured themes while maintaining Tailwind utility classes.

### R2. Dual-System Aesthetic Implementation
Implement the "Diegetic OS" design system (Corporate OS and Underground Terminal) based on the specifications in `UI_Overhaul_LeadDirector.md` and the initial mockups. Establish a CSS variable/token system for seamless theme switching.

### R3. Component De-Godification
Refactor the primary "God Component" (`app.component.ts`) by splitting it into distinct, lazy-loaded feature components using the Angular Router, as outlined in `UI_Overhaul_Web_Architecture.md`.

## Acceptance Criteria

### Architecture & Routing
- [ ] `app.component.ts` is significantly reduced in size and complexity, primarily containing the router outlet and critical app-wide overlays.
- [ ] New lazy-loaded routes exist for distinct application shells (e.g., Lobby, GM, Player Uplink, Spectator, IT Support).

### Styling & Theming
- [ ] All `.css` files are successfully converted to `.scss` and the Angular workspace is configured to use SCSS.
- [ ] An independent judge agent confirms that the codebase implements the structural CSS foundation for both the Corporate OS and Underground Terminal themes.

### Execution
- [ ] The Angular application builds successfully (`npm run build`) with the new component and routing structure.
