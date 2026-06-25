# UI Overhaul: Accessibility & Ergonomics (Dystopia Theme)

## 1. Einleitung
Ein dystopischer Look zeichnet sich oft durch Dunkelheit, Neon-Akzente, Schmutz und "Glitch"-Effekte aus. Trotz dieses chaotischen und rauen visuellen Stils muss die Benutzeroberfläche (UI) vollständig zugänglich (Accessible) und ergonomisch bleiben. Besonders in hektischen Spiel- oder Nutzungssituationen auf mobilen Endgeräten darf das Design die Usability nicht einschränken.

## 2. Kontrastwerte & Lesbarkeit (WCAG)
Die Einhaltung der Web Content Accessibility Guidelines (WCAG 2.1 AA) ist zwingend erforderlich, um sicherzustellen, dass Texte und UI-Elemente lesbar bleiben.

* **Textkontrast:**
  * **Normaler Text** (< 18pt regulär oder 14pt fett): Muss ein Kontrastverhältnis von mindestens **4.5:1** zum Hintergrund aufweisen.
  * **Großer Text** (>= 18pt regulär oder 14pt fett): Muss ein Kontrastverhältnis von mindestens **3:1** aufweisen.
* **UI-Komponenten:**
  * Interaktive Elemente (Buttons, Eingabefelder) benötigen ein Kontrastverhältnis von **3:1** zu angrenzenden Farben.
* **Umgang mit Neon & Dark Mode:**
  * Vermeide rein schwarze Hintergründe (#000000) mit extrem hellen Neon-Schriften für längere Fließtexte, da dies zu Augenbelastung führt ("Halation"-Effekt). Nutze stattdessen sehr dunkles Grau (z. B. #121212) und leicht abgetönte Textfarben.
* **Farbenblindheit:**
  * Farbe darf niemals das einzige Mittel zur Informationsvermittlung sein. (Beispiel: Ein fehlerhafter Systemstatus darf nicht nur rot leuchten, sondern muss auch durch ein Warn-Icon oder Text wie "ERROR" gekennzeichnet sein).

## 3. Tap-Targets & Ergonomie (Mobile)
In hektischen Momenten – typisch für dystopische Settings (z. B. unter Zeitdruck hacken, fliehen) – ist die Touch-Ergonomie entscheidend.

* **Mindestgröße für Tap-Targets:**
  * Alle interaktiven Elemente müssen eine physische Mindestgröße von **48x48 dp** (Android) bzw. **44x44 pt** (iOS) aufweisen. Auch wenn der visuelle Button kleiner gestaltet ist (z. B. schmale, eckige Cyberpunk-Buttons), muss der unsichtbare Touch-Bereich (Hitbox) diese Mindestgröße erfüllen.
* **Abstände (Spacing):**
  * Zwischen interaktiven Elementen muss ausreichend Platz sein (mindestens 8dp), um Fehleingaben (Fat-Finger-Syndrom) in der Hektik zu vermeiden.
* **Erreichbarkeit (Thumb Zone):**
  * Kritische und häufig genutzte Aktionen (z. B. "Bestätigen", "Ausweichen", "System Hack") müssen im unteren Bereich des Bildschirms platziert werden, wo sie mit dem Daumen leicht erreichbar sind.
  * Zerstörerische oder riskante Aktionen (z. B. "Daten löschen") sollten weiter oben platziert werden oder eine Bestätigung ("Hold to confirm") erfordern, um versehentliches Auslösen zu verhindern.

## 4. Animationen & Visuelle Effekte (Glitches)
Dystopische UIs nutzen oft Glitch-, CRT- oder Flimmer-Effekte, um eine fehlerhafte Technik zu simulieren.

* **Photosensibilität:**
  * Flackernde Elemente dürfen **niemals öfter als 3 Mal pro Sekunde** (3 Hz) blitzen, um epileptische Anfälle zu vermeiden.
* **Reduzierte Bewegung (Prefers-Reduced-Motion):**
  * Die UI muss die System-Einstellung für reduzierte Animationen respektieren. Wenn aktiviert, sollten Glitch-Effekte, starkes Wackeln (Screen Shake) und schnelle Übergänge durch statische Alternativen oder weiche Fades ersetzt werden.
* **Klarheit vor Effekt:**
  * Glitch-Effekte dürfen kritische Informationen (wie Timer, Lebensanzeigen oder Warnungen) nicht unleserlich machen. Lege Effekte in den Hintergrund oder nutze sie nur kurz als Übergangsanimation.
