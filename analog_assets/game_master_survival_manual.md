# ZERO SUM RPG - GAME MASTER SURVIVAL MANUAL

> *Zero Sum RPG ist ein haptischer Everyday Hero Crisis Simulator. Dieses Regelwerk regelt das Zusammenspiel zwischen Papier (Charakterbögen), physischen Würfeln und dem "Survival OS" (der digitalen Companion-App).*

## 1. DAS SETUP (ANALOG & DIGITAL)
**Analog:** Jeder Spieler füllt einen physischen Charakterbogen aus (Sanitäter, IT-Techniker etc.). Gewürfelt wird mit physischen D100 Würfeln (Prozent-System).
**Digital:** Die Spieler laden sich das "Survival OS" auf ihre Smartphones. Die App ist **rein In-Universe**. Sie würfelt nicht, sie kennt keine "Charakter-Stats", sondern fungiert exakt so, wie ein modifiziertes Krisen-Smartphone in der Spielwelt funktionieren würde.

## 2. KERNMECHANIKEN & APP-INTEGRATION

### A. Stress & Trauma (Der Critical State)
Stress wird primär analog auf dem Blatt notiert.
- Der Game Master (GM) spiegelt den aktuellen Stress-Wert heimlich in die Firebase-Datenbank (Node: `gameState/characters/<char_id>/stats/stress_current`).
- **Trigger:** Erreicht der Stress-Wert 80 oder mehr, löst das Smartphone des Spielers physisch Alarm aus. Das "Survival OS" pulsiert blutrot (Critical State) und der Vibrationsmotor simuliert einen Herzschlag. Das ist das Zeichen für den Spieler, ab sofort panisch zu rollenspielen.

### B. Das Datenvolumen (Der Blackout)
Jedes Smartphone hat ein begrenztes Datenvolumen (150 MB). 
- Bestimmte In-Universe-Scans in der App (Map-Downloads, Ping-Sensoren) verbrauchen Megabytes.
- Fällt das Volumen auf 0, crasht die App in den Blackout-Modus. Der Spieler ist blind und von der digitalen Kommunikation abgeschnitten.

### C. Physisches Loot & Hash-Decoding (COMMS)
Wenn Spieler Räume durchsuchen, teilt der GM analog Loot-Karten aus. Einige davon enthalten 4-stellige Hash-Codes (z.B. "A99F").
- Die Spieler geben den Code in den Decoder der App ein.
- Die App fragt Firebase nach dem Inhalt dieses Hashes ab.
- Dies erlaubt dem GM, in Echtzeit Rätsel, Codes oder Warnungen in der Datenbank zu platzieren, die die Spieler entschlüsseln.

### D. Dilemma Voting (Die Uhr tickt)
Wenn die Gruppe eine schwerwiegende moralische Entscheidung treffen muss (z.B. "Sektor abschotten und NPCs sterben lassen?"):
- Der GM schickt ein Dilemma über das Backend.
- Die App aller Spieler wird komplett gesperrt und zeigt ein "CRITICAL DILEMMA" Overlay mit Countdown (z.B. 60 Sekunden).
- Die Spieler am Tisch müssen hektisch diskutieren und sich entscheiden, indem sie am Smartphone abstimmen. Läuft der Countdown ab, erzwingt das System die schlechteste Wahl!

## 3. DIE REGELN AM TISCH
1. **Keine digitalen Würfel:** Es wird am Tisch gewürfelt. Die App ist kein Regel-Rechner, sie ist ein Story-Werkzeug.
2. **Realismus pur:** Ein Treffer tut weh. Schlafentzug macht langsam. Die App unterstützt dies nur audiovisuell.
3. **Der GM ist das Backend:** Der GM steuert das Spiel über die analoge Story und seine Firebase-Console (oder sein GM-Dashboard), um die Handys der Spieler im perfekten Moment in die Story zu ziehen.
