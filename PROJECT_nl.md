# Project: Zero Sum RPG - Geautomatiseerde Multi-Agent Load Testing

## Architectuur

De Zero Sum RPG suite is ontworpen als een real-time multiplayer tabletop companion systeem. Om schaalbaarheid en sub-seconde propagation latency tijdens actieve gameplay te garanderen, maakt de architectuur gebruik van **Firebase Realtime Database (RTDB)** als de single source of truth voor synchronisatie, ter vervanging van de eerdere Socket.io implementatie.

```
       +---------------------------------------------+
       |          Firebase RTDB (Emulator / Cloud)   |
       +---------------------------------------------+
               ^                       ^
               | (Writes/Reads)        | (Reads-only)
               v                       v
  +-----------------------+   +-----------------------+
  |   Android Companion   |   |   Angular Spectator   |
  |      App (Kotlin)     |   |      Web App          |
  +-----------------------+   +-----------------------+
               ^
               |
  +-----------------------+
  |  Load Testing Agent   |
  |  (50 Simulated Users) |
  +-----------------------+
```

### Componenten

1. **Android Companion App (`zero_sum_android/`)**:
   - Gebouwd met Native Kotlin en Jetpack Compose.
   - Verbindt direct met Firebase Realtime Database.
   - Voert writes uit om speler character sheet stats te updaten, dice rolls te loggen, en maps procedureel te genereren.
   - Luistert naar database updates om de visuele sync te behouden.

2. **Angular Spectator Web App (`web-app/`)**:
   - Ontwikkeld met Angular 17.
   - Listen-only connectie naar Firebase Realtime Database.
   - Synchroniseert display componenten (live rolls feed, squad HP/stealth, en tactische map weergave) in real-time met de globale state.

3. **Node.js Client Simulator / Load Tester**:
   - Een lichtgewicht automation runner script dat de Firebase JS Client SDK (verbonden met de lokale Firebase Emulator) gebruikt.
   - Spawnt dynamisch 50 gelijktijdige player sessions.
   - Meet en rapporteert propagation latency over alle clients wanneer een client een transaction uitvoert (bijv. dice rolling).

4. **Lokale Ontwikkeling (Firebase Emulator Suite)**:
   - Lokaal geconfigureerd via `firebase.json`.
   - Emuleert de Realtime Database op port 9000, wat offline development, styling en deterministische load testing mogelijk maakt.

---

## Mijlpalen

| # | Mijlpaal Naam | Beschrijving | Status |
|---|---|---|---|
| **M1** | **Explore & Design** | Analyse van de client/server sync codebase, identificatie van Socket.io integratie restanten, opstellen van een ontwerp voor de Firebase Realtime Database transitie, en het opstellen van verificatie methodologieën. | **DONE** |
| **M2** | **Android & DB Refactor** | Opruimen van `NetworkManager.socket` restanten in de Android app. Toevoegen van character profile sync methoden aan `NetworkManager.kt` met behulp van de Firebase SDK. Updaten van beide apps om te verbinden met de lokale Firebase Emulator. | **DONE** |
| **M3** | **Load Test Runner** | Ontwikkelen van een Node.js test runner script dat de Firebase JS SDK gebruikt om 50 gesimuleerde player sessions tegelijkertijd te starten, die tegelijk reads en writes naar de lokale RTDB emulator sturen. | **DONE** |
| **M4** | **Verificatie** | Implementatie van programmatische propagation tracking en latency metingen (mean, median, P95, P99). Output van latency metrics en verificatie samenvattingen in reports. | **DONE** |

*Notitie over Verificatie: Geverifieerd door 2 Reviewers, 2 Challengers, en 1 Forensic Auditor (oordeel: CLEAN). Latencies werden gemeten onder 1000ms met een 100% sync success rate over 50 gesimuleerde player sessions.*

---

## Interface Contracts (State Synchronization Schemas)

State sync is gestructureerd onder een enkele root node `/gameState` in de Realtime Database.

### 1. Character Profile Schema
- **Path**: `/gameState/characters/{characterId}`
- **Type**: Object
- **Fields**:
  - `name` (string, required): Character name van de speler. (bijv. `"KAIRO 'GHOST' CHEN"`)
  - `role` (string, required): Operational role/class. (bijv. `"CYBER-INFILTRATOR"`)
  - `hp` (integer, required): Huidige health pool, van `0` tot `100`. (bijv. `78`)
  - `stealth` (integer, required): Stealth capability level, van `0` tot `100`. (bijv. `85`)

### 2. Dice Roll Schema
- **Path**: `/gameState/recentRolls`
- **Type**: Array of Objects (bevat de 10 meest recente rolls)
- **Fields**:
  - `rollId` (string, required for tests): Unieke UUID of timestamp identifier voor tracking en matching.
  - `player` (string, required): Naam van de speler die gerold heeft. (bijv. `"Ghost"`)
  - `result` (integer, required): Roll resultaat van een D20, van `1` tot `20`. (bijv. `18`)
  - `timestamp` (long, required): Unix timestamp in milliseconden die aangeeft wanneer de roll is uitgevoerd. (bijv. `1718911200000`)

### 3. Map Data Schema
- **Path**: `/gameState/map`
- **Type**: Object
- **Fields**:
  - `archetype` (string, required): Theme classificatie van de facility. (bijv. `"Data Vault"`)
  - `layoutStructure` (string, required): Layout style van de facility. (bijv. `"Grid Matrix"`)
  - `rooms` (Array of Objects, required): Array van room configurations bevattende:
    - `id` (integer, required): Index sequence van de room. (bijv. `1`)
    - `name` (string, required): Name/type van de room. (bijv. `"Security Checkpoint"`)
    - `complication` (string, required): Hazards of lock status. (bijv. `"Biometric Lockdown"`, `"Clear"`)
    - `isObjective` (boolean, required): `true` als deze room de finale extraction point of objective target is.
