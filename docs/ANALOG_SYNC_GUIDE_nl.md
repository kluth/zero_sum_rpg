# ZERO-SUM RPG: HYBRID REALITY SYNC GUIDE

Deze gids biedt het officiële framework voor het synchroniseren van fysieke "Analog" tabletop gameplay met de "Augmented/Digital" engine. Zero-Sum RPG is ontworpen om naadloos via beide media gespeeld te worden, waardoor tafels digitaal gemak kunnen combineren met tactiel fysiek spel.

---

## 1. De Multi-Axis Dice Pool vs. Algoritmische Resolution
**Digital:** De backend server verwerkt alle wiskundige O(1) matrixberekeningen en levert direct narratieve resultaten (bijv. "Failed met 3 Advantages").
**Analog Synchronization:**
- Voor offline of fysiek spel gebruiken tafels een **Multi-Axis D6 Pool**.
- Rol standaard zeszijdige dobbelstenen: Groen (Success/Failure), Blauw (Advantage/Threat) en Rood (Triumph/Despair).
- **Parity:** In plaats van complexe wiskunde bepalen modifiers *hoeveel* van elke dobbelsteen je rolt. Als een speler fysiek rolt, tikt de GM simpelweg op de "Manual Override" knop in de Web-App/AR-App en voert de uiteindelijke resultaat tags in (bijv. `+2 Advantage`) om de digitale status te synchroniseren.
- **V2.1 Rule Sync:** Auto-Successes door AP uitgaven zijn niet toegestaan. AP koopt uitsluitend extra Groene/Blauwe dobbelstenen. Threat waarschijnlijkheden (Rode dobbelstenen) worden afgezwakt, zodat een enkele gemengde roll niet resulteert in catastrofale mechanische wipes.

## 2. Action Economy & Combat Analytics
**Digital:** De Jetpack Compose UI / Angular Web App trackt 3-Action Points (AP) en bestraft automatisch de Acoustic SNR (Signal-to-Noise Ratio).
**Analog Synchronization:**
- **Action Tokens:** Spelers gebruiken drie fysieke tokens (pokerchips of munten). Geef ze uit om Actions uit te voeren.
- **AP Recovery (V2.1 Fix):** Spelers kunnen een "Catch a Breath" declareren of een Narrative Flaw accepteren, zodat de GM hen halverwege de session fysiek een AP token kan teruggeven, om token starvation in de late-game te voorkomen.
- **De SNR Track:** De GM gebruikt een fysieke papieren tracker of draaischijf (uit de printbare assets) om de Acoustic SNR van de party te tracken.
- **Parity:** Wanneer de party fysiek lawaai maakt (hard rollen, tokens laten vallen), kan de GM optioneel de fysieke SNR schijf verzetten. Om te synchroniseren tikt de GM op de `+ HEAT` knop op hun digitale dashboard.

## 3. Asymmetric State Syncing (The Netrunner & The Solo)
**Digital:** De server berekent 200ms lock-windows, zodat een AR hack perfect samenvalt met het fysiek openen van een deur.
**Analog Synchronization:**
- **De Split-Timer:** Wanneer de fysieke tafel Combat initieert, zet de GM een fysieke kookwekker of zandloper (bijv. 2 minuten real-time) voor de Netrunner om hun fysieke hacking puzzel (bijv. een mastermind-achtig steekbord of een kaarten-matching spel) te voltooien.
- **Synchronized Breach (V2.1 Fix):** Als de party fysieke Actions opsplitst, kunnen ze een "Group Action" initiëren. De spelers gooien hun D6s fysiek in een enkele gezamenlijke schaal en middelen de Successes uit, om te voorkomen dat een slechte roll van één speler de hele split-operatie doet falen.
- **Parity:** Als de Netrunner de puzzel voltooit voordat de timer afloopt, pusht de GM de `UNLOCK_DOOR` status naar de VTT, waardoor de nieuwe kamer onmiddellijk onthuld wordt voor de digitale spelers.

## 4. Psychological Mechanics & The Diegetic Economy
**Digital:** De AR App trilt, tekst versleutelt zich onder Allostatic Stress, en spelers gebruiken NFC tags om Gear uit te rusten.
**Analog Synchronization:**
- **Fysieke Stress Cards:** Wanneer spelers stress oplopen, overhandigt de GM hen verdekt "Bleed Cards". Onder de V2.1 Ruleset mogen deze kaarten geen harde lockouts bevatten (zoals overgeslagen beurten). In plaats daarvan bieden ze beheersbare mechanische trade-offs (bijv. "-1 op Agility checks") of tegenstrijdige info/secret objectives.
- **Fysieke Gear:** Printbare Item Cards.
- **Parity:** Om een fysiek Item te synchroniseren, scannen spelers de QR-code die op de achterkant van de Item Card is afgedrukt, met de AR Companion App. Het Item wordt onmiddellijk uit de Chaos Market verwijderd en aan hun digitale Inventory toegevoegd.

## 5. E2EE Backchannels (The Dark Net)
**Digital:** End-to-end versleutelde chat via de Android app met behulp van lokale Curve25519 keys.
**Analog Synchronization:**
- **Burner Notes:** Spelers schrijven fysieke briefjes naar elkaar.
- **De Intercept:** Een speler met een fysieke "Air-Gap Hack" Ability Card kan eisen het briefje te lezen voordat het de ontvanger bereikt.
- **Parity:** Spelers kunnen na de session de inhoud van hun fysieke briefjes invoeren in de chat logger van de AR App, om ervoor te zorgen dat de narratieve LLM backend hun plannen opneemt in de procedurele generatie van de volgende session.

## 6. Progress Clocks & Flashbacks
**Digital:** Gesynchroniseerde SVGs updaten over alle apparaten.
**Analog Synchronization:**
- **Paper Clocks:** Teken cirkels op indexkaarten, verdeeld in 4, 6 of 8 segmenten. Vul ze in met een marker.
- **Sequentieel Vullen (V2.1 Fix):** De GM moet Paper Clocks sequentieel inkleuren (1 segment per Threat die op een Rode dobbelsteen wordt gegenereerd). Een enkele gemengde Success roll kan een Clock niet meer in één keer tot het maximum vullen.
- **Parity:** De digitale interface van de GM stelt hen in staat om Clocks handmatig te ticken. Het ticken van een digitale Clock laat de VTT-schermen oplichten; de GM kleurt dan fysiek de analoge Clock op de tafel in.

## 7. Multiple Levels & Outdoor Environments
**Digital:** De GM interface maakt het mogelijk om onmiddellijk te schakelen tussen Z-levels (Level 1, Level 2, enz.) en outdoor terrein (straten, gras, water) te renderen. De Grid Store mapt coördinaten via een `X,Y,Z` signatuur.
**Analog Synchronization:**
- **Layered Blueprints:** De GM moet meerdere fysieke pagina's of transparante overlay-vellen (acetaat) gebruiken om de verschillende verdiepingen van een gebouw weer te geven.
- **Parity:** Wanneer de party een fysiek trappenhuis bestijgt, drukt de GM simpelweg op de `[LEVEL 2]` toggle in de digitale app om de AR view naar de nieuwe Z-as te laten springen, wat perfect overeenkomt met de fysieke map pagina die op tafel wordt omgeslagen.

---
*Alle analoge rulebooks en digitale codebases worden in parity gehouden. Elke digitale Action heeft een fysiek analoog, en elke fysieke roll kan door de digitale engine worden verwerkt.*
