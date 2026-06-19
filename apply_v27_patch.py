import os

en_patch = """
## V2.7 Kinetic & Civilian Polish Patch

### 8. Kinetic Instability
* **The Issue:** Fighting in high-speed environments (like moving trains or cars) lacked mechanical friction.
* **The Fix:** Whenever combat occurs in an unstable moving environment, the DC for all physical and technical checks is automatically increased by +1.

### 9. Civilian Collateral
* **The Issue:** Players use heavy weapons in crowded areas without narrative consequence.
* **The Fix:** **Dead Man's Zone.** If a player uses explosives or suppression fire in a crowded civilian area, they must pass a Detachment check. If they fail, they hit a civilian, resulting in an automatic +2 Cognitive Load and an immediate jump in the Heat Level to 7 (Hunted).
"""

de_patch = """
## V2.7 Kinetik & Zivilisten Patch

### 8. Kinetische Instabilität
* **Das Problem:** Kämpfe in schnellen Umgebungen (wie fahrenden Zügen oder Autos) hatten zu wenig mechanische Reibung.
* **Die Lösung:** Wann immer Kämpfe in einer instabilen, sich bewegenden Umgebung stattfinden, wird die DC für alle physischen und technischen Würfe automatisch um +1 erhöht.

### 9. Ziviler Kollateralschaden
* **Das Problem:** Spieler nutzen schwere Waffen in Menschenmengen ohne Konsequenzen.
* **Die Lösung:** **Dead Man's Zone.** Wenn ein Spieler Sprengstoff oder Sperrfeuer in einem dicht gedrängten zivilen Gebiet einsetzt, muss er einen Detachment-Wurf ablegen. Bei einem Fehlschlag trifft er einen Zivilisten, was zu automatischen +2 Cognitive Load und einem sofortigen Anstieg des Heat-Levels auf 7 (Gejagt) führt.
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
