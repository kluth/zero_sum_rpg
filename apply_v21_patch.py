import os

patch_text = """

## V2.1 Debriefing Optimization Patch

Based on extensive playtesting and simulated feedback, the following mechanical tweaks have been officially implemented to optimize the *Zero Sum* experience:

### 1. Tactical Cover & Evasion
* **The Issue:** Evasion DCs in combat were punishingly high, rapidly draining ammunition tokens and making survivability too low even for prepared characters.
* **The Fix:** **Tactical Cover Bonus.** If a character spends a narrative action to secure physical cover (e.g., behind concrete, server racks, or an armored vehicle) before an attack, their Evasion DC is automatically reduced by 2. Furthermore, they may spend an Analogue Token to guarantee their cover holds for the duration of the firefight.

### 2. Deep Penetration (Multi-Stage Hacking)
* **The Issue:** Hacking felt too simple and binary, lacking the tension appropriate for our zero-trust setting.
* **The Fix:** Hacking is no longer a single check. Bypassing corporate security or secure servers requires a **Deep Penetration Sequence**. The Hacker must achieve 3 cumulative Successes across multiple turns. However, each failed roll immediately generates +1 Metadata Exhaust, escalating the risk of the system tracing their physical location before they finish the hack.

### 3. Ties & The Narrative Override
* **The Issue:** Players felt that their "Ties" (Contacts) were under-utilized and wanted more narrative ways to escape danger or bypass censorship.
* **The Fix:** **The Narrative Override.** Once per session, a player can permanently "burn" one of their Ties to automatically succeed on any non-combat social, investigative, or evasion check (e.g., smuggling a decrypted drive past a checkpoint). Burning a Tie means that contact is compromised, arrested, or goes permanently off-grid to save the player. 

### 4. Streamlined Debt Ledger
* **The Issue:** Calculating exact monetary equivalents for favors was slowing down the game flow at the table.
* **The Fix:** **The Favor Tier System.** The Debt Ledger no longer requires precise dollar amounts. Favors are now strictly tiered:
  - *Minor Favor* (e.g., passing a security checkpoint, a burner phone): Reduces Exhaust by 1.
  - *Major Favor* (e.g., erased flight records, a weapons cache): Reduces Exhaust by 3.
  - *Soul Bound* (e.g., a corporate hit, full identity scrub): Reduces Exhaust by 5, but the GM gains absolute narrative control over the character's next Downtime phase.

### 5. Instant Cognitive Load
* **The Issue:** The triggers for Cognitive Load calculations were occasionally too ambiguous, leading to table debates.
* **The Fix:** **Instant Triggers.** No calculations needed. A character automatically suffers +1 Cognitive Load if they:
  1. Take any physical damage.
  2. Burn a Tie.
  3. Witness the death of an ally or innocent.
  4. Fill their Metadata Exhaust track.
"""

files_to_update = ['Zero_Sum_Core_Rulebook.md', 'zero_sum_overview.md', 'core_mechanics.md']

for filename in files_to_update:
    if os.path.exists(filename):
        with open(filename, 'a') as f:
            f.write(patch_text)

print("Applied V2.1 Patch to core rulebooks.")
