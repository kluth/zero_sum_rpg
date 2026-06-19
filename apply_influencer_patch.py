import os

en_patch = """
### 6.3 Digital Demagogues (Influencers)
* **The New Power Brokers:** In the Zero-Trust Era, reality is defined by whoever has the most engagement. Influencers, streamers, and viral content creators wield massive geopolitical power. A single live stream can crash a stock, direct a mob to a black site, or instantly max out the Heat Level of a covert operation.
* **The Follower Swarm:** Influencers do not need PMCs; they weaponize their parasocial audiences. A coordinated doxxing attack by a swarm of followers is just as lethal as a sniper's bullet.
"""

de_patch = """
### 6.3 Digitale Demagogen (Influencer)
* **Die neuen Machtmakler:** In der Zero-Trust-Ära wird die Realität von denjenigen definiert, die das meiste Engagement haben. Influencer, Streamer und virale Content-Creator üben massive geopolitische Macht aus. Ein einziger Livestream kann eine Aktie zum Absturz bringen, einen Mob zu einer Black Site lenken oder das Heat-Level einer verdeckten Operation sofort maximieren.
* **Der Follower-Schwarm:** Influencer brauchen keine Söldner; sie bewaffnen ihr parasoziales Publikum. Ein koordinierter Doxxing-Angriff durch einen Schwarm von Followern ist genauso tödlich wie die Kugel eines Scharfschützen.
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
