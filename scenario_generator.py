import random
import math

class ZeroSumScenarioGenerator:
    def __init__(self):
        self.factions = ["Surveillance State", "Private Intelligence", "Dark Money", "Underground"]
        self.macguffins = [
            {"name": "Encrypted Cold Wallet", "digital": True, "security_tier": "High"},
            {"name": "Server Hard Drive", "digital": False, "security_tier": "Low"},
            {"name": "Whistleblower", "digital": False, "security_tier": "Low"},
            {"name": "Zero-Day Exploit Source Code", "digital": True, "security_tier": "High"}
        ]
        self.locations = [
            {"name": "Geneva Freeports", "security_tier": "High"},
            {"name": "Ashburn Data Center", "security_tier": "High"},
            {"name": "Transnistria", "security_tier": "Low"},
            {"name": "K Street Firm", "security_tier": "Low"},
            {"name": "Eastern European Frontline", "security_tier": "Low"},
            {"name": "Middle Eastern Drone Zone", "security_tier": "Low"},
            {"name": "Climate Disaster Zone", "security_tier": "Low"}
        ]
        
    def generate(self, player_resources=3, initial_heat=3):
        # Validate inputs
        if not isinstance(player_resources, (int, float)) or isinstance(player_resources, bool):
            raise ValueError("player_resources must be a number")
        if not isinstance(initial_heat, (int, float)) or isinstance(initial_heat, bool):
            raise ValueError("initial_heat must be a number")
        if player_resources < 0:
            raise ValueError("player_resources must be >= 0")
        if initial_heat < 0:
            raise ValueError("initial_heat must be >= 0")

        antagonist = random.choice(self.factions)
        macguffin = random.choice(self.macguffins)
        
        is_digital = macguffin["digital"]
        mac_tier = macguffin["security_tier"]
        
        # Select appropriate location based on security tier
        valid_locations = [l["name"] for l in self.locations if not is_digital or l["security_tier"] == mac_tier]
        if not valid_locations:
            valid_locations = [l["name"] for l in self.locations]
        location = random.choice(valid_locations)
            
        min_E = player_resources + int(initial_heat / 2.0)
        # Bounded 1-10 scale
        antagonist_power = min(10, max(5, min_E))
        
        degrees_of_separation = random.randint(3, 5)
        violence_probability = random.random()
        
        scenario = {
            "Antagonist": antagonist,
            "Antagonist Power (E)": antagonist_power,
            "MacGuffin": macguffin["name"],
            "Is Digital": is_digital,
            "Location": location,
            "Degrees of Separation (D)": degrees_of_separation,
            "Violence Probability (V)": round(violence_probability, 2),
            "Player Resources (R)": player_resources,
            "Initial Heat (I)": initial_heat
        }
        return scenario

    def verify(self, scenario):
        errors = []
        required_keys = [
            "Player Resources (R)", "Initial Heat (I)", "Antagonist Power (E)",
            "Degrees of Separation (D)", "Is Digital", "Location", "Security Tier"
        ]
        for key in required_keys:
            if key not in scenario:
                errors.append(f"Missing Key: '{key}' must be present in the scenario.")
        
        if errors:
            return False, errors
            
        r = scenario["Player Resources (R)"]
        i = scenario["Initial Heat (I)"]
        e = scenario["Antagonist Power (E)"]
        d = scenario["Degrees of Separation (D)"]
        is_digital = scenario["Is Digital"]
        loc = scenario["Location"]
        mac_tier = scenario.get("Security Tier", "Low")
        
        # Check types
        if not isinstance(r, (int, float)) or isinstance(r, bool):
            errors.append("Type Error: 'Player Resources (R)' must be a number.")
        if not isinstance(i, (int, float)) or isinstance(i, bool):
            errors.append("Type Error: 'Initial Heat (I)' must be a number.")
        if not isinstance(e, (int, float)) or isinstance(e, bool):
            errors.append("Type Error: 'Antagonist Power (E)' must be a number.")
        if not isinstance(d, (int, float)) or isinstance(d, bool):
            errors.append("Type Error: 'Degrees of Separation (D)' must be a number.")
            
        if errors:
            return False, errors
            
        # C1: The Asymmetry Theorem: E = min(10, max(5, R + floor(I/2)))
        required_power = min(10, max(5, r + int(i / 2.0)))
        if e != required_power:
            errors.append(f"Asymmetry Failure: Antagonist Power ({e}) breaks bounded scale (needs {required_power}).")
            
        # C2: The Shadow Theorem: D >= 3
        if d < 3:
            errors.append(f"Shadow Failure: Antagonist is too close to the players (D = {d}, needs >= 3).")
            
        # C3: The Footprint Theorem: Digital items require High Security Tiers
        # Validate against the class definitions
        loc_tier = next((l["security_tier"] for l in self.locations if l["name"] == loc), "Low")
        if is_digital and loc_tier != "High":
            errors.append(f"Footprint Failure: High-value digital asset stored in invalid location '{loc}' (needs High Security Tier).")
            
        return len(errors) == 0, errors

if __name__ == "__main__":
    generator = ZeroSumScenarioGenerator()
    print("Zero Sum Consistency Matrix (ZSCM) Initializing...\n")
    scenario = generator.generate()
    valid, errors = generator.verify(scenario)
    if valid:
        print("=== VALID SCENARIO GENERATED ===")
        for k, v in scenario.items():
            print(f"{k}: {v}")
        print("\nVerification: Mathematical and Intellectual Proof Passed (ZSCM Constraints satisfied).")
    else:
        print(f"Failed due to: {errors}")
