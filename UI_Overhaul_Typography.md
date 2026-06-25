# UI Overhaul: Typografie & Layout Vorgaben

## Design-Philosophie: "Chaotisch, aber nutzbar"
Das Dashboard muss die hochgradig stressige, informationsdichte Umgebung eines kritischen Einsatzes widerspiegeln. Die Benutzeroberfläche soll auf den ersten Blick leicht überfordernd (chaotisch) wirken, aber strengen zugrundeliegenden Regeln folgen, die es den Operatoren ermöglichen, essenzielle Daten sofort zu finden (nutzbar).

## 1. Typografie-System

### Schriftfamilien (Fonts)
- **Primäre Daten/Readouts (Monospace):** `JetBrains Mono`, `Fira Code` oder `Courier New`.
  *Verwendung für alle numerischen Daten, Logs, Koordinaten und Systemstatus. Monospace sorgt dafür, dass tabellarische Daten perfekt ausgerichtet sind, was das "rohe Terminal"-Gefühl verstärkt.*
- **Überschriften & Alarme (Condensed Sans-Serif):** `Oswald`, `Roboto Condensed` oder `Impact`.
  *Verwendung für Panel-Titel, kritische Alarme und Haupt-UI-Sektionen. Diese Schriften sind auch bei enger Setzung sehr gut lesbar und wirken von Natur aus dringlich.*
- **Fließtext/Systemtext (Sans-Serif):** `Inter` oder `Helvetica Neue`.
  *Sparsam für längere erklärende Texte oder nicht-kritische UI-Elemente verwenden, um die Lesbarkeit zu erhalten.*

### Typografische Skalierung & Regeln
- **Überschriften (H1/H2):** Nur in Großbuchstaben (Uppercase). Eng spationiert (Letter-Spacing: `-1px`). Schriftgröße: `1.5rem` bis `2.5rem`.
- **Datenpunkte:** Schriftgröße: `0.85rem` bis `1rem`. Zeilenhöhe (Line-Height): `1.2` (sehr dicht).
- **Farben:** 
  - Primärer Text: `#e0e0e0` (Off-White)
  - Gedämpfter Text: `#666666` (Dunkelgrau für nicht-kritische Logs)
  - Alarmtext: `#ff3333` (Helles Rot) oder `#ffcc00` (Warnendes Gelb)
- **Effekte:** Kritische Zahlen sollten gelegentlich flackern oder "glitchen" (CSS-Keyframes), um das Gefühl der Dringlichkeit zu erhöhen, ohne das Layout zu zerstören.

## 2. Grid-System & Layout

### Asymmetrisches Dashboard-Grid
Um ein "chaotisches" Gefühl zu erzeugen, sollten perfekt symmetrische 50/50-Aufteilungen vermieden werden. Verwende CSS Grid, um ein stark gewichtetes, asymmetrisches Layout zu erstellen, das verschiedene Panels eng aneinander packt.

```css
.dashboard-container {
  display: grid;
  height: 100vh;
  /* 4 Spalten, ungleiche Größen, erzeugt einen dichten, asymmetrischen Look */
  grid-template-columns: 250px 1fr 1.5fr 300px;
  /* 3 Zeilen, ungleiche Höhen */
  grid-template-rows: 60px 1fr 250px;
  grid-template-areas:
    "header header header header"
    "sidebar main-map critical-data alerts"
    "sidebar secondary-logs secondary-logs alerts";
  gap: 4px; /* Sehr geringer Abstand, damit es dicht und beengt wirkt */
  background-color: #050505; /* Tiefschwarzer Hintergrund */
  padding: 4px;
}
```

### Panel-Überlappungen & Chaos
Um das chaotische Gefühl zu verstärken und gleichzeitig die Nutzbarkeit zu erhalten, können einige Elemente leicht überlappen oder aus ihren Grid-Zellen ausbrechen (mit `position: absolute` oder negativen Margins), solange sie keine kritischen Daten verdecken.
- **Rahmen (Borders):** Harte, dünne Rahmen (`1px solid #333`) um Grid-Bereiche.
- **Visuelles Rauschen:** Füge ein subtiles Scanline- oder CRT-Flimmern-Overlay als CSS-Pseudoelement über das gesamte Grid hinzu.

## 3. CSS-Utilities für die stressige Atmosphäre

```css
/* Glitch-Effekt für kritische Typografie */
@keyframes textGlitch {
  0% { transform: translate(0); color: #ff3333; }
  20% { transform: translate(-2px, 1px); color: #00ffff; }
  40% { transform: translate(-1px, -1px); color: #ff3333; }
  60% { transform: translate(2px, 1px); color: #ff3333; }
  80% { transform: translate(1px, -1px); color: #00ffff; }
  100% { transform: translate(0); color: #ff3333; }
}

.alert-critical {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  color: #ff3333;
  animation: textGlitch 0.2s infinite;
  animation-play-state: paused;
}

/* Löse den Glitch bei Hover oder via JS während kritischer Ereignisse aus */
.alert-critical.active {
  animation-play-state: running;
}
```
