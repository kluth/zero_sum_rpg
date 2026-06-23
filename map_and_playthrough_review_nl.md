# Zero Sum RPG - Map-Building & Playthrough Review

Dit document biedt een vergelijkende analyse van de map-building mechanics in Zero Sum RPG ten opzichte van Pen & Paper (P&P) RPG standaarden, stelt UX/UI verbeteringen voor voor de Angular Spectator Web App, en identificeert ontbrekende playthrough scenario's om de geautomatiseerde screenshot coverage uit te breiden.

---

## 1. P&P RPG Standaarden Vergelijking

| Mechanic | Pen & Paper (P&P) RPG Standaarden | Zero Sum RPG Implementatie | Vergelijking & Aanbevelingen |
| :--- | :--- | :--- | :--- |
| **Fog of War (FoW)** | Traditioneel handmatig door GMs afgehandeld die maps afdekken met vellen papier of dry-erase markers. VTTs (Virtual Tabletops) onthullen gebieden dynamisch op basis van grid distance en lichtbronnen. | Programmatisch geïmplementeerd. Spelers hebben een actieve field-of-view radius (bijv. 5-6 tiles) die grid points en structuren in real-time onthult (reveals). | Zero Sum RPG komt overeen met moderne VTT FoW. De P&P standaard vereist echter memory/retention van structurele layouts (het tekenen van maps blijft zichtbaar zodra ze verkend zijn, terwijl dynamische entities zoals monsters/traps weer in de fog verdwijnen). De room memory logica (`isMemory = true; isVisible = true;`) moet strikt gehandhaafd worden. |
| **Line of Sight (LoSight / LOS)** | Berekend via standaard geometrische raycasting of GM inschatting. Geblokkeerd door zwaar terrain, pilaren, walls, gesloten doors. | Raycasting wordt afgehandeld via Bresenham's lijn algoritme (`hasLineOfSight`) om tile visibility te evalueren. Een cell blokkeert line of sight als het een `wall` of een `door_locked` is. | De logica is robuust, maar rooms werden voorheen alleen gecontroleerd op afstand tot het centrum in plaats van line of sight naar de room entrance of het centrum te verifiëren, wat leidde tot immersie-brekende room reveals door massieve walls. Het integreren van LOS checks vóór het onthullen van een room is cruciaal om overeen te komen met standaard P&P regels. |
| **Prep vs. Dynamic Painting** | GMs preppen maps vóór sessions (statisch dungeon design) en painten dynamisch (tekenen hazards, debris, grease, fires, barriers) tijdens een scene. | GMs kunnen prefabs plaatsen (bijv. Corridor, MedBay, Data Terminal) of een "Tile Painter" gebruiken om walls, doors, CCTV nodes, en furniture dynamisch te painten. | Zero Sum RPG combineert succesvol prep met dynamic painting. De grid sync mechanic (`SYNC GRID TO RTDB`) zorgt ervoor dat de GM de state mid-game kan manipuleren. |
| **Block Limits** | Oneindig bij fysiek tekenen (alleen beperkt door map grootte). Bij fysieke board games beperkt door fysieke tile pieces (bijv. 50 floor tiles in de doos). | Hard-capped op 50 blocks in de UI building block pool om performance degradatie op Firebase Realtime Database te voorkomen. | De 50-block limit bootst boxed tabletop board games na. Echter, een warning/danger color threshold in de UI helpt GMs om resource beperkingen dynamisch te beheren. |
| **Room Properties** | Rooms hebben beschrijvende notities (flavor text, threat, lock details, ambient traps). | Rooms hebben aanpasbare metadata: Tag (bijv. MedBay), Threat Level (low/medium/critical), en VFX properties (red flash, blue flicker, glitch). | Komt overeen met P&P standaarden. In Zero Sum RPG synchroniseren deze properties echter direct naar database nodes om visuele indicators (zoals alarms of glitch effecten) voor spectator en player screens te veranderen. |

---

## 2. Angular Spectator Web App UX/UI Verbeteringen

Om de spectator experience naar professionele broadcast standaarden te tillen (vergelijkbaar met Twitch streaming overlays of professionele tournament screens), moeten de volgende verbeteringen worden doorgevoerd:

1. **Dense Layout / CSS Grid Column Layout**:
   - In plaats van een enkele verticale stack is een dashboard met drie kolommen ideaal:
     - **Linker Kolom**: Live console logs (dice rolls, Twitch market value, donation logs).
     - **Middelste Kolom**: Grote PixiJS tactical map canvas voor hoge visuele focus.
     - **Rechter Kolom**: Squad status cards met details over actieve characters, HP pools, stress levels, en stealth statussen.
2. **Accessibility & Contrast**:
   - Gebruik hoog contrast cyber-aesthetic paletten (bijv. fel neongroen `#00FF00`, neonblauw `#00E5FF`, neonrood `#FF2A2A`).
   - Standaardiseer sidebar randen met duidelijke gloeiende neon schaduwen (`box-shadow: 0 0 10px ...`) om zichtbaarheid op schermen met laag contrast te verbeteren.
3. **Pulsating Alert Bar**:
   - Een zeer zichtbare, pulserende alert bar bovenaan de interface om viewers te waarschuwen wanneer de GM de globale threat/heat naar hoge levels verhoogt (heat >= 8) of wanneer er een trauma event optreedt.
4. **Token Indicators**:
   - Visueel onderscheidende indicator rings rond character tokens:
     - Groene Ring: Stealth level is >= 50 (character verstopt zich actief/is stealthy).
     - Rode Ring: Stealth level is < 50 (character is gecompromitteerd/exposed).
5. **Loaders & Feedback**:
   - Betere feedback voor asynchrone state operations (bijv. Netrunner network ping of Firebase sync status).

---

## 3. Playthrough Scenario's voor Geautomatiseerde Screenshot Coverage

Om client UI states onder diverse game scenario's volledig te valideren, moeten we de geautomatiseerde Playwright screenshots uitbreiden om het volgende te dekken:

1. **GM Panel Properties Edit**:
   - GM klikt op een room/prefab op de canvas, opent de properties tab, past de Threat/VFX metadata aan, en klikt op de sync button.
2. **WFC Generate Squeeze Failure Output**:
   - Triggeren van het Wave Function Collapse (WFC) generation algoritme en het tonen van de error fallback message wanneer maximale recursion limits bereikt zijn.
3. **High Heat / Alarm State**:
   - Verhogen van globale heat naar 8+ of triggeren van een trauma event om de knipperende rode alert bar / billboard visual overload vast te leggen.
4. **Netrunner Terminal Help & Grep Command**:
   - Invoeren van `help` en `grep` commands in de Netrunner terminal om de LLM-ICE prompt processing en command assistance output te verifiëren.
5. **Netrunner BLE Connection Attempt**:
   - Interactie met de Bluetooth Low Energy beacon connection button en het verifiëren van terminal log outputs.
6. **Twitch Donation Simulator Click**:
   - Klikken op de Twitch donation simulator button om te verifiëren dat de Twitch market value in de Spectator View updatet en dynamisch van kleur verandert.
