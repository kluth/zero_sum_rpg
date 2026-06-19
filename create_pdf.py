import os
import glob
from PIL import Image

assets_dir = "/home/matthias/project/zero_sum_rpg/assets/"
pdf_path = "/home/matthias/project/zero_sum_rpg/Zero_Sum_Art_Book.pdf"

jpg_files = glob.glob(os.path.join(assets_dir, "*.jpg"))
jpg_files.sort()

if jpg_files:
    images = []
    for path in jpg_files:
        img = Image.open(path)
        img = img.convert("RGB")
        images.append(img)
    
    first_image = images[0]
    first_image.save(pdf_path, save_all=True, append_images=images[1:])
    print(f"Successfully generated PDF with {len(images)} pages at {pdf_path}")
else:
    print("No images found to process.")
