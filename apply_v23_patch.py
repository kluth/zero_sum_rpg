import os

en_patch = """
## V2.3 Deep Polish Patch

Based on further review of the micro-interactions during the simulation, the following mechanics have been added to deepen the systemic realism and punishing progression.

### 5. Improvised Tools (The "Hairpin Rule")
* **The Issue:** Players attempt technical tasks without the necessary equipment.
* **The Fix:** **Improvised Tools.** A character may attempt a physical or technical task without the proper tools (e.g., picking a lock with a paperclip, suturing a wound with duct tape). Doing so increases the Difficulty Class (DC) by +1. If the roll fails, the character suffers an immediate consequence: the improvised tool breaks and permanently jams the mechanism, or the character suffers 1 Physical Damage/Infection.

### 6. Lethal Teamwork (The Assist Mechanic)
* **The Issue:** Helping another player is too generic and lacks risk.
* **The Fix:** **Shared Consequences.** A player can spend their action to Assist an ally. This grants the acting player an additional +1 D10 to their dice pool. However, the assisting player now shares all consequences of failure. If the action triggers an alarm, attracts gunfire, or increases the Heat Level, both the acting player and the assisting player are equally penalized. Teamwork doubles your chances, but doubles the risk.

### 7. Toxic Progression (Paranoia Leveling)
* **The Issue:** Leveling up has no thematic downside.
* **The Fix:** **Veterancy Tax.** Whenever a player spends Experience Points to max out a Skill (Level 5), their maximum Cognitive Load capacity is permanently reduced by 1. As a character becomes an elite operator, they lose their ability to trust the world and process stress normally. True veterans are deadly, but constantly teetering on the edge of a complete psychological breakdown.
"""

de_patch = """
## V2.3 Deep Polish Patch

Basierend auf einer tieferen Analyse der Mikro-Interaktionen während der Simulation wurden die folgenden Mechaniken hinzugefügt, um den systemischen Realismus und die tödliche Progression zu vertiefen.

### 5. Improvisierte Werkzeuge (Die "Haarnadel-Regel")
* **Das Problem:** Spieler versuchen technische Aufgaben ohne die nötige Ausrüstung.
* **Die Lösung:** **Improvisierte Werkzeuge.** Ein Charakter darf eine physische oder technische Aktion ohne das richtige Werkzeug versuchen (z.B. ein Schloss mit einer Büroklammer knacken, eine Wunde mit Klebeband nähen). Dadurch erhöht sich die Difficulty Class (DC) um +1. Bei einem Fehlschlag erleidet der Charakter eine sofortige Konsequenz: Das improvisierte Werkzeug bricht ab und blockiert den Mechanismus permanent, oder der Charakter erleidet 1 physischen Schaden/eine Infektion.

### 6. Tödliches Teamwork (Die Assist-Mechanik)
* **Das Problem:** Einem anderen Spieler zu helfen ist zu generisch und birgt kein Risiko.
* **Die Lösung:** **Geteilte Konsequenzen.** Ein Spieler kann seine Aktion opfern, um einem Verbündeten zu helfen. Das gibt dem handelnden Spieler einen zusätzlichen +1 W10 in seinem Würfelpool. Der helfende Spieler teilt sich jedoch nun alle Konsequenzen eines Fehlschlags. Löst die Aktion einen Alarm aus, zieht sie feindliches Feuer an oder erhöht sie das Heat-Level, werden sowohl der handelnde als auch der helfende Spieler gleichermaßen bestraft. Teamwork verdoppelt die Chancen, aber auch das Risiko.

### 7. Toxischer Fortschritt (Paranoia-Leveling)
* **Das Problem:** Ein Level-Up hat keine thematischen Nachteile.
* **Die Lösung:** **Veteranen-Steuer.** Jedes Mal, wenn ein Spieler Erfahrungspunkte ausgibt, um einen Skill auf das Maximum (Level 5) zu bringen, wird seine maximale Cognitive Load-Kapazität permanent um 1 reduziert. Wenn ein Charakter zu einem Elite-Operator wird, verliert er seine Fähigkeit, der Welt zu vertrauen und Stress normal zu verarbeiten. Wahre Veteranen sind tödlich, stehen aber ständig kurz vor dem völligen psychologischen Zusammenbruch.
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
