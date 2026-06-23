# TTRPG ARCHITECTURE V2: LIMIT-BREAK INITIATIVE

Dit document vertegenwoordigt de samengestelde architecturale roadmap voor de volgende generatie van de Zero Sum RPG engine en zijn Augmented Reality (AR) Android companion-app. Het integreert de kernfilosofieën van 10 TTRPG-giganten in een naadloos, uiterst performant real-time systeem.

---

## 1. Core Mechanics & Mathematical Flatness (MassMarket-Architect)
**Bounded Accuracy & API-Friendly JSON**
Het systeem stapt af van de volatiele 0-100 percentielschalen ten gunste van vlakke, strikt begrensde integers (1-20). Dit zorgt ervoor dat modifiers (+/- 1 tot 3) uiterst impactvol blijven. Om elke parsing lag in de Android AR-app uit te bannen, worden alle wiskundige berekeningen volledig naar de server ge-offload. De client consumeert een vlak, vooraf berekend JSON-schema:
- `stealth_total` wordt direct doorgegeven; de client berekent iteratief nooit modifiers.
- Conditions zijn vlakke enums (bijv. `CYBERPSYCHOSIS`) voor instant O(1) condition checks.

## 2. Action Economy & Combat Analytics (Tactical-Mathematician)
**De 3-Action Economy & Firebase Tag Engine**
Gebaseerd op uitgebreide Monte Carlo-simulaties, maakt de combat engine gebruik van een 3-Action Point (AP) systeem per turn.
- "Attack Spam" genereert opstapelende Acoustic SNR straffen, wat massale zwermen alarmeert.
- Players moeten AP in balans brengen tussen Combat, Hacking en Stress Management.
- **AP Recovery & Standardization (V2.1 Fix):** Players kunnen niet langer meerdere AP uitgeven om rolls te omzeilen (auto-success is uitgeschakeld). AP voegt strict modifier dice (Green/Blue) toe aan pools. Om AP-tekort in de late-game te voorkomen, kunnen players een "Catch a Breath" move uitvoeren om 1 AP terug te krijgen, of opzettelijk een Narrative Flaw complicatie accepteren voor een instant AP-refund.
- Een **Modular Tag System** draait op de Firebase backend, wat additieve wiskunde en booleaanse overrides oplost (bijv. `BUFF:ACCURACY:+2:1_TURN`) voordat de definitief gereduceerde state-array naar de Jetpack Compose UI van de AR-app wordt gepusht.

## 3. Asymmetric State Syncing (Asymmetric-Integrator)
**Oplossen van het Split-Party Probleem**
Wanneer de Netrunner via de AR-app een datakasteel infiltreert, terwijl de Solo vecht op de VTT, forceert de backend een verenigde **Simultaneous Resolution Queue** via WebSockets/Socket.io.
- Real-time en turn-based contexten worden overbrugd door "AR Hacks" te koppelen aan specifieke AP-kosten.
- **Group Action Mechanic (V2.1 Fix):** Om onhandige analoge split-party syncing op te lossen, kunnen players een "Synchronized Breach" initiëren. Ze voegen hun dice samen en nemen het gemiddelde van hun successes, of geven AP uit om een bondgenoot aan een gesplitst front te "Assist"en, wat voorkomt dat één enkele slechte roll een dubbele operatie catastrofaal doet falen.
- De state wordt voor 200ms-vensters vergrendeld om split-party evenementen te berekenen, wat ervoor zorgt dat de succesvolle ICE-ontsleuteling van de Netrunner exact correleert met het ontgrendelen van de fysieke deur op de VTT voor de Solo.

## 4. Multi-Axis Resolution Engine (MultiAxis-Resolutor)
**Narrative Dice Pools & Backend Offloading**
Binaire pass/fail wordt vervangen door een multidimensionale dice pool (Success/Failure, Advantage/Threat, Triumph/Despair).
- **Threat Re-Balancing & Sequential Clocks (V2.1 Fix):** De waarschijnlijkheid dat rode "Danger" dice catastrofale mislukkingen veroorzaken, is verzacht. Bovendien moeten meerdelige Paper Clocks sequentieel gevuld worden (één vinkje per gegenereerde Threat). Een enkele mixed success roll kan een clock niet langer naar het maximum laten springen.
- **De "Dumb" Client**: De Android-app verzendt enkel de intentie van de player en context-tags (bijv. `"action": "hack", "context": ["under_fire"]`).
- **Server-Side Generation**: De backend core berekent de dice pool, voert de RNG roll uit en vertaalt de mechanische state-veranderingen.
- **LLM Narrative Injection**: De backend gebruikt een veilige interne LLM om mechanische resultaten (bijv. "Failed with 3 Advantages") te vertalen in rijk, contextueel proza voordat het voltooide narratief en state-updates terug naar de client worden gestuurd.

