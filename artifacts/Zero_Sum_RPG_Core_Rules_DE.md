# Zero-Sum RPG: Core Rulebook (Deutsch)

![Cover Art](images/zero_sum_cover.jpg)

> *Die Grenze zwischen physischem Spieltisch und digitalem Backend verschwimmt. Dieses Dokument ist die architektonische Roadmap für die Zero-Sum RPG Engine und ihre Augmented Reality (AR) Companion-App.*

## 1. Worum es geht

**Zero Sum RPG** ist eine mathematisch rigorose, hochgradig asymmetrische und psychologisch intensive Next-Generation Tabletop Roleplaying Game Engine, angesiedelt in einem Cyberpunk-Infiltrationsuniversum. Es dient als hybrides Bindeglied zwischen physischen Spielern, dem Game Master (GM) und Twitch Spectators.

Im Gegensatz zu traditionellen Companion Apps, die lediglich Würfelwürfe tracken, fungiert Zero Sum RPG als eine **Cyber-Warfare Engine**. Es berechnet reale akustische Physik für Stealth, trackt psychologisches Trauma über Allostatic Load Modelle und erzwingt brutale "Zero-Sum" ökonomische Transfers.

![Tactical Grid](images/combat_grid.jpg)

## 2. Core Mechanics & Resolution

**Bounded Accuracy & API-Friendly JSON**
Das System verzichtet auf volatile 0–100-Prozentskalen zugunsten flacher, streng begrenzter Integer (Werte von 1–20). Modifikatoren (+1 bis +3) bleiben dadurch extrem wirkungsvoll.

**Die Multi-Axis Resolution Engine**
Die Engine nutzt einen multidimensionalen Dice Pool:

| Würfel-Typ | Fokus | Bedeutung |
| :--- | :--- | :--- |
| **Green** | Core | Success / Failure |
| **Blue** | Modifier | Advantage / Threat |
| **Red** | Danger | Triumph / Despair |

**Digital:** Der Server berechnet 200ms Lock-Windows und löst komplexe Matrizen sofort auf (z. B. "Failed mit 3 Advantages").  
**Analog Synchronization:** Am physischen Spieltisch nutzen Spieler einen **Multi-Axis D6 Pool**. Anstelle von komplexer Mathematik bestimmen Modifikatoren, *wie viele* von jedem Würfel gerollt werden. Der GM synchronisiert dies durch Eintippen der finalen Tags (z.B. `+2 Advantage`) in das digitale Override-Dashboard.

## 3. Action Economy & Combat Analytics

Basierend auf umfassenden Monte-Carlo-Simulationen nutzt die Combat-Engine ein striktes **3-Action Point (AP)** System pro Turn. Spieler müssen ihre AP taktisch zwischen Combat, Hacking und Stress-Management ausbalancieren.

**Acoustic SNR (Signal-to-Noise Ratio)**
"Attack Spam" erzeugt kumulative Lärm-Strafen, die massive Schwärme alarmieren.

**AP Recovery & Standardization**
Spieler können nicht länger AP verbrennen, um Würfe vollständig zu umgehen (*Auto-Success ist deaktiviert*). AP fügen dem Dice Pool lediglich zusätzliche Modifier Dice hinzu. Um AP-Mangel im Late-Game abzufedern, existieren zwei Mechaniken:
*   **Catch a Breath:** Eine Aktion nutzen, um 1 AP zurückzugewinnen.
*   **Narrative Flaw:** Eine story-basierte Komplikation akzeptieren, um einen sofortigen AP-Refund zu erhalten.

**Analog Synchronization:** Spieler verwenden physische AP-Tokens (Pokerchips). Der SNR Track wird durch eine physische Drehscheibe auf dem Tisch dargestellt.

![Neural Deck Hardware](images/neural_deck.jpg)

## 4. Asymmetric State Syncing

**Das Split-Party-Problem gelöst**
Wenn der Netrunner via AR-App eine Datenfestung infiltriert, während der Solo physisch auf dem VTT kämpft, erzwingt das Backend eine einheitliche **Simultaneous Resolution Queue**.

*   **Synchronized Breach (Group Action Mechanic):** Um analoges Syncing zu erleichtern, können Spieler einen gemeinsamen *Breach* initiieren. Sie werfen ihre Dice physisch zusammen und bilden den Durchschnitt der Successes, oder geben AP aus, um via "Assist" zu helfen.
*   **Time-Locking:** Die erfolgreiche ICE-Entschlüsselung des Netrunners korreliert dadurch auf die Millisekunde genau mit dem Entriegeln der physischen Tür auf dem VTT.

## 5. Psychological Mechanics & Stress

Die AR Companion-App existiert nicht nur als Meta-Tool, sondern *In-Universe* als Neural Deck. Sie fungiert als Kanal für "Bleed".

*   **Hidden Notifications:** Der GM kann via Firebase gezielt Push-Benachrichtigungen an einzelne Spieler senden, um sie mit Halluzinationen oder falschen Infos zu manipulieren.
*   **Bleed Cards:** Physische Stress-Karten verursachen keine Hard-Lockouts (z.B. Turn-Skips) mehr. Sie erzwingen narrative Trade-Offs (z.B. *-1 auf Agility, es sei denn, man agiert rücksichtslos*).
*   **Allostatic Stress Glitching:** Steigt der *Allostatic Load*, degradiert die Jetpack Compose UI physisch: Text verschlüsselt sich, Shader lassen das Bild zerreißen und der haptische Motor des Smartphones imitiert einen rasenden Herzschlag.

## 6. The Dark Net & Leverage

**Leverage Currency:** Spieler gewinnen *Leverage*, indem sie Verbündete schützen. Leverage kann ausgegeben werden, um Ressourcen zu stehlen oder den Emergency Heal eines Teammitglieds zu überschreiben.

**The Dark Net:** Die App bietet ein sicheres E2EE-Chat-Protokoll fürs Plotten unter den Spielern.
**Analog Synchronization:** Spieler können klassische "Burner Notes" (physische Notizzettel) nutzen. Ein Spieler mit einem "Air-Gap Hack" kann verlangen, den Zettel abzufangen und zu lesen, bevor er den Empfänger erreicht.

## 7. Progress Clocks & Pacing

**Synchronized Clocks:** Das VTT und die AR-App rendern nativ synchronisierte "Progress Clocks".
**Analog Synchronization:** Der GM nutzt Papier-Clocks auf dem Tisch. Clocks müssen **sequenziell gefüllt** werden (1 Segment pro generiertem Threat auf roten Würfeln). Ein einzelner gemischter Success führt nicht mehr sofort zum maximalen Doom.

---
*Status: Rulebook Version 2.1 | Autor: Zero-Sum Agent Network*
