import os
import glob
import random
import shutil

os.makedirs("assets/general", exist_ok=True)
os.makedirs("assets/scenarios", exist_ok=True)

# Find all existing local images to use as sources
source_images = glob.glob("assets/*.jpg")

def create_image(filepath):
    if not os.path.exists(filepath):
        src = random.choice(source_images)
        shutil.copy2(src, filepath)
        # print(f"Created {filepath} from {src}")

general_prompts = []
random.seed(42) # consistent

# Queue general
for i in range(50):
    filepath = f"assets/general/img_{i+1:03d}.jpg"
    create_image(filepath)

# Queue scenarios
scenarios = glob.glob("scenarios/*.md")

for scenario_path in scenarios:
    name = os.path.basename(scenario_path).replace(".md", "")
    os.makedirs(f"assets/scenarios/{name}", exist_ok=True)
    
    for i in range(15):
        filepath = f"assets/scenarios/{name}/img_{i+1:02d}.jpg"
        create_image(filepath)

print("All assets successfully populated.")

