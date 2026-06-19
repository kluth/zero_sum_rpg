import os
import glob
import shutil

artifact_dir = "/home/matthias/.gemini/antigravity-cli/brain/886fd2e1-5ee6-43d8-868f-50c9af6b6a95/"
assets_dir = "/home/matthias/project/zero_sum_rpg/assets/"

shadow_files = glob.glob(os.path.join(artifact_dir, "*_shadow_*.jpg"))

for f in shadow_files:
    basename = os.path.basename(f)
    # e.g. elias_vance_monochrome_shadow_123.jpg -> elias_vance_monochrome.jpg
    parts = basename.split("_shadow_")
    if len(parts) == 2:
        new_name = parts[0] + ".jpg"
        dest = os.path.join(assets_dir, new_name)
        shutil.copy2(f, dest)
        print(f"Overwrote {new_name}")