## 5. Psychological Mechanics & UI Glitching (Psychological-Engineer)
**Het AR Apparaat Uitbuiten voor Paranoia**
De AR companion-app fungeert als een kanaal voor "Bleed".
- **Hidden Notifications**: De GM kan veilige push-notificaties via de Firebase FCM-layer naar specifieke players sturen en hen voeden met hallucinaties of tegenstrijdige intel.
- **Manageable Bleed Cards (V2.1 Fix):** De fysieke/digitale "Bleed Cards" forceren geen harde mechanische lockouts meer (bijv. overgeslagen turns of geforceerde blindheid). In plaats daarvan dwingen ze narratieve complicaties en beheersbare trade-offs af (bijv. "-1 op Agility checks tenzij je roekeloos doorzet"), waardoor de onleuke doodsspiraal wordt verwijderd.
- **Allostatic Stress Glitching**: Als de Allostatic Load van een player drempelwaarden overschrijdt, degradeert de Jetpack Compose UI fysiek—tekst raakt door elkaar, schermen scheuren via shaders en het apparaat gebruikt zijn haptische motor om een razende hartslag na te bootsen.

## 6. The Diegetic Economy & Hardware Interaction (Diegetic-Economist)
**Het AR Neural Deck**
De companion-app is geen meta-tool; het bestaat in-universe.
- **NFC Gear Equip**: Players gebruiken hun fysieke apparaat om NFC-tags of AR-markers te scannen om gear uit te rusten.
- **Acoustic Encumbrance**: Zware uitrusting verhoogt direct de Acoustic SNR output van de player.
- **The Chaos Market**: Players kopen/verkopen encryptiesleutels met Credits, die volledig worden beïnvloed door de Twitch spectator Chaos Market.

## 7. Factions, Leverage & The Dark Net (SocioPolitical-Weaver)
**Zero-Sum Betrayal & E2EE Backchannels**
- **Leverage Currency**: Players winnen Leverage door hun bondgenoten te dekken (en hun Stress op zich te nemen) en geven het uit om grondstoffen te stelen (bijv. de Emergency Heal van een teamgenoot overschrijven).
- **The Dark Net**: De Android-app bevat een beveiligd E2EE-chatprotocol voor het plotten. Met behulp van lokale Curve25519-sleutels worden ciphertexts gesynchroniseerd via Firebase RTDB.
- **Air-Gap Hacks**: Een player kan zijn apparaat fysiek tegen het ontgrendelde apparaat van een bondgenoot tikken (via NFC) om diens private key te klonen en het beveiligde backchannel te onderscheppen.

## 8. Progress Clocks & Pacing (Pacing-Conductor)
**Visualizing Doom**
- **Synchronized SVGs**: De VTT en de AR-app renderen native gesynchroniseerde SVG "Progress Clocks" die direct gevoed worden vanuit een `@ngrx/signals` store, geüpdatet via Firebase.
- **Flashback Metacurrency**: Om dode tijd aan tafel te elimineren, geven players Metacurrency uit om Flashbacks te initiëren (bijv. "Ik heb de bewaker gisteren omgekocht"), wat de simulatie pauzeert via een globale amberkleurige UI-overlay.

## 9. Dynamic PbtA-Style Dashboards (Narrative-Engineer)
**Context-Aware "Moves"**
De Android UI verlaat statische character sheets. Gedreven door de Firebase `narrativeContext` node verschuift de UI van states:
- **Phase A (Idle)**: Standaard verkenning.
- **Phase B (Reactive)**: Wanneer er een dreiging opduikt, gloeit de UI karmozijnrood. Generieke acties worden uitgeschakeld en de player wordt gedwongen te reageren op massale "Moves" die naar hun scherm worden gepusht (bijv. `[ENGAGE IN VIOLENCE]`).
- **Phase C (Consequence)**: Bij een Mixed Success presenteert de UI een omgekeerde brutalistische checklist die de player dwingt zijn eigen opoffering te kiezen.

## 10. Brutal Non-Linear Progression (Progression-Artisan)
**Het Synaptic Grid & O(1) Matrix Calculations**
- **Progression**: Players navigeren door een enorme DAG van "Neural Praxis" nodes. Het controleren van unlock-condities wordt uitgevoerd via bitsgewijze operaties (Bitsets) in nanoseconden op de Node.js backend.
- **Critical Fumble/Hit Tables**: Granulaire d100 percentieluitkomsten worden strikt in **O(1)**-tijd verwerkt met behulp van vlakke `Int16Arrays` en de Vose's Alias methode voor gewogen waarschijnlijkheden. De server berekent onmiddellijk een verbrijzeld dijbeen of catastrofale wapenstoring en pusht alleen de `effectId` naar de UI om de brute beschrijving te renderen.

---

### Implementation & Deployment Plan (Stage 1)
1.  **Architecture Initialization**: Refactor `core-domain` naar het voorgestelde JSON-schema.
2.  **WebSockets & MCP Server Integration**: Bouw de Model Context Protocol (MCP) server endpoints waarmee de interne LLM de dice pool states direct kan interpreteren.
3.  **Firebase Rule Locking**: Implementeer de E2E encryptie namespaces en verscherp de RTDB `.read/.write` rules voor de diëgetische UI-updates.

**In afwachting van Executive `/approve` om te beginnen met iteratieve codebase rewrites.**
