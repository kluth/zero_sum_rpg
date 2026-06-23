# Zero Sum RPG - Map-Building & Playthrough Review

Dieses Dokument bietet eine vergleichende Analyse der Map-Building-Mechaniken im Zero Sum RPG im Verhältnis zu Pen & Paper (P&P) RPG-Standards, schlägt UX/UI-Erweiterungen für die Angular Spectator Web App vor und identifiziert fehlende Playthrough-Szenarien, um die automatisierte Screenshot-Coverage zu erweitern.

---

## 1. P&P RPG Standards Vergleich

| Mechanik | Pen & Paper (P&P) RPG Standards | Zero Sum RPG Implementierung | Vergleich & Empfehlungen |
| :--- | :--- | :--- | :--- |
| **Fog of War (FoW)** | Traditionell manuell von GMs gehandhabt, die Maps mit Papierbögen oder Dry-Erase-Markern abdecken. VTTs (Virtual Tabletops) decken Bereiche basierend auf Grid-Distanz und Lichtquellen dynamisch auf. | Programmatisch implementiert. Spieler haben einen aktiven Field-of-View-Radius (z. B. 5-6 Tiles), der Grid-Punkte und Strukturen in Echtzeit aufdeckt (Reveals). | Zero Sum RPG entspricht modernem VTT FoW. Der P&P-Standard erfordert jedoch Memory/Retention von strukturellen Layouts (das Zeichnen von Maps bleibt sichtbar, sobald sie erkundet wurden, während dynamische Entities wie Monster/Traps wieder in den Fog übergehen). Die Room Memory-Logik (`isMemory = true; isVisible = true;`) sollte strikt erzwungen werden. |
| **Line of Sight (LoSight / LOS)** | Berechnet über Standard-geometrisches Raycasting oder GM-Einschätzung. Blockiert durch schweres Terrain, Säulen, Wände, geschlossene Türen. | Raycasting wird über Bresenhams Linien-Algorithmus (`hasLineOfSight`) gehandhabt, um die Tile-Visibility zu evaluieren. Eine Cell blockiert Line of Sight, wenn sie eine `wall` oder eine `door_locked` ist. | Die Logik ist robust, aber Rooms wurden zuvor nur durch die Distanz zum Zentrum überprüft, anstatt Line of Sight zum Room Entrance oder Zentrum zu verifizieren, was zu immersionsbrechenden Room Reveals durch massive Wände führte. Die Integration von LOS Checks vor dem Reveal eines Rooms ist kritisch, um den P&P-Standardregeln zu entsprechen. |
| **Prep vs. Dynamic Painting** | GMs preppen Maps vor Sessions (statisches Dungeon Design) und painten dynamisch (zeichnen Hazards, Debris, Grease, Fires, Barriers) während einer Scene. | GMs können Prefabs platzieren (z. B. Corridor, MedBay, Data Terminal) oder einen "Tile Painter" verwenden, um Walls, Doors, CCTV-Nodes und Furniture dynamisch zu painten. | Zero Sum RPG verbindet Prep und Dynamic Painting erfolgreich. Die Grid Sync-Mechanik (`SYNC GRID TO RTDB`) stellt sicher, dass der GM den State mid-game manipulieren kann. |
| **Block Limits** | Unendlich im physischen Zeichnen (nur durch Map-Größe begrenzt). In physischen Board Games durch physische Tile-Pieces begrenzt (z. B. 50 Floor Tiles in der Box). | Hard-capped auf 50 Blocks im UI-Building-Block-Pool, um Performance-Degradation in der Firebase Realtime Database zu verhindern. | Das 50-Block-Limit ahmt Tabletop Board Games in Boxen nach. Eine Warning/Danger-Color Threshold im UI hilft GMs jedoch, Ressourcenbeschränkungen dynamisch zu managen. |
| **Room Properties** | Rooms haben beschreibende Notizen (Flavor Text, Threat, Lock-Details, Ambient Traps). | Rooms haben anpassbare Metadaten: Tag (z.B. MedBay), Threat Level (low/medium/critical), und VFX-Properties (red flash, blue flicker, glitch). | Entspricht P&P-Standards. In Zero Sum RPG synchronisieren sich diese Properties jedoch sofort mit den Database Nodes, um visuelle Indicators (wie Alarme oder Glitch-Effekte) für Spectator- und Player-Screens zu ändern. |

