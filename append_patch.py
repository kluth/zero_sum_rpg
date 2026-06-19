import sys

def append_to_file(filepath, content):
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: append_patch.py <en_file> <de_file> <patch_version>")
        sys.exit(1)
        
    en_file = sys.argv[1]
    de_file = sys.argv[2]
    patch_version = sys.argv[3]
    
    if patch_version == "V2.4":
        en_content = """

## Patch V2.4: Infiltration Mechanics
### 1. Burned Identity (The Disguise Penalty)
* **The Issue:** Disguises are treated as static armor.
* **The Fix:** **Burned Identity.** Whenever a character fails a social or stealth check while disguised, the disguise is permanently "burned". If they are seen in that disguise again within the same region, Heat Level instantly increases by +2.

### 2. Adrenaline Crash
* **The Issue:** Players can sprint endlessly during infiltrations.
* **The Fix:** **Adrenaline Crash.** After any sustained physical exertion (running from guards, hand-to-hand combat), a character must pass a DC 2 Endurance check. On a failure, their physical attributes are reduced by -1 for the next 10 minutes due to exhaustion.
"""
        de_content = """

## Patch V2.4: Infiltrationsmechaniken
### 1. Verbrannte Identität (Der Verkleidungs-Malus)
* **Das Problem:** Verkleidungen werden als statische Rüstung behandelt.
* **Die Lösung:** **Verbrannte Identität.** Wann immer ein Charakter eine soziale oder Heimlichkeits-Probe in Verkleidung nicht besteht, ist die Verkleidung permanent "verbrannt". Wenn sie in dieser Verkleidung in derselben Region erneut gesehen werden, steigt das Heat-Level sofort um +2.

### 2. Adrenalin-Absturz
* **Das Problem:** Spieler können während Infiltrationen endlos sprinten.
* **Die Lösung:** **Adrenalin-Absturz.** Nach jeder anhaltenden körperlichen Anstrengung (Flucht vor Wachen, Nahkampf) muss ein Charakter eine DC 2 Ausdauer-Probe bestehen. Bei einem Fehlschlag werden seine körperlichen Attribute für die nächsten 10 Minuten wegen Erschöpfung um -1 reduziert.
"""
    elif patch_version == "V2.5":
        en_content = """

## Patch V2.5: Social Blackmail Mechanics
### 1. Collateral Damage (The Extortion Cost)
* **The Issue:** Blackmailing NPCs has no long-term repercussions if successful.
* **The Fix:** **Collateral Damage.** Successfully blackmailing an NPC adds +1 to the "Collateral" counter. For every 3 points of Collateral, a random Tie (connection) belonging to any party member is permanently severed as the criminal underworld retaliates against their associates.

### 2. Digital Breadcrumbs
* **The Issue:** Hacking and planting evidence is untraceable.
* **The Fix:** **Digital Breadcrumbs.** Every time a character plants digital evidence, they roll a 1D10. On a 1 or 2, they leave a traceable digital footprint. This footprint doesn't trigger immediately, but gives the GM a free "Ambush" token to use later in the campaign.
"""
        de_content = """

## Patch V2.5: Soziale Erpressungsmechaniken
### 1. Kollateralschaden (Die Erpressungskosten)
* **Das Problem:** Das Erpressen von NPCs hat bei Erfolg keine langfristigen Auswirkungen.
* **Die Lösung:** **Kollateralschaden.** Das erfolgreiche Erpressen eines NPCs erhöht den "Kollateral"-Zähler um +1. Für jeweils 3 Punkte Kollateralschaden wird eine zufällige Verbindung (Tie) eines Gruppenmitglieds permanent gekappt, da die kriminelle Unterwelt sich an ihren Verbündeten rächt.

### 2. Digitale Brotkrumen
* **Das Problem:** Hacken und das Platzieren von Beweisen sind nicht zurückzuverfolgen.
* **Die Lösung:** **Digitale Brotkrumen.** Jedes Mal, wenn ein Charakter digitale Beweise platziert, wirft er einen W10. Bei einer 1 oder 2 hinterlässt er einen nachverfolgbaren digitalen Fußabdruck. Dieser Fußabdruck wird nicht sofort ausgelöst, gibt dem GM jedoch einen kostenlosen "Hinterhalt"-Token, der später in der Kampagne verwendet werden kann.
"""
    elif patch_version == "V2.6":
        en_content = """

## Patch V2.6: Wilderness Survival Mechanics
### 1. Elements of Despair (Environmental Load)
* **The Issue:** Environmental hazards only cause physical damage.
* **The Fix:** **Environmental Load.** For every 12 hours spent in hostile wilderness without proper shelter, characters automatically take +1 Cognitive Load. The sheer hopelessness of the elements erodes their sanity as much as their bodies.

### 2. Scavenger's Dilemma
* **The Issue:** Foraging for food is a simple pass/fail.
* **The Fix:** **Scavenger's Dilemma.** When foraging, a success yields food but with a risk. The player must choose: either consume the food and roll a DC 2 Resilience check to avoid food poisoning (temporarily lowering attributes), or discard it and take a level of Starvation (permanent -1 D10 to physical tasks until a proper meal is consumed).
"""
        de_content = """

## Patch V2.6: Überlebensmechaniken in der Wildnis
### 1. Elemente der Verzweiflung (Umweltbelastung)
* **Das Problem:** Umweltgefahren verursachen nur physischen Schaden.
* **Die Lösung:** **Umweltbelastung.** Für alle 12 Stunden in einer feindlichen Umgebung ohne angemessenen Unterschlupf erhalten Charaktere automatisch +1 Kognitive Belastung. Die schiere Hoffnungslosigkeit der Elemente zermürbt ihren Verstand ebenso wie ihre Körper.

### 2. Dilemma des Plünderers
* **Das Problem:** Die Nahrungssuche ist ein einfaches Erfolg/Fehlschlag-System.
* **Die Lösung:** **Dilemma des Plünderers.** Bei der Nahrungssuche bringt ein Erfolg Nahrung, birgt aber ein Risiko. Der Spieler muss wählen: Entweder er isst die Nahrung und wirft eine DC 2 Widerstands-Probe, um eine Lebensmittelvergiftung zu vermeiden (was die Attribute temporär senkt), oder er wirft sie weg und erhält eine Stufe des Verhungerns (permanent -1 W10 auf physische Aufgaben, bis eine richtige Mahlzeit eingenommen wird).
"""
    else:
        print("Unknown patch version")
        sys.exit(1)
        
    append_to_file(en_file, en_content)
    append_to_file(de_file, de_content)
    print(f"Appended {patch_version} to {en_file} and {de_file}")
