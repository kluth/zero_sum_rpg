import os

en_patch = """
## V2.10 Biometrics & Escalation Patch

### 15. The Deep Cover
* **The Issue:** Maintaining a false identity only required a single roll.
* **The Fix:** When a character assumes a complex false identity, they must make a *Subterfuge* check whenever questioned by an NPC from that specific background. Failing the check does not immediately blow their cover, but generates extreme suspicion (+2 Social Heat).

### 16. Biometric Lockout
* **The Issue:** Failing a biometric hack (fingerprint, iris) had no lasting consequences on the data.
* **The Fix:** Failing to hack, copy, or spoof biometric data immediately causes the target system to flag those biometric markers as "compromised." The stolen biometric data is worthless unless the players hack the backend database to reset the flag.

### 17. Close-Quarters Restraint
* **The Issue:** Drawing a lethal weapon in stealth environments didn't escalate the situation until fired.
* **The Fix:** Drawing a lethal weapon (knife, firearm) in a "Social Stealth" environment immediately raises the Heat Level to 8 (Kill Order Authorized), even if nobody is hurt. Players must weigh the risks of fighting unarmed vs. total escalation.
"""

de_patch = """
## V2.10 Biometrie & Eskalations-Patch

### 15. Die Tiefe Tarnung (Deep Cover)
* **Das Problem:** Eine falsche Identität aufrechtzuerhalten erforderte nur einen einzigen Wurf.
* **Die Lösung:** Wenn ein Charakter eine komplexe falsche Identität annimmt, muss er einen *Subterfuge*-Wurf ablegen, sobald er von einem NSC aus exakt diesem Fachbereich oder dieser Region befragt wird. Ein Fehlschlag bedeutet nicht sofortige Auffliegung, generiert aber extremen Verdacht (+2 Social Heat).

### 16. Biometrischer Lockdown
* **Das Problem:** Das Scheitern beim Kopieren biometrischer Daten hatte keine Auswirkungen auf die Daten selbst.
* **Die Lösung:** Ein Fehlschlag beim Hacken, Kopieren oder Fälschen von biometrischen Daten führt dazu, dass das Zielsystem die betroffenen Marker sofort als "kompromittiert" flaggt. Der gestohlene Fingerabdruck ist wertlos, es sei denn, man hackt das Backend und setzt den Flag zurück.

### 17. Nahkampf-Eskalation (Close-Quarters Restraint)
* **Das Problem:** Das Ziehen einer Waffe in einer Stealth-Umgebung eskalierte die Situation erst, wenn geschossen wurde.
* **Die Lösung:** Das Ziehen einer tödlichen Waffe (Messer, Pistole) in einer "Social Stealth"-Umgebung hebt das Heat-Level sofort auf 8 (Schießbefehl) an, selbst wenn niemand verletzt wurde. Spieler müssen abwägen, ob sie unbewaffnet kämpfen oder die absolute Eskalation in Kauf nehmen.
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
