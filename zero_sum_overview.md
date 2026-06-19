# Zero Sum RPG: Current State Overview

**"Zero Sum"** is a bleak, near-future tabletop roleplaying game blending hyper-capitalist dystopia with psychological paranormal horror. It is designed around the concept that survival is a transaction, and every victory comes at a devastating cost. 

Below is the complete abstract of the game's current state, its rules, lore, and the full suite of generated assets.

---

## 1. Core Concept & Setting
The game takes place in a world reeling from **The Paradigm Shift (2022-2026)**, a catastrophic era where the global economy collapsed, and reality itself fractured. Mega-corporations have transcended nations, establishing a totalitarian neo-feudalism. At the same time, the collective psychological burn of humanity has manifested as literal, paranormal phenomena. The world is bathed in moral gray areas, brutal economic survival, and sanity-shredding horrors. 

## 2. Game Mechanics
- **The Fracture System (D10 Dice Pool):** A percentile-based resolution system where rolling lower is better. Pushing a roll increases the risk of a "Fracture" (a critical failure that permanently alters the character's psyche or reality).
- **Zero Sum Combat:** Violence is inherently destructive. Even when a character wins a physical confrontation, they suffer inevitable resource depletion, physical injury, or psychological psychological burn. There are no clean victories.
- **Psychological Burn & Sanity Tracking:** Characters accrue "Psychological Burn Points" instead of losing hit points. When Psychological Burn maxes out, characters develop permanent psychological scars or terrifying paranormal afflictions.
- **Hyper-Capitalist Logistics:** Ammo, food, and medicine are scarcer than human life. Inventory management and economic bartering are central to survival. 

## 3. World Lore & Factions
- **Global Horror Lore:** The paranormal elements are psychological in nature. Horrors are manifested from corporate greed, societal despair, and existential dread (e.g., "The Corporate Auditors").
- **The Factions:**
  - **The Board:** The ultimate, faceless corporate oligarchy that controls the remnants of civilization.
  - **The Null-State Insurgents:** Radical anarchists attempting to break the system through violent, unpredictable means.
  - **Black Market Cartels (The Syndicate):** Opportunists who control the flow of illicit goods, illegal surveillance tech, and forbidden information.
  - **The Corporate Auditors:** Paranormal entities drawn to intense human misery and debt.

## 4. Key NPCs & Locations
- **Locations:** The neon-drenched corporate monoliths of **The Omni-Stat Global Headquarters**, the decaying **Sub-City Havens**, hidden **Black Sites** used for horrific experiments, and the irradiated **Wastes** outside the city zones.
- **Major NPCs:** 
  - **The Architect** (Corporate defector)
  - **The Siloviki** (Syndicate boss)
  - **The Fixer** (Mercenary commander)
  - **The Broker** & **The Archivist**
  *Artistic Note:* All human characters are visually represented not as distinct individuals, but as featureless shadows and surreal "Fratzen" (distorted faces), reflecting the loss of humanity and identity within the system.

---

## 5. Completed Assets & Documentation
The entire universe has been documented, illustrated, and packaged into a private GitHub repository (`kluth/zero_sum_rpg`).

### A. The Document Suite
All rulebooks and lore bibles have been written in Markdown and professionally converted into LaTeX-styled **PDFs** (with embedded mathematical equations).
- `Zero_Sum_Core_Rulebook.pdf` (The master document)
- `concept.pdf`, `core_mechanics.pdf`, `character_creation.pdf`
- `lore_2022_2026.pdf`, `the_paradigm_shift.pdf`, `global_horror_lore.pdf`, `wars_and_crises.pdf`
- `factions.pdf`, `npcs.pdf`, `real_world_npcs.pdf`
- `locations.pdf`, `items_and_tech.pdf`
- `campaign_hooks.pdf`, `world_rules.pdf`, `expert_critique_proposals.pdf`

### B. The Art Gallery
**20 High-Resolution Art Assets** have been generated. The aesthetic is strictly **hyper-realistic pencil drawings in monochrome, punctuated by striking red highlights.**
- *Included Artworks:* 12 Faction/Location/Item pieces and 8 NPC portraits (rendered as psychological shadows).
- All 20 assets are securely stored as `.jpg` files in the `assets/` directory.
- The artwork has been programmatically injected into the appropriate sections of the Markdown rulebooks (appearing exactly once per relevant topic).

### C. The Official Artbook
- `Zero_Sum_Art_Book.pdf`: A dedicated, compiled gallery featuring all 20 artworks, built from the final "shadow-face" assets.

### D. Infrastructure & Tools
- Python scripts (`md_to_pdf.py`, `create_pdf.py`, `update_assets.py`, `inject_images.py`) used to build the game documents.
- A fully synced, up-to-date **GitHub Repository** acting as the master backup and version control for the entire IP.


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
