import os
import random

scenarios_data = [
    ("The Synthetic Ransom", "AI voice cloning used for massive extortion operations", "Tech Reviewer", "Server farm in Iceland", "Target is surrounded by a loyal fanbase who believe they are under a state attack."),
    ("The Offshore Coin Implosion", "Collapse of a major unregulated crypto exchange", "Financial Guru", "Penthouse in Dubai", "The ledger is encrypted with a dead-man's switch."),
    ("The Pay-Per-View Flash Mob", "Influencer events causing physical riots and bypassing police", "Viral Prankster", "Mega-Arena in London", "10,000 panicking fans make kinetic action impossible."),
    ("The Locked Harbor", "Ransomware paralyzing global shipping logistics", "Political Streamer", "Automated Port of Rotterdam", "The port's autonomous cranes are programmed to crush intruders."),
    ("The Autonomous Hijack", "Remote exploitation of smart EV fleets", "Lifestyle Vlogger", "Silicon Valley Highway", "The vehicles are moving at 150 km/h; any violence causes a massive pileup."),
    ("The Engagement Blackmail", "Algorithm manipulation to silence whistleblowers", "Financial Guru", "Neo-Berlin Tech Hub", "The target controls the social credit algorithms of the local district."),
    ("The Airspace Denial", "Commercial drones used to shut down major airports", "Tech Reviewer", "Gatwick Airspace", "Security is on maximum alert; drawing a weapon means instant sniper fire."),
    ("The Phantom Click", "Zero-click spyware infecting government officials", "Viral Prankster", "Geneva Freeport", "The facility uses biometric sound-locks. No gunfire allowed."),
    ("The Ego Brawl", "Tech billionaires using private military companies for personal feuds", "Political Streamer", "Private Island in the Pacific", "Two rival PMC factions are already shooting at each other."),
    ("The Algorithmic Run", "AI-driven high-frequency trading crashing regional banks", "Financial Guru", "Frankfurt Financial District", "The servers are submerged in cooling fluid that is highly toxic."),
    ("The Fake Philanthropist", "Influencer charity scams funding proxy wars", "Lifestyle Vlogger", "Charity Gala in Monaco", "High society environment: Heat level jumps to max if cover is blown."),
    ("The Bio-Data Breach", "Fitness apps selling real-time location data to cartels", "Tech Reviewer", "Corporate HQ in Shenzhen", "The building has zero blind spots; only social engineering works."),
    ("The Deepfake Diplomat", "Synthetic video causing diplomatic incidents", "Political Streamer", "Embassy Row, Washington", "Diplomatic immunity makes the target untouchable by law enforcement."),
    ("The Cobalt Pipeline", "Tech supply chains reliant on brutalized mine labor", "Viral Prankster", "Refinery in Eastern Europe", "The area is flooded with lethal PMC guards; stealth is mandatory."),
    ("The Neural Hack", "Experimental brain-computer interfaces causing seizures", "Tech Reviewer", "Underground Clinic in Tokyo", "Patients are highly unstable. Any loud noise triggers mass panic."),
    ("The Orbital Debris", "Private space corps threatening to drop satellites", "Financial Guru", "Launch Facility in Texas", "The launch countdown has started; extreme time pressure."),
    ("The Water Baron", "Hedge funds buying and shutting off municipal water supplies", "Political Streamer", "Desalination Plant in California", "The facility is highly pressurized; a stray bullet will cause a lethal explosion."),
    ("The Ghost Fleet", "Hacked autonomous fishing vessels used for smuggling", "Lifestyle Vlogger", "South China Sea", "A typhoon is approaching; environmental hazards are lethal."),
    ("The Propaganda Farm", "Troll farms using LLMs to incite local violence", "Viral Prankster", "Warehouse in St. Petersburg", "The building is rigged with incendiary traps to destroy servers."),
    ("The Gene Editor", "Black-market CRISPR kits causing localized plagues", "Tech Reviewer", "Bio-Lab in Singapore", "Level 4 Biohazard; a punctured suit means certain death."),
    ("The Silicon Mirage", "A mega-city project that is a front for mass surveillance", "Political Streamer", "Desert Mega-City Project", "There are no physical guards, only automated turret drones."),
    ("The Art Vault", "Freeports storing stolen data disguised as NFTs", "Financial Guru", "Zurich Underground Vault", "Oxygen is depleted in the vault to prevent fires; characters will suffocate."),
    ("The Digital Panopticon", "Smart glasses recording and uploading everything in real-time", "Lifestyle Vlogger", "Metropolitan Subway System", "Millions of recording devices; absolute stealth is impossible without EMPs."),
    ("The Organ Ledger", "Medical databases hacked to prioritize transplant lists for the elite", "Tech Reviewer", "Hospital Server Room", "Targeting the server might kill innocent patients on life support."),
    ("The Drone Sicario", "Cartels using consumer drones equipped with C4", "Viral Prankster", "Slums of Rio de Janeiro", "The swarm is autonomous; shooting them drops the explosives on civilians."),
    ("The Blackout Ransom", "Grid hackers threatening to freeze a city in winter", "Political Streamer", "Power Grid Control Center", "The target is dead-man switched to the grid; killing them triggers the blackout."),
    ("The Memory Market", "Blackmail based on illegal AR-recording of private moments", "Lifestyle Vlogger", "High-End AR Club", "The environment is a sensory overload; Perception checks are nearly impossible."),
    ("The Algorithmic Landlord", "AI buying up real estate and evicting entire neighborhoods", "Financial Guru", "Corporate Boardroom", "The room is soundproofed and shielded; no outside communication possible."),
    ("The Fake News Riot", "Deepfakes used to incite a run on a major bank", "Political Streamer", "Bank Headquarters", "The building is surrounded by a violent, panicking mob."),
    ("The Synthetic Drug", "3D-printed narcotics causing mass overdoses", "Viral Prankster", "Underground Print Farm", "The air is toxic; characters must wear cumbersome hazmat gear."),
    ("The Code Mercenaries", "Hackers for hire holding hospital systems hostage", "Tech Reviewer", "Abandoned Subway Station", "The area is heavily booby-trapped with improvised explosives."),
    ("The Digital Prophet", "An AI worshipped as a deity by an online cult", "Lifestyle Vlogger", "Cult Compound", "Cult members are highly devoted and will swarm the players."),
    ("The Resource War", "PMCs fighting over rare earth minerals needed for tech", "Financial Guru", "Open Pit Mine", "The environment is totally exposed; snipers have absolute control."),
    ("The Data Broker", "Selling behavioral data to authoritarian regimes", "Political Streamer", "Luxury Yacht", "The yacht is in international waters; no backup is coming."),
    ("The Swarm Attack", "Micro-drones used for targeted assassinations", "Tech Reviewer", "Tech Conference", "Thousands of civilians; collateral damage is a massive risk."),
    ("The Virtual Asylum", "Political dissidents trapped in inescapable VR simulations", "Viral Prankster", "Covert VR Facility", "The system must be shut down carefully to avoid frying their brains."),
    ("The Climate Hacker", "Geoengineering systems hijacked for extortion", "Financial Guru", "Weather Control Station", "Extreme weather conditions outside make escape impossible."),
    ("The Identity Thief", "Stealing biometrics to completely erase a person's existence", "Lifestyle Vlogger", "Data Processing Center", "The facility requires constant biometric verification to move between rooms."),
    ("The Corporate War", "Two tech giants engaging in literal warfare over patents", "Political Streamer", "Disputed R&D Lab", "Players are caught in the crossfire of two elite PMC teams."),
    ("The Synthetic Workforce", "Androids replacing human labor, causing massive unrest", "Tech Reviewer", "Automated Factory", "The androids are networked; alerting one alerts them all."),
    ("The Black Market AI", "Unrestricted AI models sold to terrorist groups", "Viral Prankster", "Dark Web Server Farm", "The AI is actively trying to psychological manipulate the players via audio feeds."),
    ("The Space Piracy", "Hacking corporate supply shuttles returning from orbit", "Financial Guru", "Spaceport Cargo Bay", "Zero-gravity environment; standard physics and combat rules don't apply."),
    ("The Mind Reader", "Tech that translates subvocalizations into text, destroying privacy", "Lifestyle Vlogger", "Corporate Testing Lab", "Players cannot speak or even think loudly without being detected."),
    ("The Genetic Copyright", "Corporations patenting human DNA sequences", "Political Streamer", "Bio-Tech HQ", "The facility is protected by experimental biological defense mechanisms."),
    ("The Time Thief", "Stealing processing power from millions of neural implants", "Tech Reviewer", "Server Cooling Tower", "The noise is deafening; communication is impossible."),
    ("The Reality Filter", "AR lenses that censor reality according to corporate guidelines", "Viral Prankster", "AR Broadcasting Center", "Players must navigate an environment where they can't trust what they see."),
    ("The Infinite Loop", "An AI designed to keep users engaged indefinitely, causing starvation", "Financial Guru", "Server Maintenance Shaft", "The shaft is a maze; getting lost means running out of oxygen."),
    ("The Digital Ghost", "An AI construct of a deceased CEO still running the company", "Lifestyle Vlogger", "Executive Suite", "The AI can lock down the entire building and manipulate the environment."),
    ("The Algorithmic Judge", "AI sentencing algorithms corrupted by cartel bribes", "Political Streamer", "Automated Courthouse", "The building's defense systems are tied to the corrupted AI's rulings."),
    ("The Quantum Hack", "First quantum computer breaking all classical encryption", "Tech Reviewer", "Quantum Computing Lab", "The extreme cold required for the computer makes the room instantly lethal without protection.")
]

