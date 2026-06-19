import os
import glob
import re
import shutil

assets_dir = "/home/matthias/project/zero_sum_rpg/assets"
md_files = glob.glob("/home/matthias/project/zero_sum_rpg/*.md")

# First copy all generated images, stripping timestamps
gen_dir = "/home/matthias/.gemini/antigravity-cli/brain/886fd2e1-5ee6-43d8-868f-50c9af6b6a95"
gen_files = glob.glob(os.path.join(gen_dir, "*_redacted_*.jpg"))

# clean assets dir
old_assets = glob.glob(os.path.join(assets_dir, "*.jpg"))
for f in old_assets:
    os.remove(f)

for f in gen_files:
    basename = os.path.basename(f)
    clean_name = re.sub(r'_\d+\.jpg$', '.jpg', basename)
    shutil.copy(f, os.path.join(assets_dir, clean_name))

# Update markdown files
# Replace `assets/foo_abstract_123.jpg` or `assets/foo_monochrome.jpg` with `assets/foo_redacted.jpg`
pattern = re.compile(r'assets/([a-zA-Z0-9_]+?)_(abstract|monochrome|redacted)(?:_\d+)?\.jpg')

for md_file in md_files:
    with open(md_file, 'r') as f:
        content = f.read()
    
    new_content = pattern.sub(r'assets/\1_redacted.jpg', content)
    # Edge case: some images didn't have abstract/monochrome like spire_boardroom_123.jpg
    pattern_edge = re.compile(r'assets/([a-zA-Z0-9_]+?)_\d{13}\.jpg')
    new_content = pattern_edge.sub(r'assets/\1_redacted.jpg', new_content)
    
    if new_content != content:
        with open(md_file, 'w') as f:
            f.write(new_content)
        print(f"Updated {md_file}")

# also update inject_images.py if it exists
inject_py = "/home/matthias/project/zero_sum_rpg/inject_images.py"
if os.path.exists(inject_py):
    with open(inject_py, 'r') as f:
        content = f.read()
    pattern2 = re.compile(r'"([a-zA-Z0-9_]+?)_(abstract|monochrome|redacted)(?:_\d+)?\.jpg"')
    new_content = pattern2.sub(r'"\1_redacted.jpg"', content)
    with open(inject_py, 'w') as f:
        f.write(new_content)
    print("Updated inject_images.py")
