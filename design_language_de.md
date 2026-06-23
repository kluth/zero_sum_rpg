# ZERO SUM: Systemic Design Language & Styling Guide

## The Aesthetic: "Classified Corporate Dossier"
Die Design Language für das Zero Sum RPG wurde streng definiert, um den brutalistischen, paranoiden und hyper-korporativen Tonfall des Settings widerzuspiegeln. Das Styling stellt sicher, dass die Dokumente wie geleakte interne Unternehmensrichtlinien, Threat-Assessment-Dateien oder abgefangene Intelligence Briefings aussehen.

### 1. Color Palette (Zero-Trust Minimalist)
* **Void Black (`#000000`):** Wird für primäre, stark wirkende Header, Table Headers und Image Borders verwendet. Repräsentiert die absolute, unnachgiebige Natur des Systems.
* **Crimson Threat (`#d32f2f`):** Die einzige lebhafte Farbe in der Palette. Wird für sekundäre Header, kritischen Inline-Code und die primäre Unterstreichung von H1-Elementen verwendet. Repräsentiert systemische Gewalt, Heat und Exhaust.
* **Concrete Grey (`#eaeaea` / `#f2f2f2`):** Wird für Blockquotes, abwechselnde Table Rows und Backgrounds verwendet. Repräsentiert die tristen, sterilen Umgebungen von Unternehmenseinrichtungen.
* **Dossier White (`#f9f9f9`):** Die Basisfarbe der Seite, ein leichtes Off-White, um die Belastung der Augen zu verringern und physische Geheimdienstberichte zu simulieren.

### 2. Typography
* **Headers & UI Elements:** `Courier New` / Monospace. Simuliert Terminal-Outputs, Code-Ausführung und rohe Daten-Feeds. Wird für alle H1, H2, Table Headers und Blockquotes verwendet.
* **Body Text:** `Inter` / `Helvetica Neue`. Eine moderne, sterile, extrem gut lesbare Sans-Serif-Schriftart, die korporative Effizienz und den Mangel an Emotionen repräsentiert.
* **Justification:** Der Fließtext ist im Blocksatz gehalten, um starre, ununterbrochene Textblöcke zu erzeugen, die Unternehmensdokumentation widerspiegeln.

### 3. Structural Elements
* **Blockquotes (Intercepts):** Gestylt mit einem dicken schwarzen linken Rand und einem betongrauen Hintergrund, gerenderd in Courier. Diese repräsentieren abgefangene Comms, rohes Intel oder Flavor Text.
* **Tables (Data Matrices):** Kahle, brutalistische Tabellen mit invertierten schwarz-weißen Headern. Keine vertikalen Linien, wobei horizontales Datenlesen priorisiert wird.
* **Images:** Alle Bilder werden automatisch durch einen CSS-Filter (`grayscale(100%) contrast(120%)`) verarbeitet, um wie Überwachungsvideomaterial oder zensierte schwarz-weiße Ausdrucke zu wirken.
* **Pagination & Watermarks:** Jede Seite hat eine Markierung oben rechts: `ZERO SUM RPG // CONFIDENTIAL`, um die Illusion eines geleakten Dokuments aufrechtzuerhalten.

Diese Design Language wurde permanent auf alle PDF-Renders im gesamten Repository angewendet.