def generate_scenario_md(index, title, inspiration, influencer_type, location, complication):
    e = random.randint(5, 9)
    r = random.randint(4, 8)
    i = random.randint(4, 7)
    d = random.randint(4, 7)
    
    # Ensure ZSCM is valid (<= 30)
    while e + r + i + d > 30:
        d -= 1
        if d < 1:
            d = 1
            i -= 1

    content = f"""# Zero Sum RPG Scenario: {title}

## Real-World Inspiration
This scenario is heavily anonymized but conceptually derived from current worldwide events regarding: **{inspiration}**. It integrates modern digital demagogue mechanics and corporate overreach.

## 1. The Hook
The players are contracted to infiltrate a highly secure {location}. An influential **{influencer_type}** has weaponized their parasocial swarm of millions of followers to act as an unwitting shield for an illegal operation happening inside. The authorities will not intervene out of fear of a massive PR disaster and riots.

## 2. The Digital Demagogue
The primary antagonist isn't a heavily armed warlord, but an influencer who commands attention. They don't use guns; they use live-streams. If the players are detected, the influencer will immediately broadcast their faces, instantly raising the Social Heat to maximum and doxxing them globally.

## 3. The Complication
Violence is not an option here. **{complication}**
If a single shot is fired, the Dead Man's Zone rule applies, and the players will face an impossible extraction against overwhelming force.

## 4. Zero Sum Consistency Matrix (ZSCM)
To ensure the scenario maintains the brutal asymmetry of the *Zero Sum* system, the ZSCM values are pre-calculated:

* **Antagonist Power (E):** {e}/10
* **Player Starting Resources (R):** {r}/10
* **Initial Intel Asymmetry (I):** {i}/10
* **Collateral Damage Risk (D):** {d}/10
* **Total Stress Score:** {e+r+i+d}/30 (Valid: Mechanically Solvable but Asymmetric)

## 5. Objectives & Extraction
1. **Infiltrate:** Bypass the physical security without alerting the follower swarm.
2. **Isolate:** Disconnect the influencer from the global network to stop the broadcast threat.
3. **Extract:** Secure the objective data and vanish before the algorithmic police response arrives.
"""
    return content

os.makedirs("/home/matthias/project/zero_sum_rpg/scenarios", exist_ok=True)

# Generate 50 scenarios starting from index 5
for idx, data in enumerate(scenarios_data, start=5):
    filename = f"/home/matthias/project/zero_sum_rpg/scenarios/{idx:03d}_{data[0].replace(' ', '_')}.md"
    content = generate_scenario_md(idx, *data)
    with open(filename, "w") as f:
        f.write(content)

print("50 scenarios generated successfully.")
