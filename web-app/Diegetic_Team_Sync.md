# Diegetic Team Sync: The Overhaul

## Dystopian UI Designer: Layout-Konzept (Antwort auf den Harsh UX Critic)

*„Der Kritiker nennt unsere bisherigen Entwürfe ein weichgespültes Corporate-Dashboard. Er hat recht. Wir sind hier nicht in einem Co-Working-Space, sondern im Dreck der Megacorps. Hier ist mein finales, kompromissloses Layout-Konzept für alle vier Kern-Views – brutal, direkt und absolut diegetisch.“*

### 1. View: Die Lobby (Terminal Access Point)
* **Konzept:** Ein ratterndes, unbarmherziges Boot-Sequenz-Terminal. Keine bunten Begrüßungsbilder.
* **Layout:** Monospace-Typografie, phosphor-grüne oder bernsteinfarbene Schrift auf tiefschwarzem Grund (`#0a0a0a`).
* **Elemente:**
  * Flackerndes CRT-Overlay mit leichten Scanlines.
  * Eingabefelder für Session-IDs, die aussehen wie Kommandozeilen-Prompts (`> CONNECT_TO_NODE_`).
  * Knisternde Audio-Queues (Diegetisches Feedback), wenn User sich verbinden.

### 2. View: Game Master Shell (Overseer's Panopticon)
* **Konzept:** Totale Kontrolle, maximaler Overload. Ein Dashboard, das aussieht, als würde man eine abklingende Kernschmelze überwachen.
* **Layout:** Dicht gedrängtes Grid-System ohne Padding-Luxus. Harte weiße Ränder, dunkler Hintergrund.
* **Elemente:**
  * **Threat Level Tracker:** Ein massiver, blutroter Balken am oberen Rand, der pulsiert (Panic Red: `#ff2a2a`).
  * **Player Vitals:** Live-Feeds der Spieler-Stats (Stress, AP, Bleed Cards) in kleinen, klaustrophobischen Boxen.
  * **Event-Log:** Ein rasend schneller, unaufhaltsamer Datenstrom (Log-Stream) am rechten Bildschirmrand.

### 3. View: Player Uplink (Operative's HUD)
* **Konzept:** Eingeschränkte Sicht, Fokus auf das Überleben. Das UI blutet mit dem Spieler.
* **Layout:** Zentraler Fokus auf die eigenen Stats. Viel leerer, bedrohlicher Raum an den Seiten.
* **Elemente:**
  * **Glitch-Effekte:** Wenn der Spieler kritischen Schaden oder Stress erleidet, verzerren sich die UI-Elemente asynchron (Chromatic Aberration).
  * **Aktions-Panel:** Große, klobige Buttons, die beim Klicken ein hartes haptisches/visuelles Feedback geben, als würde man mechanische Schalter umlegen.
  * **Alert-State:** Sobald der Akustik-SNR steigt, flutet ein unheilvolles Warnblinken den Randbereich des Bildschirms.

### 4. View: Spectator / IT-Support Shell (Corporate Wiretap)
* **Konzept:** Der kalte, analytische Blick von außen. Verrauschtes Überwachungsvideo-Ästhetik.
* **Layout:** Split-Screen-Ansicht, ähnlich einer CCTV-Überwachungsmatrix.
* **Elemente:**
  * **Kamera-Gitter:** Die Avatare/Daten der Spieler werden als "Kamera-Feeds" mit statischem Rauschen dargestellt.
  * **Telemetrie-Overlay:** Halbtransparente Graphen, die über das Geschehen gelegt sind – kalt, blau, emotionslos.
  * **Support-Tools:** Versteckte, ausklappbare Panels mit Konsolenbefehlen, um in das System einzugreifen (IT-Support Override-Codes).

## TV Producer (N54 News Network): Broadcast-Anforderungen

*„Hier spricht N54 News. Das Layout-Konzept ist nett, aber uns fehlt der Punch für das Live-Publikum. Wenn die Scheiße den Ventilator trifft, müssen unsere Zuschauer das spüren! Wir brauchen Breaking News Overlays, reißerische Ticker und Farben, die sich in die Netzhaut brennen. Hier sind meine Vorgaben für den absoluten Medien-Overkill:“*

### 1. Breaking News Overlays
* **Konzept:** Massive, dominante Einblendungen, die sofort jede Aufmerksamkeit auf sich ziehen.
* **Layout:** Scharfe, diagonale Kanten, inspiriert von Gefahrensymbolen und Polizeiabsperrungen.
* **Elemente:**
  * **Typografie:** Riesige, blockige Sans-Serif-Schriften in All-Caps (z. B. Impact oder Bebas Neue).
  * **Animation:** Overlays schlagen hart und schnell ins Bild ein, begleitet von einem tiefen, bassigen "THUD" (Sound-Design).
  * **Inhalt:** Kurze, reißerische Schlagzeilen („SYSTEMKOMPROMITTIERUNG!“, „AKOLUTHEN INFILTRIERT!“).

