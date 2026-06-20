import os
import glob
import re

md_files = glob.glob('scenarios/*.md') + glob.glob('docs/**/*.md', recursive=True)
pattern = re.compile(r'!\[.*?\]\((.*?)\)')

missing = []
for fpath in md_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = pattern.findall(content)
    for match in matches:
        if match.startswith('http'):
            continue
            
        base_dir = os.path.dirname(fpath)
        full_path = os.path.normpath(os.path.join(base_dir, match))
        if not os.path.exists(full_path):
            missing.append((fpath, match, full_path))

if not missing:
    print("All image links are valid.")
else:
    for m in missing:
        print("Missing:", m)
