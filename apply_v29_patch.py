import os

en_patch = """
## V2.9 Environment & Overheat Polish Patch

### 12. Environmental Load (The Slow Bleed)
* **The Issue:** Severe weather conditions had no mechanical weight.
* **The Fix:** Extreme environmental conditions (freezing cold, severe heat, toxic fumes) passively drain character resolve. Characters must roll *Endurance* every 30 in-game minutes. A failure results in +1 Cognitive Load. If maxed out, they succumb to the elements.

### 13. Zero-Trust Data
* **The Issue:** Hacked loot was immediately accessible.
* **The Fix:** Acquiring data on-site only provides an encrypted payload. Players must dedicate Downtime to decrypting the data. Failing the decryption check triggers a logic bomb that permanently destroys the intel or traces the hack back to their safehouse.

### 14. Weapon Overheating (Suppression Nerf)
* **The Issue:** Suppression fire could be spammed without consequence.
* **The Fix:** If a player uses Suppression Fire in two consecutive combat rounds with the same weapon, they must roll a D10. On a 1, 2, or 3, the weapon jams. Clearing a jam requires an entire action, leaving the player exposed.
"""

de_patch = """
## V2.9 Umwelt & Überhitzungs-Patch

### 12. Die langsame Blutung (Environmental Load)
* **Das Problem:** Extreme Wetterbedingungen hatten kein mechanisches Gewicht.
* **Die Lösung:** Extreme Umweltbedingungen (Kälte, Hitze, giftige Gase) zehren passiv an der Psyche der Charaktere. Sie müssen alle 30 In-Game-Minuten auf *Endurance* würfeln. Ein Fehlschlag generiert +1 Cognitive Load. 

### 13. Zero-Trust Daten
* **Das Problem:** Gehackte Daten waren sofort zugänglich.
* **Die Lösung:** Das Erbeuten von digitalen Daten vor Ort liefert nur eine verschlüsselte Datei. Spieler müssen ihre Downtime-Phase opfern, um die Daten zu entschlüsseln. Ein Fehlschlag löst eine Logic-Bomb aus, die die Daten zerstört oder die IP zum Safehouse zurückverfolgt.

### 14. Waffen-Überhitzung (Suppression Nerf)
* **Das Problem:** Sperrfeuer konnte ohne Konsequenzen durchgehend genutzt werden.
* **Die Lösung:** Wenn ein Spieler Sperrfeuer in zwei aufeinanderfolgenden Kampfrunden mit derselben Waffe einsetzt, muss er einen W10 würfeln. Bei einer 1, 2 oder 3 erleidet die Waffe eine Ladehemmung. Das Beheben kostet eine komplette Aktion.
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
