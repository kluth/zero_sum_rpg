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
