import os
import json

files = []
for root, dirs, filenames in os.walk('.'):
    if 'node_modules' in root or '.git' in root or '.agents' in root or 'repo' in root:
        continue
    for f in filenames:
        if f.endswith('.md'):
            # Only translate actual project docs, skip generated stuff if we want, but user said "ALL DOCUMENTS IN THE PROJECT"
            files.append(os.path.join(root, f))

# Sort to be deterministic
files.sort()

# Chunk into 10 groups
n_chunks = 10
chunks = [files[i::n_chunks] for i in range(n_chunks)]

subagents = []
for i, chunk in enumerate(chunks):
    if not chunk: continue
    
    file_list_str = "\n".join(chunk)
    prompt = f"""You are a professional game localizer. Translate the following markdown files into German (save as original_name_de.md) and Dutch (save as original_name_nl.md).
Leave 'eingedeutschte' Begriffe (common English gaming terms) untranslated.
Use view_file to read each file, then use write_to_file to save the _de.md and _nl.md versions in the SAME directory as the original file.

Files to process:
{file_list_str}
"""
    subagents.append({
        "TypeName": "self",
        "Role": f"Translator_{i}",
        "Prompt": prompt
    })

print(json.dumps(subagents, indent=2))
