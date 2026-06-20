import os
import glob
import re
import shutil

md_files = glob.glob('scenarios/*.md') + glob.glob('docs/**/*.md', recursive=True)
pattern = re.compile(r'!\[(.*?)\]\((/home/matthias.*?)\)')

for fpath in md_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = pattern.findall(content)
    if matches:
        for alt_text, abs_path in matches:
            filename = os.path.basename(abs_path)
            dest_dir = "assets/general"
            dest_path = os.path.join(dest_dir, filename)
            
            # Copy file if it exists
            if os.path.exists(abs_path):
                shutil.copy2(abs_path, dest_path)
            
            # calculate relative path from markdown to asset
            # for scenarios/*.md -> ../assets/general/filename
            # for docs/xx/*.md -> ../../assets/general/filename
            
            rel_path = os.path.relpath(dest_path, os.path.dirname(fpath))
            
            # Replace in content
            content = content.replace(abs_path, rel_path)
            print(f"Replaced {abs_path} with {rel_path} in {fpath}")
            
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done fixing links.")
