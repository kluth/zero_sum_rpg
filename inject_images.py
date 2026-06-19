import os
import re

mapping = {
    "real_world_npcs.md": [
        ("Elias Vance", "elias_vance_redacted.jpg"),
        ("Viktor Petrov", "viktor_petrov_redacted.jpg"),
        ("El Fantasma", "el_fantasma_redacted.jpg"),
        ("Director Yossi", "director_yossi_redacted.jpg"),
        ("Chairman Wei", "chairman_wei_redacted.jpg"),
        ("Simon Black", "simon_black_redacted.jpg")
    ],
    "factions.md": [
        ("Valkyrie", "valkyrie_pmc_redacted.jpg"),
        ("Dark Money", "dark_money_syndicate_redacted.jpg"),
        ("Hacker", "underground_hackers_redacted.jpg")
    ],
    "locations.md": [
        ("Drone", "drone_zone_redacted.jpg"),
        ("Geneva", "geneva_freeport_redacted.jpg"),
        ("Ashburn", "ashburn_data_center_redacted.jpg"),
        ("Climate", "climate_disaster_zone_redacted.jpg"),
        ("Frontline", "eastern_european_frontline_redacted.jpg"),
        ("Transnistria", "transnistria_redacted.jpg"),
        ("K Street", "k_street_firm_redacted.jpg")
    ],
    "items_and_tech.md": [
        ("Aether", "aether_headset_redacted.jpg"),
        ("Wallet", "encrypted_cold_wallet_redacted.jpg"),
        ("Zero-Day", "zero_day_exploit_redacted.jpg")
    ]
}

def inject_images():
    for filename, images in mapping.items():
        if not os.path.exists(filename):
            continue
        with open(filename, 'r') as f:
            lines = f.readlines()
        
        new_lines = []
        for line in lines:
            new_lines.append(line)
            # Check if this is a header line matching one of our targets
            if line.startswith("#"):
                for name, img in images:
                    if name.lower() in line.lower() and img not in ''.join(new_lines):
                        new_lines.append(f"\n![{name}](assets/{img})\n\n")
                        break
        
        with open(filename, 'w') as f:
            f.writelines(new_lines)
            print(f"Updated {filename}")

if __name__ == '__main__':
    inject_images()
