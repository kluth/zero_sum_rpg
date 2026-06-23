# TTRPG ARCHITECTURE V2: LIMIT-BREAK INITIATIVE

Dieses Dokument stellt die zusammengefasste architektonische Roadmap für die nächste Generation der Zero Sum RPG Engine und ihrer Augmented Reality (AR) Android Companion-App dar. Es integriert die Kernphilosophien von 10 TTRPG-Giganten in ein nahtloses, hochperformantes Echtzeitsystem.

---

## 1. Core Mechanics & Mathematical Flatness (MassMarket-Architect)
**Bounded Accuracy & API-Friendly JSON**
Das System verzichtet auf die volatilen 0-100-Prozentskalen zugunsten flacher, streng begrenzter Integer (1-20). Dies stellt sicher, dass Modifikatoren (+/- 1 bis 3) extrem wirkungsvoll bleiben. Um jegliche Parsing-Verzögerung in der Android AR-App zu vermeiden, werden alle mathematischen Berechnungen vollständig auf den Server ausgelagert. Der Client konsumiert ein flaches, vorausberechnetes JSON-Schema:
- `stealth_total` wird direkt übergeben; der Client berechnet Modifikatoren niemals iterativ.
- Conditions sind flache Enums (z.B. `CYBERPSYCHOSIS`) für sofortige O(1) Condition-Checks.

## 2. Action Economy & Combat Analytics (Tactical-Mathematician)
**Das 3-Action Economy & Firebase Tag Engine**
Basierend auf umfangreichen Monte-Carlo-Simulationen nutzt die Combat-Engine ein 3-Action Point (AP) System pro Turn.
- "Attack Spam" erzeugt kumulative Acoustic SNR-Strafen, die massive Schwärme alarmieren.
- Players müssen AP zwischen Combat, Hacking und Stress Management ausbalancieren.
- **AP Recovery & Standardization (V2.1 Fix):** Players können nicht länger mehrere AP ausgeben, um Rolls zu umgehen (Auto-Success ist deaktiviert). AP fügen strictly Modifier Dice (Green/Blue) zu Pools hinzu. Um AP-Mangel im Late-Game zu verhindern, können Players einen "Catch a Breath"-Move ausführen, um 1 AP zurückzugewinnen, oder absichtlich eine Narrative Flaw-Komplikation für einen sofortigen AP-Refund akzeptieren.
- Ein **Modular Tag System** läuft im Firebase-Backend und löst additive Mathematik und boolesche Overrides (z.B. `BUFF:ACCURACY:+2:1_TURN`) auf, bevor das final reduzierte State-Array an die Jetpack Compose UI der AR-App gepusht wird.

## 3. Asymmetric State Syncing (Asymmetric-Integrator)
**Lösung des Split-Party-Problems**
Wenn der Netrunner via AR-App eine Datenfestung infiltriert, während der Solo auf dem VTT kämpft, erzwingt das Backend eine einheitliche **Simultaneous Resolution Queue** via WebSockets/Socket.io.
- Echtzeit- und rundenbasierte Kontexte werden überbrückt, indem "AR Hacks" bestimmten AP-Kosten zugeordnet werden.
- **Group Action Mechanic (V2.1 Fix):** Um klobiges analoges Split-Party-Syncing zu beheben, können Players einen "Synchronized Breach" initiieren. Sie legen ihre Dice zusammen und bilden den Durchschnitt ihrer Successes, oder geben AP aus, um einem Verbündeten an einer aufgeteilten Front zu "Assist"ieren, wodurch verhindert wird, dass ein einzelner schlechter Roll eine Doppeloperation katastrophal scheitern lässt.
- Der State wird für 200ms-Fenster gesperrt, um Split-Party-Ereignisse zu berechnen, was sicherstellt, dass die erfolgreiche ICE-Entschlüsselung des Netrunners exakt mit dem Entriegeln der physischen Tür auf dem VTT für den Solo korreliert.

## 4. Multi-Axis Resolution Engine (MultiAxis-Resolutor)
**Narrative Dice Pools & Backend Offloading**
Binäres Pass/Fail wird durch einen multidimensionalen Dice Pool (Success/Failure, Advantage/Threat, Triumph/Despair) ersetzt.
- **Threat Re-Balancing & Sequential Clocks (V2.1 Fix):** Die Wahrscheinlichkeit, dass rote "Danger" Dice katastrophale Fehlschläge auslösen, wurde abgemildert. Außerdem müssen mehrteilige Paper Clocks sequenziell gefüllt werden (ein Tick pro generiertem Threat). Ein einzelner Mixed Success Roll kann eine Clock nicht länger auf das Maximum springen lassen.
- **Der "Dumb" Client**: Die Android-App sendet nur die Absicht des Players und Kontext-Tags (z.B. `"action": "hack", "context": ["under_fire"]`).
- **Server-Side Generation**: Der Backend Core berechnet den Dice Pool, führt den RNG Roll aus und übersetzt die mechanischen State-Änderungen.
- **LLM Narrative Injection**: Das Backend verwendet ein sicheres internes LLM, um mechanische Ergebnisse (z.B. "Failed with 3 Advantages") in reichhaltige, kontextbezogene Prosa zu übersetzen, bevor die finale Narrative und State-Updates an den Client zurückgeschickt werden.

