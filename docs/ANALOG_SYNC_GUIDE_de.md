# ZERO-SUM RPG: HYBRID REALITY SYNC GUIDE

Dieser Guide bietet das offizielle Framework für die Synchronisation von physischem "Analog"-Tabletop-Gameplay mit der "Augmented/Digital"-Engine. Zero-Sum RPG ist so konzipiert, dass es nahtlos über beide Medien hinweg gespielt werden kann, was es den Tischen ermöglicht, digitalen Komfort mit taktilem physischem Spiel zu mischen.

---

## 1. Der Multi-Axis Dice Pool vs. Algorithmische Resolution
**Digital:** Der Backend-Server verarbeitet alle mathematischen O(1) Matrixberechnungen und liefert sofortige narrative Ergebnisse (z. B. "Failed mit 3 Advantages").
**Analog Synchronization:**
- Für Offline- oder physisches Spiel verwenden Tische einen **Multi-Axis D6 Pool**.
- Rolle Standard-Sechsseiter: Grün (Success/Failure), Blau (Advantage/Threat) und Rot (Triumph/Despair).
- **Parity:** Anstelle von komplexer Mathematik bestimmen Modifikatoren, *wie viele* von jedem Würfel du rollst. Wenn ein Spieler physisch rollt, tippt der GM einfach auf den "Manual Override"-Button in der Web-App/AR-App und gibt die finalen Ergebnis-Tags ein (z. B. `+2 Advantage`), um den digitalen Status zu synchronisieren.
- **V2.1 Rule Sync:** Auto-Successes durch AP-Ausgaben sind nicht erlaubt. AP kauft strikt nur zusätzliche Grüne/Blaue Würfel. Threat-Wahrscheinlichkeiten (Rote Würfel) werden abgemildert, sodass ein einzelner gemischter Roll nicht zu katastrophalen mechanischen Wipes führt.

## 2. Action Economy & Combat Analytics
**Digital:** Die Jetpack Compose UI / Angular Web App trackt 3-Action Points (AP) und bestraft automatisch die Acoustic SNR (Signal-to-Noise Ratio).
**Analog Synchronization:**
- **Action Tokens:** Spieler verwenden drei physische Tokens (Pokerchips oder Münzen). Gib sie aus, um Actions auszuführen.
- **AP Recovery (V2.1 Fix):** Spieler können ein "Catch a Breath" deklarieren oder einen Narrative Flaw akzeptieren, damit der GM ihnen mitten in der Session physisch ein AP-Token zurückgibt, um Token-Starvation im Late-Game zu verhindern.
- **Der SNR Track:** Der GM verwendet einen physischen Papier-Tracker oder eine Drehscheibe (aus den druckbaren Assets), um die Acoustic SNR der Party zu tracken.
- **Parity:** Wenn die Party physisch Lärm macht (lautes Rollen, Tokens fallen lassen), kann der GM optional die physische SNR-Scheibe vorrücken. Zum Synchronisieren tippt der GM auf den `+ HEAT`-Button auf seinem digitalen Dashboard.

## 3. Asymmetric State Syncing (The Netrunner & The Solo)
**Digital:** Der Server berechnet 200ms Lock-Windows, sodass ein AR-Hack perfekt mit dem physischen Öffnen einer Tür übereinstimmt.
**Analog Synchronization:**
- **Der Split-Timer:** Wenn der physische Tisch den Combat initiiert, stellt der GM eine physische Eieruhr oder Sanduhr (z. B. 2 Minuten Echtzeit) für den Netrunner, um sein physisches Hacking-Puzzle (z. B. ein Mastermind-ähnliches Steckbrett oder ein Karten-Matching-Spiel) zu beenden.
- **Synchronized Breach (V2.1 Fix):** Wenn die Party physische Actions aufteilt, können sie eine "Group Action" initiieren. Die Spieler werfen ihre D6s physisch in eine einzige gemeinsame Schale und ermitteln den Durchschnitt der Successes, um zu verhindern, dass der schlechte Roll eines Spielers die gesamte Split-Operation scheitern lässt.
- **Parity:** Wenn der Netrunner das Puzzle beendet, bevor der Timer abläuft, pusht der GM den `UNLOCK_DOOR`-Status an das VTT, wodurch der neue Raum für die digitalen Spieler sofort aufgedeckt wird.

