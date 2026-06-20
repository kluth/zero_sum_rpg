import os
import glob
import re

md_files = glob.glob('scenarios/*.md') + glob.glob('docs/**/*.md', recursive=True)
pattern = re.compile(r'!\[.*?\]\((.*?)\)')

broken = []
for fpath in md_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = pattern.findall(content)
    for match in matches:
        # resolve relative path
        if match.startswith('http'):
            continue
        
        if match.startswith('/'):
            if not os.path.exists(match):
                broken.append((fpath, match))
        else:
            base_dir = os.path.dirname(fpath)
            full_path = os.path.normpath(os.path.join(base_dir, match))
            if not os.path.exists(full_path):
                broken.append((fpath, match, full_path))

for b in broken:
    print(b)
print("Total broken:", len(broken))
