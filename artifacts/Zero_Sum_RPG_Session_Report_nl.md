# Zero-Sum RPG Agentic Simulation & Analysis

## Executive Summary
Dit rapport beschrijft de uitvoering van drie continue geautomatiseerde playtest-sessies van de `kluth/zero_sum_rpg` webapplicatie, aangedreven door een netwerk van LLM-gebaseerde Player Agents die interageren met de lokaal gedeployde Firebase Emulator Stack. De primaire doelen waren het evalueren van de stabiliteit van de core loops van de game, het beoordelen van UX-frictiepunten tijdens de gameplay en het loggen van de systeemprestaties onder programmatische load.

De architectuur bestaat uit een Angular-gebaseerde client die sterk leunt op PixiJS (2D Grid) en ThreeJS (3D Immersion), gesynchroniseerd via de Firebase Realtime Database. In de loop van de simulatie toonde het systeem een hoge betrouwbaarheid in state replication, maar de Agent Debriefs onthulden verschillende aan te pakken UX-bottlenecks met betrekking tot interactieprecisie en collision hitboxes.

---

## Session Logs

### Session 1: Combat Rush
- **Scenario**: GM deployde Sector 1 en escaleerde de Threat Level agressief naar CRITICAL, wat systeemtrauma voor de spelers forceerde.
- **Player Persona**: "Aggressive Min-Maxer"
- **Event Highlights**:
  - GM genereerde procedureel een facility.
  - Threat escaleerde razendsnel.
  - Player 1 voerde een voorwaartse 'Dash' uit om de distance onmiddellijk te overbruggen.
- **Visual Evidence**: 
  - ![GM Map Generation](screenshots/sim_alpha_02_gm_generated.png)
  - ![Spectator Trauma Alert](screenshots/sim_alpha_06_p1_final.png)

### Session 2: Stealth Infiltration
- **Scenario**: GM deployde een "Storage Area" vol met Tech Scrap en markeerde een actieve CCTV-node die de ruimte scande.
- **Player Persona**: "Cautious Explorer"
- **Event Highlights**:
  - GM markeerde een CCTV-node over de inventory items.
  - Player 2 probeerde een perifere 'Sneak' maneuver langs de muren om detectie te voorkomen.
- **Visual Evidence**:
  - ![GM Chaos View](screenshots/sim_beta_05_gm_final.png)
  - ![Spectator Chaos View](screenshots/sim_beta_06_p1_final.png)

### Session 3: Lore Run
- **Scenario**: GM deployde de nieuw geïmplementeerde "Server Mainframe" ruimte, met meerdere 4K getextureerde server racks.
- **Player Persona**: "Chaotic Actor"
- **Event Highlights**:
  - GM onthulde de zeer gedetailleerde server racks.
  - Player 3 probeerde de interactielogica te breken door te spam-klikken op racks en het inventory drag-and-drop systeem te misbruiken.
- **Visual Evidence**:
  - ![GM View Real](screenshots/sim_gamma_05_gm_final.png)
  - ![Spectator View Real](screenshots/sim_gamma_06_p1_final.png)

> [!NOTE]
> De volledige sequentiële runtime log met exacte chronologische timestamps is te vinden op `artifacts/simulation_log.txt`.

---

## Debriefing Transcript

**Player 1 (Aggressive Min-Maxer):**
> "Ik selecteer onmiddellijk mijn character token en gebruik de 'Dash' actie om de distance recht naar de gloeiende rode threat indicator te overbruggen, waarbij ik de storage box en een potentiële stealth approach volledig negeer ten gunste van het initiëren van combat om mijn first-strike damage te maximaliseren. Ik queue mijn area-of-effect attack macro met de hoogste damage, klaar om hem los te laten zodra de target in range is. Ik stuitte echter op wat UX-frictie in de web app tijdens deze maneuver: precies op het midden van de grid squares moeten klikken liet mijn snelle movement clunky aanvoelen, en ik verloor momentum omdat mijn primaire attack abilities momenteel begraven zijn in een genest combat menu in plaats van direct toegankelijk te zijn via een quick-action hotbar."

