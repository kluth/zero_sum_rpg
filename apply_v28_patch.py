import os

en_patch = """
## V2.8 Social & Betrayal Polish Patch

### 10. Social Heat
* **The Issue:** Failing a social or stealth roll immediately triggered armed combat, which felt unrealistic in civilian environments like casinos or galas.
* **The Fix:** **Social Heat Track.** In non-hostile environments, failed rolls do not trigger combat. Instead, they generate 1 Social Heat. At 3 Social Heat, security is called. At 5 Social Heat, the facility goes into lockdown and armed response is authorized.

### 11. The Burner Tie
* **The Issue:** Players wanted a way to escape impossible situations using their contacts.
* **The Fix:** A player may intentionally burn an active Tie (Contact) to take the fall for a crime or failure. The player escapes immediate consequences, but the Tie is permanently destroyed (arrested/killed), and the player suffers an immediate +3 Cognitive Load from the guilt.
"""

de_patch = """
## V2.8 Social & Verrat Patch

### 10. Social Heat
* **Das Problem:** Ein verpatzter Wurf bei Infiltrationen oder sozialen Interaktionen führte sofort zu Waffengewalt, was in Zivilumgebungen (Casinos, Galas) unrealistisch ist.
* **Die Lösung:** **Social Heat Track.** In nicht-feindlichen Umgebungen lösen verpatzte Würfe keinen Kampf aus, sondern generieren 1 Social Heat. Bei 3 Social Heat wird der Sicherheitsdienst gerufen. Bei 5 Social Heat geht das Gebäude in den Lockdown und Waffengewalt wird autorisiert.

### 11. Das Opferlamm (Burner Tie)
* **Das Problem:** Spieler brauchten eine Möglichkeit, unmöglich scheinenden Situationen durch ihre Kontakte zu entkommen.
* **Die Lösung:** Ein Spieler kann absichtlich einen aktiven Kontakt (Tie) "verbrennen", damit dieser die Schuld für ein Verbrechen oder einen Fehlschlag auf sich nimmt. Der Spieler entkommt den Konsequenzen, aber der Kontakt wird permanent vernichtet (verhaftet/getötet) und der Spieler erleidet durch die Schuldgefühle sofort +3 Cognitive Load.
"""

files = {
    'docs/en/Zero_Sum_Core_Rulebook.md': en_patch,
    'docs/de/Zero_Sum_Core_Rulebook.md': de_patch
}

for path, patch in files.items():
    if os.path.exists(path):
        with open(path, 'a') as f:
            f.write("\n" + patch + "\n")
        print(f"Patched {path}")
