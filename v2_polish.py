import os
import glob
import re

files = glob.glob('/home/matthias/project/zero_sum_rpg/*.md')

replacements = [
    # NPCs
    (r'\bArthur Zuck\b', 'The Architect'),
    (r'\bMarkus Zuckman\b', 'The Architect'),
    (r'\bZuckman\b', 'The Architect'),
    (r'\bZuck\b', 'The Architect'),
    (r'\bViktor Petrov\b', 'The Siloviki'),
    (r'\bPetrov\b', 'The Siloviki'),
    (r'\bChairman Wei\b', 'The Architect'),
    (r'\bWei\b', 'The Architect'),
    (r'\bEl Fantasma\b', 'The Fixer'),
    (r'\bSimon Black\b', 'The Fixer'),
    (r'\bDirector Yossi\b', 'The Contractor'),
    (r'\bYossi\b', 'The Contractor'),
    (r'\bCommander "Vulture" Vance\b', 'The Contractor'),
    (r'\bCommander Vance\b', 'The Contractor'),
    (r'\bElias Vance\b', 'The Architect'),
    (r'\bVance\b', 'The Architect'),
    (r'\bWhistleblower\b', 'The Leaker'),
    (r'\bbank-firth\b', 'Apex-Sovereign', re.IGNORECASE),
    (r'\bbinder\b', 'Omni-Stat Global', re.IGNORECASE),
    (r'\bepworth\b', 'Apex-Sovereign', re.IGNORECASE),
    
    # Corps and Tech
    (r'\bNSO Group\b', 'Krieger-Vanguard Intelligence Division'),
    (r'\bBlack Cube\b', 'Krieger-Vanguard Intelligence Division'),
    (r'\bShotSpotter\b', 'AcousticNet'),
    (r'\bDSM-5\b', 'Corporate Psychological Evaluation Matrix (CPEM)'),
    (r'\bValkyrie Group\b', 'Krieger-Vanguard'),
    (r'\bValkyrie PMC\b', 'Krieger-Vanguard'),
    (r'\bValkyrie\b', 'Krieger-Vanguard'),
    (r'\bAether\b', 'Omni-Stat Global'),
    (r'\bOmni corporation\b', 'Omni-Stat Global'),
    (r'\bOmni\b', 'Omni-Stat Global'),

    # Mechanics & Lore
    (r'\bD100\b', 'D10 Dice Pool'),
    (r'\bThe Spire\b', 'The Omni-Stat Global Headquarters'),
    (r'\bSpire\b', 'Omni-Stat'),
    (r'\bThe Harvesters\b', 'The Corporate Auditors'),
    (r'\bHarvesters\b', 'Corporate Auditors'),
    (r'\bStress\b', 'Cognitive Load'),
    (r'\bTrauma\b', 'Psychological Burn'),
    (r'\bstress\b', 'cognitive load'),
    (r'\btrauma\b', 'psychological burn')
]

core_loop_text = """
## Core Gameplay Loop

At the heart of *Zero Sum* is the D10 Dice Pool system, representing a character's technical proficiency, tactical training, and psychological endurance. To perform an action, players roll a number of D10s equal to their relevant attribute and skill, counting any die that lands on a 6 or higher as a Success. Complex tasks require multiple Successes, and the environment is entirely hostile: combat is lethal, resources are strictly monetized, and every action carries systemic risk. There are no supernatural threats—only the terrifying reality of debt, surveillance, and corporate violence.

The psychological toll of this existence is tracked through **Cognitive Load**, **Desensitization**, and **Psychological Burn**. As players witness atrocities or compromise their morals for survival, their Cognitive Load increases. If unmanaged, this escalating Load hardens into Desensitization, permanently stripping away their humanity and empathy. Reaching critical mass results in Psychological Burn, where the character suffers a complete, debilitating breakdown in the face of the crushing bureaucratic nightmare they are trapped within.

## Metadata Exhaust

Metadata Exhaust complements Cognitive Load perfectly. While Cognitive Load represents *internal* psychological deterioration, Metadata Exhaust represents *external* systemic heat. Every time a player uses a digital tool, engages in combat, or utilizes a Tie, they generate Metadata Exhaust. When a player's Exhaust exceeds their Technical Attribute, the GM automatically gains a "Parallel Construction" token—allowing the GM to suddenly freeze bank accounts, revoke digital access, or deploy a corporate hit squad.

**The Grey-Market Wash (Scrubbing Exhaust):**
To scrub Metadata Exhaust, players must physically interact with the game's Analogue Mechanics during Downtime. A player can hand physical **Analogue Market tokens** (representing untraceable cash or physical favors) to the GM to "pay off" a data scrubber at a 1-to-1 ratio (1 token = 1 Exhaust removed). 

If the player is out of physical tokens, they can still scrub their Exhaust, but they must explicitly write a new, permanent line item in their physical **Debt Ledger** (e.g., "Owe Apex-Sovereign one favor - $50,000 equivalent"). The physical act of writing the debt permanently binds the character to the corporations they are fighting. For every new debt written, they reduce their Metadata Exhaust by 1.
"""

for filepath in files:
    if os.path.basename(filepath) in ['zero_sum_complete.md']:
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    # Apply all replacements
    for p, r, *flags in replacements:
        flag = flags[0] if flags else 0
        content = re.sub(p, r, content, flags=flag)

    # Inject Core Loop and Metadata Exhaust into Core Rulebook if present
    if os.path.basename(filepath) == 'Zero_Sum_Core_Rulebook.md':
        if "## Core Gameplay Loop" not in content:
            content = content + "\n" + core_loop_text

    if os.path.basename(filepath) == 'analogue_mechanics.md':
        if "Metadata Exhaust" not in content:
            content = content + "\n" + "### Metadata Exhaust & The Debt Ledger\n" + "Players must scrub their Metadata Exhaust using the physical Debt Ledger. By physically writing a new debt line item, a player reduces their Metadata Exhaust by 1. Alternatively, they can hand the GM an Analogue Market token to erase 1 Exhaust."

    with open(filepath, 'w') as f:
        f.write(content)

print("Applied V2 Polish to all markdown files.")
