# UI Overhaul: Color Psychology (Zero-Sum RPG)

## Mandat
Das Ziel ist es, durch die Farbpalette psychologische Zustände wie Stress, Burnout (Zero-Sum-Erfahrung) und kognitive Limits spürbar zu machen. Die Farben sollen nicht einladend wirken, sondern die Härte und Erschöpfung der Spielwelt widerspiegeln.

## Farbkonzepte
1. **Erdrückendes Grau (Burnout & Gewicht):** Repräsentiert die Ausweglosigkeit und Monotonie.
2. **Entsättigtes Blau (Kognitive Limits):** Steht für emotionale Kälte, Distanz und schwindende mentale Kapazitäten.
3. **Warnendes Neongelb (Stress & Anxiety):** Erzeugt eine unangenehme, stechende Dissonanz, die Reizüberflutung signalisiert.
4. **Pulsierendes Rot (Panik):** Wenn Limits überschritten werden und der "Zero-Sum"-Zustand droht.

## CSS Farbvariablen

```css
:root {
  /* --- Base & Backgrounds (Erdrückendes Grau & Leere) --- */
  --color-bg-oppressive: #1c1d21; /* Sehr dunkles, schweres Grau */
  --color-surface-heavy: #282a2e; /* Etwas helleres Grau für Panels */
  --color-zerosum-void: #0d0d0f; /* Das absolute Nichts, bodenlose Tiefe */

  /* --- Text & Typography (Verblassende Energie) --- */
  --color-text-primary: #c4c5c7; /* Kein reines Weiß, wirkt leicht angestaubt */
  --color-text-muted: #7a7d84; /* Kraftlos, schwer lesbar (erfordert Anstrengung) */
  --color-text-ghost: #4b4e54; /* Kaum noch wahrnehmbar */

  /* --- Accents (Stress & Kognitives Limit) --- */
  --color-exhaustion-blue: #4a637a; /* Entsättigt, kalt, distanziert */
  --color-cognitive-drain: #394a59; /* Abnehmende mentale Kapazität */
  
  --color-stress-neon: #dfff00; /* Stechendes, unruhiges Neongelb (Warnung) */
  --color-anxiety-glitch: #badd22; /* Kränkliches Gelb-Grün (Unbehagen) */
  
  --color-panic-red: #c92a2a; /* Dumpfes, aber intensives Blutrot (Burnout/Kritisch) */

  /* --- Semantic UI Mappings --- */
  --ui-bg-main: var(--color-zerosum-void);
  --ui-bg-panel: var(--color-surface-heavy);
  --ui-border-default: var(--color-cognitive-drain);
  
  --ui-text-normal: var(--color-text-primary);
  --ui-text-faded: var(--color-text-muted);
  
  /* Interaktive Elemente */
  --ui-btn-bg: var(--color-surface-heavy);
  --ui-btn-border: var(--color-exhaustion-blue);
  --ui-btn-text: var(--color-text-primary);
  
  --ui-btn-hover-bg: var(--color-exhaustion-blue); /* Fühlt sich kalt an */
  
  /* Status Indikatoren */
  --ui-status-stable: var(--color-exhaustion-blue); /* "Stabil" ist bereits erschöpft */
  --ui-status-warning: var(--color-stress-neon); /* Verursacht visuelles Unbehagen */
  --ui-status-critical: var(--color-panic-red); /* Absolutes Limit */
  
  /* Spezifische RPG-Metriken */
  --metric-stress-bar: var(--color-stress-neon);
  --metric-energy-bar: var(--color-exhaustion-blue);
  --metric-burnout-glow: 0 0 10px rgba(223, 255, 0, 0.4);
}
```

## Anwendungshinweise
- **Kontrast-Dissonanz:** Die Neongelb-Töne (`--color-stress-neon`) sollten sparsam, aber an kritischen Stellen eingesetzt werden, um die Augen des Spielers fast schon zu "stören" und Stress zu simulieren.
- **Fehlende Wärme:** Es gibt keine warmen, einladenden Farben (wie sattes Orange oder freundliches Grün). Alles wirkt industriell, abgenutzt und kalt.
- **Schatten:** Statt weicher Drop-Shadows sollten harte, dunkle Schatten oder ein toxisches Glühen (`--metric-burnout-glow`) verwendet werden.
