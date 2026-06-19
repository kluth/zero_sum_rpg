import os

en_patch = """
## V2.2 Simulation Polish Patch

Based on a full 7-agent AI simulation run, the following mechanics have been added to streamline gameplay and reduce frustration for specialized characters.

### 1. "Fail Forward" for Experts
* **The Issue:** A min-maxed character rolling a critical failure on a mundane task (like breaking a door) looked incompetent and frustrated players.
* **The Fix:** **Success at a Cost.** If a character has a Skill level of 3 or higher, a failed roll does not mean they failed the action. They succeed, but the GM escalates the environment (e.g., the door breaks, but triggers a massive alarm and increases the Heat Level). The character gets what they want, but pays a narrative price.

### 2. Preparedness / Flashback Inventory
* **The Issue:** Players begging the GM for minor items they forgot to write on their sheet (e.g., a lighter, a piece of wire).
* **The Fix:** **Gear Points.** Players do not need to list mundane items. Each player has 3 Gear Points per session. They can spend 1 Gear Point to declare, "I have exactly what we need for this," provided the item makes logical sense for their character to carry.

### 3. Formalized Morale System
* **The Issue:** Firefights against PMCs dragged on until every enemy reached 0 HP, which is unrealistic.
* **The Fix:** **Morale Break.** If an enemy squad suffers 50% casualties, or their commanding officer is neutralized, the remaining enemies must pass a Detachment check. If they fail, they will fall back, surrender, or flee.

### 4. Overwatch & Suppression Fire
* **The Issue:** Snipers and heavy gunners lacked a way to control the battlefield without rolling for direct damage.
* **The Fix:** **Suppression Fire.** A character can use their action to lock down a zone (e.g., a hallway or courtyard). Any enemy moving through or attacking from that zone must automatically make a Detachment check; failure means they lose their turn pinned down in cover.
"""

de_patch = """
## V2.2 Simulation Polish Patch

Basierend auf einer vollständigen 7-Agenten-KI-Simulation wurden die folgenden Mechaniken hinzugefügt, um den Spielfluss zu optimieren und Frustration bei spezialisierten Charakteren zu reduzieren.

### 1. "Fail Forward" für Experten
* **Das Problem:** Ein hochspezialisierter Charakter, der bei einer banalen Aufgabe (wie dem Eintreten einer Tür) patzt, wirkte inkompetent und frustrierte die Spieler.
* **Die Lösung:** **Erfolg mit Konsequenzen (Success at a Cost).** Wenn ein Charakter ein Skill-Level von 3 oder höher hat, bedeutet ein Fehlschlag nicht, dass die Aktion scheitert. Die Aktion gelingt, aber der GM eskaliert die Umgebung (z.B. die Tür bricht auf, löst aber einen lauten Alarm aus und erhöht das Heat-Level). Der Charakter bekommt, was er will, zahlt aber einen narrativen Preis.

### 2. Preparedness / Flashback-Inventar
* **Das Problem:** Spieler betteln den GM um kleine Gegenstände an, die sie vergessen haben aufzuschreiben (z.B. ein Feuerzeug, ein Stück Draht).
* **Die Lösung:** **Gear Points.** Spieler müssen keine banalen Gegenstände mehr auflisten. Jeder Spieler hat 3 Gear Points pro Session. Sie können 1 Gear Point ausgeben, um zu deklarieren: "Ich habe genau das, was wir dafür brauchen", vorausgesetzt, es ist logisch, dass der Charakter so etwas bei sich trägt.

### 3. Formalisiertes Moral-System
* **Das Problem:** Feuergefechte gegen Söldner zogen sich hin, bis jeder Feind auf 0 HP war, was extrem unrealistisch ist.
* **Die Lösung:** **Moral-Bruch.** Wenn ein gegnerischer Trupp 50% Verluste erleidet oder ihr Kommandant neutralisiert wird, müssen die verbleibenden Feinde einen Detachment-Wurf ablegen. Versagen sie, ziehen sie sich zurück, ergeben sich oder fliehen.

### 4. Overwatch & Unterdrückungsfeuer
* **Das Problem:** Scharfschützen und schwere Schützen hatten keine Möglichkeit, das Schlachtfeld zu kontrollieren, ohne direkten Schaden zu würfeln.
* **Die Lösung:** **Sperrfeuer (Suppression Fire).** Ein Charakter kann seine Aktion nutzen, um eine Zone (z. B. einen Flur oder Innenhof) abzuriegeln. Jeder Feind, der sich durch diese Zone bewegt oder von dort aus angreift, muss automatisch einen Detachment-Wurf ablegen; bei einem Fehlschlag verliert er seine Runde festgenagelt in der Deckung.
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