---

## 2. Angular Spectator Web App UX/UI Verbesserungen

Um die Spectator-Experience auf professionelle Broadcast-Standards (ähnlich wie Twitch Streaming Overlays oder professionelle Tournament-Screens) zu heben, sollten die folgenden Verbesserungen vorgenommen werden:

1. **Dense Layout / CSS Grid Column Layout**:
   - Anstelle eines einzelnen vertikalen Stacks ist ein dreispaltiges Dashboard ideal:
     - **Linke Spalte**: Live Console Logs (Dice Rolls, Twitch Market Value, Donation Logs).
     - **Mittlere Spalte**: Großer PixiJS Tactical Map Canvas für hohen visuellen Fokus.
     - **Rechte Spalte**: Squad Status Cards mit Details zu aktiven Characters, HP Pools, Stress Levels und Stealth-Status.
2. **Accessibility & Contrast**:
   - Verwende kontrastreiche Cyber-Aesthetic-Paletten (z. B. grelles Neongrün `#00FF00`, Neonblau `#00E5FF`, Neonrot `#FF2A2A`).
   - Standardisiere Sidebar-Ränder mit deutlichen leuchtenden Neon-Schatten (`box-shadow: 0 0 10px ...`), um die Sichtbarkeit auf kontrastarmen Bildschirmen zu verbessern.
3. **Pulsating Alert Bar**:
   - Eine stark sichtbare, pulsierende Alert Bar am oberen Rand des Interfaces, um Viewer zu warnen, wenn der GM die globale Threat/Heat auf hohe Levels (Heat >= 8) erhöht oder wenn ein Trauma-Event auftritt.
4. **Token Indicators**:
   - Optisch eindeutige Indicator Rings um Character Tokens:
     - Grüner Ring: Stealth-Level ist >= 50 (Character versteckt sich aktiv/ist stealthy).
     - Roter Ring: Stealth-Level ist < 50 (Character ist kompromittiert/exponiert).
5. **Loaders & Feedback**:
   - Besseres Feedback für asynchrone State Operations (z. B. Netrunner Network Ping oder Firebase Sync-Status).

---

## 3. Playthrough-Szenarien für Automated Screenshot Coverage

Um Client UI States unter diversen Game-Szenarien vollständig zu validieren, sollten wir die automatisierten Playwright Screenshots erweitern, um Folgendes abzudecken:

1. **GM Panel Properties Edit**:
   - GM klickt auf einen Room/Prefab auf dem Canvas, öffnet den Properties Tab, ändert die Threat/VFX-Metadaten und klickt auf den Sync-Button.
2. **WFC Generate Squeeze Failure Output**:
   - Auslösen des Wave Function Collapse (WFC) Generation Algorithmus und Anzeigen der Error Fallback Message, wenn maximale Recursion Limits erreicht werden.
3. **High Heat / Alarm State**:
   - Erhöhung der globalen Heat auf 8+ oder Auslösen eines Trauma-Events, um die blinkende rote Alert Bar / Billboard Visual Overload zu erfassen.
4. **Netrunner Terminal Help & Grep Command**:
   - Eingabe von `help` und `grep` Commands in das Netrunner Terminal, um die LLM-ICE Prompt Processing und Command Assistance Output zu überprüfen.
5. **Netrunner BLE Connection Attempt**:
   - Interaktion mit dem Bluetooth Low Energy Beacon Connection Button und Überprüfung der Terminal Log Outputs.
6. **Twitch Donation Simulator Click**:
   - Klicken auf den Twitch Donation Simulator Button, um zu überprüfen, dass der Twitch Market Value in der Spectator View updatet und dynamisch die Farbe wechselt.