## 5. Psychological Mechanics & UI Glitching (Psychological-Engineer)
**Ausnutzung des AR-Geräts für Paranoia**
Die AR Companion-App fungiert als Kanal für "Bleed".
- **Hidden Notifications**: Der GM kann sichere Push-Benachrichtigungen via der Firebase FCM Layer an bestimmte Players senden und sie mit Halluzinationen oder widersprüchlichen Infos füttern.
- **Manageable Bleed Cards (V2.1 Fix):** Die physischen/digitalen "Bleed Cards" erzwingen keine harten mechanischen Lockouts mehr (z.B. übersprungene Turns oder erzwungene Erblindung). Stattdessen erzwingen sie narrative Komplikationen und handhabbare Trade-Offs (z.B. "-1 auf Agility Checks, es sei denn, man drängt rücksichtslos vorwärts"), wodurch die unspaßige Todes-Spirale entfernt wird.
- **Allostatic Stress Glitching**: Wenn der Allostatic Load eines Players Schwellenwerte überschreitet, degradiert die Jetpack Compose UI physisch—Text verschlüsselt sich, Bildschirme reißen via Shader und das Gerät nutzt seinen haptischen Motor, um einen rasenden Herzschlag zu imitieren.

## 6. The Diegetic Economy & Hardware Interaction (Diegetic-Economist)
**Das AR Neural Deck**
Die Companion-App ist kein Meta-Tool; sie existiert In-Universe.
- **NFC Gear Equip**: Players nutzen ihr physisches Gerät, um NFC-Tags oder AR-Marker zu scannen, um Ausrüstung auszurüsten.
- **Acoustic Encumbrance**: Schwere Ausrüstung erhöht direkt den Acoustic SNR-Output des Players.
- **The Chaos Market**: Players kaufen/verkaufen Entschlüsselungskeys mit Credits, die vollständig vom Twitch Spectator Chaos Market beeinflusst werden.

## 7. Factions, Leverage & The Dark Net (SocioPolitical-Weaver)
**Zero-Sum Betrayal & E2EE Backchannels**
- **Leverage Currency**: Players gewinnen Leverage, indem sie für Verbündete einstehen (und deren Stress auf sich nehmen), und geben es aus, um Ressourcen zu stehlen (z.B. das Überschreiben des Emergency Heal eines Teammitglieds).
- **The Dark Net**: Die Android-App bietet ein sicheres E2EE-Chat-Protokoll fürs Plotten. Unter Verwendung lokaler Curve25519-Keys werden Ciphertexts via Firebase RTDB synchronisiert.
- **Air-Gap Hacks**: Ein Player kann sein Gerät physisch gegen das entsperrte Gerät eines Verbündeten tippen (via NFC), um dessen Private Key zu klonen und den sicheren Backchannel abzufangen.

## 8. Progress Clocks & Pacing (Pacing-Conductor)
**Visualizing Doom**
- **Synchronized SVGs**: Das VTT und die AR-App rendern nativ synchronisierte SVG "Progress Clocks", die direkt aus einem `@ngrx/signals`-Store gespeist werden, der via Firebase aktualisiert wird.
- **Flashback Metacurrency**: Um tote Zeit am Spieltisch zu eliminieren, geben Players Metacurrency aus, um Flashbacks zu initiëren (z.B. "Ich habe die Wache gestern bestochen"), wodurch die Simulation über ein globales bernsteinfarbenes UI-Overlay pausiert wird.

## 9. Dynamic PbtA-Style Dashboards (Narrative-Engineer)
**Context-Aware "Moves"**
Die Android UI verzichtet auf statische Character Sheets. Gesteuert durch die Firebase `narrativeContext` Node wechselt die UI Zustände:
- **Phase A (Idle)**: Standard-Erkundung.
- **Phase B (Reactive)**: Wenn eine Bedrohung auftaucht, leuchtet die UI purpurrot. Generische Aktionen werden deaktiviert, und der Player wird gezwungen, auf massive "Moves" zu reagieren, die auf seinen Bildschirm gepusht werden (z.B. `[ENGAGE IN VIOLENCE]`).
- **Phase C (Consequence)**: Bei einem Mixed Success präsentiert die UI eine invertierte brutalistische Checkliste, die den Player zwingt, sein eigenes Opfer zu wählen.

## 10. Brutal Non-Linear Progression (Progression-Artisan)
**Das Synaptic Grid & O(1) Matrix Calculations**
- **Progression**: Players navigieren durch einen massiven DAG von "Neural Praxis"-Nodes. Das Prüfen von Unlock-Bedingungen wird via bitweiser Operationen (Bitsets) in Nanosekunden im Node.js-Backend ausgeführt.
- **Critical Fumble/Hit Tables**: Granulare d100-Perzentil-Ergebnisse werden strikt in **O(1)**-Zeit unter Verwendung flacher `Int16Arrays` und der Vose's Alias-Methode für gewichtete Wahrscheinlichkeiten verarbeitet. Der Server berechnet einen zerschmetterten Oberschenkelknochen oder eine katastrophale Waffenladehemmung sofort und pusht nur die `effectId` an die UI, um die brutale Beschreibung zu rendern.

---

### Implementation & Deployment Plan (Stage 1)
1.  **Architecture Initialization**: Refactoring der `core-domain` in das vorgeschlagene JSON-Schema.
2.  **WebSockets & MCP Server Integration**: Bau der Model Context Protocol (MCP) Server-Endpunkte, die es dem internen LLM ermöglichen, die Dice Pool-States direkt zu interpretieren.
3.  **Firebase Rule Locking**: Implementierung der E2E-Verschlüsselungs-Namespaces und Verschärfung der RTDB `.read/.write`-Rules für die diegetischen UI-Updates.

**Wartet auf Executive `/approve`, um mit iterativen Codebase-Rewrites zu beginnen.**
