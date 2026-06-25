# Mobile & Android UI Overhaul Plan

Dieses Dokument beschreibt die Strategie für die mobile Benutzeroberfläche der **Zero Sum RPG** Anwendungen, mit einem starken Fokus auf Android-spezifische Eigenheiten, responsive Darstellung und die Ergonomie im Porträt-Modus.

## 1. Ergonomie im Porträt-Modus (Smartphone-Fokus)
Ein Smartphone wird meistens mit einer Hand im Porträt-Modus bedient. Die UI muss für den "Thumb-Zone"-Bereich (Daumen-Reichweite) optimiert sein.

* **Bottom-Heavy Layout:** Alle essenziellen interaktiven Elemente (Würfeln, Comms aktivieren, Inventar öffnen) müssen in der unteren Bildschirmhälfte platziert sein.
* **Passive Informationen oben:** Statuswerte, HP, Stealth-Level und der aktuelle Szenario-Fokus werden im oberen Bildschirmdrittel (Top-Bar oder Card-Header) angezeigt, da hier seltener Interaktionen stattfinden.
* **Scroll & Swipe:** Wischen (Swiping) sollte der primäre Navigationsweg zwischen den Haupt-Tabs sein (z.B. Swipe von Charakter-Sheet zu Comms/Agora-Video).

## 2. Android-Spezifische Eigenheiten (Native App)
Da die native Android-App auf **Kotlin & Jetpack Compose** basiert, nutzen wir modernste Android-APIs, um ein nahtloses Erlebnis im "Glassmorphism" / Cyberpunk-Stil zu erschaffen.

* **Edge-to-Edge Design & Window Insets:** Die App wird Edge-to-Edge gerendert (hinter der Status- und Navigationsleiste). Compose `WindowInsets` werden genutzt, um sicherzustellen, dass interaktive Elemente nicht durch die Systemleisten verdeckt werden. Der dunkle Hintergrund (`#0A0F14`) füllt den gesamten Bildschirm.
* **Predictive Back Gestures:** Android 14+ unterstützt Predictive Back. Wir implementieren entsprechende Compose-Callbacks (`BackHandler`), sodass Nutzer beim Zurückwischen flüssige Übergänge sehen (z.B. beim Schließen eines Bottom Sheets für das Inventar).
* **Haptisches Feedback:** Native Haptik ist entscheidend für das "Würfel-Gefühl" und kritische Aktionen. Wir nutzen `HapticFeedbackType.LongPress` und `TextHandleMove`, um spürbares Feedback bei Dice-Rolls, kritischen Treffern oder dem Aktivieren von Comms zu geben.
* **Bottom Sheets für Aktionen:** Statt Vollbild-Overlays verwenden wir `ModalBottomSheet` in Compose für temporäre Aktionen wie Item-Nutzung oder komplexe Skill-Checks, um den Kontext der Hauptansicht nicht zu verlieren.

## 3. Responsive Web-App (Angular) auf Mobile
Die Angular Web-App muss auf mobilen Endgeräten wie eine native App wirken (PWA-Fokus).

* **Touch-First statt Hover:** Alle Hover-Effekte (die auf Desktop wichtig sind) werden durch klare "Pressed"- und "Active"-States via CSS ersetzt. Buttons erhalten größere Touch-Targets (mind. 48x48 dp/px).
* **Responsive Breakpoints:** Für Mobile (`< 768px`) wird das Layout strikt einspaltig aufgebaut. Desktop-Seitennavigationen wandern in eine "Bottom Navigation Bar".
* **Safe Area Environment Variables:** Nutzung von CSS `env(safe-area-inset-bottom)` für das Web-Layout auf Smartphones (insbesondere um Probleme mit der Swipe-Leiste auf modernen Androids und iPhones zu vermeiden).
* **Installierbarkeit (PWA):** Web-App Manifest und Service Worker (`ngsw-config.json` ist bereits vorhanden) werden so konfiguriert, dass sich die App auf Android wie eine native WebAPK installiert und im Vollbild-Modus startet.

## 4. Das "Look & Feel" (Cyberpunk Glassmorphism)
* **Transparenz:** Tiefenunschärfe (`blur`-Effekte) hinter Panels erzeugt das Glassmorphism-Gefühl. Auf Android wird dies performant mit `Modifier.blur()` (Android 12+) oder durch teiltransparente Shapes realisiert.
* **Kontraste:** Schwarzer Hintergrund (`#0A0F14`) in Kombination mit Neon-Tönen (`#00E5FF` Blau, `#FF2A2A` Rot) für höchste Lesbarkeit – auch bei schlechten Lichtverhältnissen, passend zum Setting des Spiels.

## 5. Nächste Schritte
1. Prototyping der `Bottom Navigation` und der `WindowInsets` im Android Jetpack Compose Projekt.
2. Implementierung der Gesten-Navigation (Swipes) in der nativen Android-App.
3. CSS Media-Queries und Touch-Targets im Angular-Projekt (`web-app/tailwind.config.js` anpassen) für mobile PWA-Nutzer optimieren.
