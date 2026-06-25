# Web UI Overhaul & Architecture Plan (Zero Sum RPG)

## 1. Ausgangslage & Problemanalyse
Aktuell befindet sich der Großteil der Anwendungslogik und des Markups in einer sogenannten "God Component" (`app.component.ts`: 37KB, `app.component.html`: 53KB). Die Applikation unterstützt unterschiedliche Views ("Shells" wie Lobby, GM, Spectator, IT-Support, Player-Uplink), die alle zentral gesteuert und bedingt gerendert werden.

Zudem nutzt das Projekt momentan reguläre `.css`-Dateien in Kombination mit einer sehr umfangreichen `tailwind.config.js`. Es fehlt eine skalierbare SCSS/CSS-Architektur, um wiederkehrende Design-System-Elemente und komplexe (z. B. "Glassmorphism", CRT-Effekte) Layouts wartbar zu halten.

## 2. Komponenten-Architektur (Component Splits)

Um die Wartbarkeit, Lesbarkeit und Performance zu verbessern, wird die Applikation nach dem **Smart/Dumb-Komponenten-Muster** (Container & Presentational Components) und mittels **Feature-Modulen/Standalone-Components mit Routing** aufgeteilt.

### 2.1. Routing & Lazy Loading
Anstatt alle Shells (GM, Player, Spectator) in der `app.component.html` über `*ngIf` ein- und auszublenden, wird der Angular-Router (`@angular/router`) eingeführt. Jede Shell wird als eigene Route lazy-loaded.

- `/lobby` -> `LobbyComponent`
- `/session/:id/gm` -> `GameMasterShellComponent`
- `/session/:id/player/:playerId` -> `PlayerUplinkShellComponent`
- `/session/:id/spectator` -> `SpectatorShellComponent`
- `/session/:id/support` -> `ItSupportShellComponent`

Dadurch reduziert sich der initiale Bundle-Size und der Speicherverbrauch drastisch.

### 2.2. Strukturierung der Komponenten
Die Ordnerstruktur in `src/app/` wird modernisiert (bevorzugt unter Angular 17 Standalone Components):

```text
src/app/
 ├── core/              # Singleton Services, Interceptors, Guards
 ├── shared/            # Wiederverwendbare UI-Komponenten (Buttons, Cards, Modals)
 │    ├── ui/           # Dumb Components (z.B. Button, Badge, ProgressBar)
 │    └── design/       # SCSS Architecture (Mixins, Tokens)
 ├── features/          # Feature-spezifische Smart-Komponenten
 │    ├── lobby/
 │    ├── game-master/
 │    ├── player-uplink/
 │    └── ...
 └── overlays/          # Globale Overlays (Diegetic Shells: Whispernet, OCGF, etc.)
```

## 3. SCSS/CSS & Design System Architektur

Um das neue Design-System technisch einheitlich abzubilden, migrieren wir von regulärem CSS zu **SCSS**. Wir verbinden die Stärken von Tailwind (Utility Classes) mit SCSS (komplexe State-Styles, Mixins, strukturierte Themes).

### 3.1. SCSS Ordnerstruktur (ITCSS/7-1 inspiriert)
In `src/assets/scss/` oder `src/app/styles/` etablieren wir folgende Struktur:

```text
styles/
 ├── abstracts/         # Variables, Mixins, Functions (kein Output)
 ├── base/              # Resets, Typography (h1, p), Global Body Styles
 ├── components/        # Komplexe, nicht-tailwind-freundliche Styles (z.B. komplexe CRT-Effekte)
 ├── themes/            # Theming-Variablen (Dark/Light/Cyberpunk)
 └── main.scss          # Importiert alles, referenziert Tailwind
```

### 3.2. Integration mit Tailwind
In der `tailwind.config.js` sind bereits viele Design-Tokens definiert. Wir nutzen Tailwind als primäres Werkzeug für das Layouting (Flex, Grid, Spacing) und greifen für komplexe visuelle Ausarbeitungen (z.B. `.glass-panel`, `.crt-overlay`) auf SCSS zurück.

*   **SCSS Variablen aus Tailwind lesen:** Anstatt Farben in CSS-Variablen doppelt zu definieren (wie aktuell in `styles.css`), referenzieren wir Tailwind-Konfigurationen über das `@apply`-Direktiv in SCSS oder nutzen CSS-Variablen als Single Source of Truth, die sowohl in SCSS als auch in der `tailwind.config.js` referenziert werden.
*   **Encapsulation:** Angular's View Encapsulation (SCSS in `.component.scss`) wird für komponentspezifische Styles genutzt. Globale Utility-Klassen bleiben bei Tailwind.

## 4. Implementierungs-Roadmap

**Phase 1: Vorbereitung & SCSS Migration**
1.  Angular Workspace für SCSS konfigurieren (`ng config schematics.@schematics/angular:component.style scss`).
2.  Bestehende `.css`-Dateien nach `.scss` konvertieren.
3.  Globale Styles aus `styles.scss` in die neue abstrakte Ordnerstruktur (`abstracts`, `base`, `components`) refaktorieren.

**Phase 2: Router & Shell-Extraktion (De-Godification)**
1.  Angular-Router konfigurieren (`app.routes.ts`).
2.  Erstellen der Shell-Container-Komponenten (Lobby, GM, Player, etc.).
3.  Schrittweises Verschieben von Markup & Logik aus der `app.component.html`/`ts` in die jeweiligen Shells.

**Phase 3: Design-System & UI-Komponenten (Dumb Components)**
1.  Identifizieren von wiederkehrenden UI-Mustern in den Shells (z.B. Buttons, Inputs, Alert-Bars).
2.  Auslagern in wiederverwendbare Dumb-Components unter `src/app/shared/ui/`.
3.  Integration der neuen Design-Spezifikationen mit erweiterten Tailwind-Klassen und SCSS-Mixins.

**Phase 4: Cleanup & Optimierung**
1.  Sicherstellen, dass `app.component` nur noch den Router-Outlet und kritische, app-weite Overlays (`<app-flashback-overlay>`, CRT-Effects) enthält.
2.  Überprüfung der Store-Struktur (State Management), um sicherzustellen, dass nur die aktuell aktive Shell ihren State abonniert.
