import os
import re

mapping = {
    "real_world_npcs.md": [
        ("Elias Vance", "elias_vance_monochrome.jpg"),
        ("Viktor Petrov", "viktor_petrov_monochrome.jpg"),
        ("El Fantasma", "el_fantasma_monochrome.jpg"),
        ("Director Yossi", "director_yossi_monochrome.jpg"),
        ("Chairman Wei", "chairman_wei_monochrome.jpg"),
        ("Simon Black", "simon_black_monochrome.jpg")
    ],
    "factions.md": [
        ("Valkyrie", "valkyrie_pmc_monochrome.jpg"),
        ("Dark Money", "dark_money_syndicate_monochrome.jpg"),
        ("Hacker", "underground_hackers_monochrome.jpg")
    ],
    "locations.md": [
        ("Drone", "drone_zone_monochrome.jpg"),
        ("Geneva", "geneva_freeport_monochrome.jpg"),
        ("Ashburn", "ashburn_data_center_monochrome.jpg"),
        ("Climate", "climate_disaster_zone_monochrome.jpg"),
        ("Frontline", "eastern_european_frontline_monochrome.jpg"),
        ("Transnistria", "transnistria_monochrome.jpg"),
        ("K Street", "k_street_firm_monochrome.jpg")
    ],
    "items_and_tech.md": [
        ("Aether", "aether_headset_monochrome.jpg"),
        ("Wallet", "encrypted_cold_wallet_monochrome.jpg"),
        ("Zero-Day", "zero_day_exploit_monochrome.jpg")
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