## 4. Psychological Mechanics & The Diegetic Economy
**Digital:** Die AR-App vibriert, Text verschlüsselt sich unter Allostatic Stress, und Spieler verwenden NFC-Tags, um Gear auszurüsten.
**Analog Synchronization:**
- **Physische Stress Cards:** Wenn Spieler Stress erleiden, überreicht der GM ihnen verdeckt "Bleed Cards". Unter dem V2.1 Ruleset dürfen diese Karten keine harten Lockouts enthalten (wie übersprungene Züge). Stattdessen bieten sie handhabbare mechanische Trade-offs (z. B. "-1 auf Agility Checks") oder widersprüchliche Infos/Secret Objectives.
- **Physisches Gear:** Druckbare Item Cards.
- **Parity:** Um ein physisches Item zu synchronisieren, scannen Spieler den QR-Code, der auf der Rückseite der Item Card gedruckt ist, mit der AR Companion App. Das Item wird sofort aus dem Chaos Market gelöscht und ihrem digitalen Inventory hinzugefügt.

## 5. E2EE Backchannels (The Dark Net)
**Digital:** Ende-zu-Ende-verschlüsselter Chat via Android-App unter Verwendung lokaler Curve25519-Keys.
**Analog Synchronization:**
- **Burner Notes:** Spieler schreiben physische Notizen aneinander.
- **Der Intercept:** Ein Spieler mit einer physischen Ability Card für einen "Air-Gap Hack" kann verlangen, die Notiz zu lesen, bevor sie den Empfänger erreicht.
- **Parity:** Spieler können den Inhalt ihrer physischen Notizen nach der Session in den Chat-Logger der AR-App eingeben, um sicherzustellen, dass das narrative LLM-Backend ihre Pläne in die prozedurale Generierung der nächsten Session einbezieht.

## 6. Progress Clocks & Flashbacks
**Digital:** Synchronisierte SVGs aktualisieren sich auf allen Geräten.
**Analog Synchronization:**
- **Paper Clocks:** Zeichne Kreise auf Karteikarten, unterteilt in 4, 6 oder 8 Segmente. Fülle sie mit einem Marker aus.
- **Sequentielles Füllen (V2.1 Fix):** Der GM muss Paper Clocks sequentiell ausmalen (1 Segment pro Threat, der auf einem Roten Würfel generiert wird). Ein einzelner gemischter Success-Roll kann eine Clock nicht mehr sofort bis zum Maximum füllen.
- **Parity:** Das digitale Interface des GMs ermöglicht es ihm, Clocks manuell zu ticken. Das Ticken einer digitalen Clock lässt die VTT-Bildschirme aufblitzen; der GM malt dann physisch die analoge Clock auf dem Tisch aus.

## 7. Multiple Levels & Outdoor Environments
**Digital:** Das GM-Interface ermöglicht den sofortigen Wechsel zwischen Z-Levels (Level 1, Level 2 usw.) und das Rendern von Outdoor-Terrain (Straßen, Gras, Wasser). Der Grid Store mappt Koordinaten über eine `X,Y,Z`-Signatur.
**Analog Synchronization:**
- **Layered Blueprints:** Der GM sollte mehrere physische Seiten oder transparente Overlay-Folien (Acetat) verwenden, um verschiedene Stockwerke eines Gebäudes darzustellen.
- **Parity:** Wenn die Party ein physisches Treppenhaus hinaufsteigt, drückt der GM einfach den `[LEVEL 2]`-Toggle in der digitalen App, um die AR-Ansicht auf die neue Z-Achse einrasten zu lassen, was perfekt zu der physischen Map-Seite passt, die auf dem Tisch umgeblättert wird.

---
*Alle analogen Rulebooks und digitalen Codebases werden in Parity gehalten. Jede digitale Action hat ein physisches Analog, und jeder physische Roll kann von der digitalen Engine aufgenommen werden.*