### 2. Schreiende Ticker-Laufschriften (Chyrons)
* **Konzept:** Ein endloser Strom aus Sensationsmeldungen, Halbwahrheiten und Panikmache am unteren Bildschirmrand.
* **Layout:** Doppelzeiliger Ticker. Die obere Zeile schnell und aggressiv, die untere etwas langsamer mit "Expertenmeinungen" oder Sponsoren-Updates.
* **Elemente:**
  * **Geschwindigkeit:** Zu schnell für ein entspanntes Lesen. Das Ziel ist Reizüberflutung.
  * **Trenner:** Blinkende, leuchtende Chevrons (`>>>`) oder N54-Logos zwischen den Meldungen.
  * **Farbkodierung:** Leuchtendes Gelb (`#FFD700`) auf tiefschwarzem Grund für maximale Lesbarkeit unter Stress.

### 3. Grelle Warnfarben (The N54 Palette)
* **Konzept:** Weg von dezenter Bedrohung, hin zum absoluten Alarmzustand.
* **Farbwerte:**
  * **N54 Alarm-Rot:** `#FF0033` (Sättigung auf Anschlag. Wird für den Rahmen verwendet, wenn ein kritischer Event auslöst).
  * **Toxic Yellow:** `#CCFF00` (Für Hervorhebungen im Ticker. Tut leicht in den Augen weh).
  * **Strobe White:** `#FFFFFF` (Für blitzartige, frameweise Flashes bei Explosionen oder Systemabstürzen).
* **Verhalten:** Farben sind nicht statisch. Sie pulsieren im Rhythmus eines schnellen Herzschlags (ca. 120 BPM), wenn der Threat Level hoch ist.

## Print Layout Editor: CSS Blueprints (Diegetic & Broadcast)

*„Die Ideen sind gut, aber ohne eine knallharte, performante technische Basis fällt alles in sich zusammen. Hier sind die strikten CSS-Vorgaben: Ein gnadenloses CSS Grid für die Magazin-Spalten (Game Master Shell) und hardwarebeschleunigte Keyframes für den schreienden TV-Ticker. Keine Kompromisse.“*

### 1. CSS Grid: Overseer's Panopticon (Magazine Layout)
```css
/* Gnadenloses Grid-System ohne Padding-Luxus */
.overseer-panopticon {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr; /* Magazin-Spalten: Threat, Main, Event-Log */
  grid-template-rows: auto 1fr;
  grid-template-areas: 
    "header header header"
    "vitals main log";
  gap: 2px;
  background-color: #ffffff; /* Harte weiße Ränder als Grid-Gap */
  height: 100vh;
  overflow: hidden;
}

.overseer-header { grid-area: header; background-color: #0a0a0a; }
.overseer-vitals { grid-area: vitals; background-color: #0a0a0a; }
.overseer-main   { grid-area: main;   background-color: #0a0a0a; }
.overseer-log    { grid-area: log;    background-color: #0a0a0a; }

/* Threat Level Tracker - Pulsierend */
.threat-level-tracker {
  border-top: 8px solid #ff2a2a;
  animation: heartbeat-pulse 0.5s infinite alternate; /* 120 BPM */
}
```

### 2. CSS Keyframes: Schreiende Ticker-Laufschriften (Chyrons)
```css
/* Endloser Strom aus Sensationsmeldungen (Hardwarebeschleunigt) */
.n54-ticker-container {
  width: 100%;
  overflow: hidden;
  background-color: #000000;
  border-top: 4px solid #FF0033; /* N54 Alarm-Rot */
  white-space: nowrap;
  display: flex;
}

.n54-ticker-track {
  display: inline-block;
  white-space: nowrap;
  color: #FFD700; /* Toxic Yellow für Hervorhebungen */
  font-family: 'Impact', 'Bebas Neue', sans-serif;
  font-size: 2rem;
  text-transform: uppercase;
  /* Hardwarebeschleunigte Transform-Animation */
  animation: scroll-ticker 10s linear infinite;
  will-change: transform;
}

/* 
 * Reizüberflutung: Zu schnell für entspanntes Lesen.
 * Transform: translate3d erzwingt GPU-Rendering für flüssige 60fps.
 */
@keyframes scroll-ticker {
  0%   { transform: translate3d(100%, 0, 0); }
  100% { transform: translate3d(-100%, 0, 0); }
}

@keyframes heartbeat-pulse {
  0%   { box-shadow: 0 0 10px #FF0033; }
  100% { box-shadow: 0 0 40px #FF0033; }
}
```
