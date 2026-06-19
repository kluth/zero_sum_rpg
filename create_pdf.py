import os
import shutil
import glob
from PIL import Image

# Directories
artifact_dir = "/home/matthias/.gemini/antigravity-cli/brain/886fd2e1-5ee6-43d8-868f-50c9af6b6a95/"
assets_dir = "/home/matthias/project/zero_sum_rpg/assets/"
pdf_path = "/home/matthias/project/zero_sum_rpg/Zero_Sum_Art_Book.pdf"

# Create assets dir
os.makedirs(assets_dir, exist_ok=True)

# Find all monochrome jpgs in the artifact dir
jpg_files = glob.glob(os.path.join(artifact_dir, "*_monochrome_*.jpg"))

# Copy them to assets dir with clean names
clean_paths = []
for f in jpg_files:
    basename = os.path.basename(f)
    # e.g. drone_zone_monochrome_1781865550718.jpg -> drone_zone_monochrome.jpg
    parts = basename.split("_")
    clean_name = "_".join(parts[:-1]) + ".jpg"
    dest = os.path.join(assets_dir, clean_name)
    shutil.copy2(f, dest)
    clean_paths.append(dest)

# Sort alphabetically for the PDF
clean_paths.sort()

# Create PDF
if clean_paths:
    images = []
    for path in clean_paths:
        img = Image.open(path)
        img = img.convert("RGB")
        images.append(img)
    
    first_image = images[0]
    first_image.save(pdf_path, save_all=True, append_images=images[1:])
    print(f"Successfully generated PDF with {len(images)} pages at {pdf_path}")
else:
    print("No images found to process.")
