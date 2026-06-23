# Projekt: Zero Sum RPG - Automatisiertes Multi-Agent Load Testing

## Architektur

Die Zero Sum RPG-Suite ist als Echtzeit-Multiplayer-Tabletop-Companion-System konzipiert. Um Skalierbarkeit und Sub-Sekunden-Propagation-Latency unter aktivem Gameplay zu gewährleisten, nutzt die Architektur **Firebase Realtime Database (RTDB)** als Single Source of Truth für die Synchronisation, wodurch die vorherige Socket.io-Implementierung ersetzt wird.

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

### Komponenten

1. **Android Companion App (`zero_sum_android/`)**:
   - Entwickelt mit Native Kotlin und Jetpack Compose.
   - Verbindet sich direkt mit der Firebase Realtime Database.
   - Führt Writes durch, um Stats auf dem Character Sheet des Spielers zu aktualisieren, Dice Rolls zu loggen und Maps prozedural zu generieren.
   - Lauscht auf Datenbank-Updates, um den visuellen Sync aufrechtzuerhalten.

2. **Angular Spectator Web App (`web-app/`)**:
   - Entwickelt mit Angular 17.
   - Listen-only Verbindung zur Firebase Realtime Database.
   - Synchronisiert Display-Komponenten (Live Rolls Feed, Squad HP/Stealth und taktische Map-Darstellung) in Echtzeit mit dem globalen State.

3. **Node.js Client Simulator / Load Tester**:
   - Ein leichtgewichtiges Automation Runner-Skript, das das Firebase JS Client SDK (verbunden mit dem lokalen Firebase Emulator) verwendet.
   - Spawnt dynamisch 50 gleichzeitige Player-Sessions.
   - Misst und meldet die Propagation Latency über alle Clients, wenn ein Client eine Transaction durchführt (z. B. Dice Rolling).

4. **Lokale Entwicklung (Firebase Emulator Suite)**:
   - Lokal konfiguriert über `firebase.json`.
   - Emuliert die Realtime Database auf Port 9000, was Offline-Entwicklung, Styling und deterministisches Load Testing ermöglicht.

---

## Meilensteine

| # | Meilenstein-Name | Beschreibung | Status |
|---|---|---|---|
| **M1** | **Explore & Design** | Analyse der Client/Server-Sync Codebase, Identifikation von Socket.io-Integrations-Resten, Entwurf eines Konzepts für die Transition zur Firebase Realtime Database und Ausarbeitung von Verifizierungs-Methoden. | **DONE** |
| **M2** | **Android & DB Refactor** | Bereinigung von `NetworkManager.socket`-Resten in der Android App. Hinzufügen von Character Profile Sync-Methoden zu `NetworkManager.kt` unter Verwendung des Firebase SDK. Update beider Apps für die Verbindung zum lokalen Firebase Emulator. | **DONE** |
| **M3** | **Load Test Runner** | Entwicklung eines Node.js Test Runner-Skripts mit dem Firebase JS SDK, um 50 simulierte Player-Sessions hochzufahren, die gleichzeitig auf dem lokalen RTDB-Emulator lesen und schreiben (Reads and Writes). | **DONE** |
| **M4** | **Verifizierung** | Implementierung von programmatischem Propagation Tracking und Latency-Messungen (Mean, Median, P95, P99). Ausgabe von Latency-Metriken und Verifizierungs-Zusammenfassungen in Reports. | **DONE** |

*Anmerkung zur Verifizierung: Verifiziert von 2 Reviewers, 2 Challengers und 1 Forensic Auditor (Urteil: CLEAN). Die Latencies wurden unter 1000ms bei einer Sync-Erfolgsrate von 100 % über 50 simulierte Player-Sessions gemessen.*

---

## Interface Contracts (State Synchronization Schemas)

Der State Sync ist unter einem einzigen Root Node `/gameState` in der Realtime Database strukturiert.

### 1. Character Profile Schema
- **Path**: `/gameState/characters/{characterId}`
- **Type**: Object
- **Fields**:
  - `name` (string, required): Character-Name des Spielers. (z.B. `"KAIRO 'GHOST' CHEN"`)
  - `role` (string, required): Operational Role/Class. (z.B. `"CYBER-INFILTRATOR"`)
  - `hp` (integer, required): Aktueller Health Pool, von `0` bis `100`. (z.B. `78`)
  - `stealth` (integer, required): Stealth-Fähigkeitslevel, von `0` bis `100`. (z.B. `85`)

### 2. Dice Roll Schema
- **Path**: `/gameState/recentRolls`
- **Type**: Array of Objects (beinhaltet die 10 jüngsten Rolls)
- **Fields**:
  - `rollId` (string, required for tests): Eindeutiger UUID- oder Timestamp-Identifier zum Tracken und Matchen.
  - `player` (string, required): Name des Spielers, der gerollt hat. (z.B. `"Ghost"`)
  - `result` (integer, required): Roll-Ergebnis eines D20, von `1` bis `20`. (z.B. `18`)
  - `timestamp` (long, required): Unix Timestamp in Millisekunden, der anzeigt, wann der Roll getätigt wurde. (z.B. `1718911200000`)

### 3. Map Data Schema
- **Path**: `/gameState/map`
- **Type**: Object
- **Fields**:
  - `archetype` (string, required): Theme-Klassifizierung der Facility. (z.B. `"Data Vault"`)
  - `layoutStructure` (string, required): Layout-Stil der Facility. (z.B. `"Grid Matrix"`)
  - `rooms` (Array of Objects, required): Array von Room Configurations, enthaltend:
    - `id` (integer, required): Index-Sequenz des Rooms. (z.B. `1`)
    - `name` (string, required): Name/Typ des Rooms. (z.B. `"Security Checkpoint"`)
    - `complication` (string, required): Hazards oder Lock-Status. (z.B. `"Biometric Lockdown"`, `"Clear"`)
    - `isObjective` (boolean, required): `true` wenn dieser Room der finale Extraction Point oder das Objective Target ist.