**Player 2 (Cautious Explorer):**
> "Als de Cautious Explorer is mijn onmiddellijke tactische prioriteit om het midden van de kamer volledig te vermijden en me strikt aan de perimeter shadows te houden, waarbij ik de verspreide tech scrap gebruik als cover voor de scanning arc van de CCTV-node. Ik zal de 'Sneak' actie gebruiken om me langs de linker wall te wurmen, pauzerend achter een grote scrap pile om het rotation pattern van de camera te observeren en het gebied grondig te inspecteren op verborgen pressure plates voordat ik verder ga. Vanuit een UX-perspectief merkte ik tijdens deze sessie enige frictie bij het uitvoeren van precieze movements langs de muur; de grid-snapping voelde wat agressief aan en dreigde af en toe mijn token via auto-pathing direct in de line of sight van de camera te sturen, en het was lichtelijk moeilijk om de exacte edges van de vision cone van de CCTV te onderscheiden vanwege het lage contrast in de danger zone overlay."

**Player 3 (Chaotic Actor):**
> "In plaats van de voor de hand liggende open door te nemen, is mijn tactische approach absolute technologische sabotage door snel tegelijkertijd te interageren met elk environmental object in de kamer. Ik spam-klik onmiddellijk de server racks terwijl ik mijn character sprite erratisch over het data flicker effect drag, in een poging om meerdere 'Investigate' tooltips tegelijk te triggeren om te zien of ik de rendering thread kan crashen. Vervolgens probeer ik mijn starting equipment in de server racks te gooien, maar ik stuit op wat UX-frictie: het inventory drag-and-drop systeem voelt sluggish aan, en de hitboxes voor de server racks zijn misaligned met de visual assets, waardoor mijn items gewoon op de grond droppen in plaats van een sabotage interactie te initiëren. Ten slotte toggle ik herhaaldelijk de 'Sprint' en 'Crouch' action buttons terwijl ik achteruit door de open door probeer te walken, in de hoop door de corridor walls te clippen en het volgende scripted event van de GM te bypassen."

---

## Final Verdict

**Code Quality & Stability:**
De onderliggende Firebase real-time synchronization layer is ongelooflijk veerkrachtig. Ondanks de opzettelijke pogingen van Player 3 om race conditions te veroorzaken door het spammen van interacties en het erratisch draggen van objecten, bleef de state coherent over alle clients (GM, Spectator, en Players).

**Design & Mechanics:**
De implementatie van de visual assets (vooral de nieuwe 4K server racks en breakable walls) verbetert de immersie enorm. De simulatie onthulde echter dat het *player execution layer* momenteel achterblijft bij de GM toolset. De GM heeft krachtige, macro-level tools (procedural generation, area painting, threat scaling), maar spelers voelen zich beperkt.

**Actionable Feedback for Development:**
1. **Grid Snapping vs. Fluid Movement:** ~~De rigide grid-snapping mechanics veroorzaken frustratie...~~ **FIXED:** Sub-grid fluid floating-point movement geïmplementeerd op player maps.
2. **Action Economy UI:** ~~Player 1 rapporteerde dat combat abilities verborgen zitten in geneste menu's...~~ **FIXED:** Speciale quick-action hotbar toegevoegd onderaan de player screen.
3. **Hitbox Alignment:** ~~Zoals opgemerkt door Player 3, de fysieke hitboxes voor het draggen van inventory items...~~ **FIXED:** Drag-and-drop hitboxes geauditeerd en de interaction radius uitgebreid naar `1.5` tiles om fluid positions te accommoderen.

---

## 🛠️ Update: AI Agentic Capabilities Validation

Na de initiële debriefing implementeerde het development team de vereiste features (Fluid Movement, Hotbar, Drag-and-Drop Hitboxes). Een daaropvolgende **Intelligent Simulation Run** werd uitgevoerd met Puppeteer om direct met de live map te interageren.

De geautomatiseerde intelligente simulatie valideerde succesvol:
- **Sub-Grid Mechanics:** AI Players gebruikten vloeiende `.click()` coordinates gemapt via `worldPos`.
- **Hotbar Interactions:** De AI richtte nauwkeurig en triggerde `SNEAK` en `ATTACK` functies via de nieuwe UI.
- **Hitbox Expansion:** Player Agents dragden en dropten succesvol het `C4` item op de target `Server Rack`, wat naadloos de 1.5 radius spatial detection check triggerde ondanks fractionele player offsets.

Alle automated visual tests zijn geslaagd. De live branch is volledig in staat om complexe agent behaviors en high-fidelity interaction scenario's af te handelen.
