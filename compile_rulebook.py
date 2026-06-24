import os
import subprocess

core_files = [
    "OVERVIEW_de.md",
    "TTRPG_ARCHITECTURE_V2_de.md",
    "docs/ANALOG_SYNC_GUIDE_de.md",
    "docs/ANALOG_ISSUES_de.md",
    "docs/live_session_debrief_de.md"
]

output_md = "artifacts/Zero_Sum_RPG_Core_Rules_DE.md"
output_epub = "artifacts/Zero_Sum_RPG_Core_Rules_DE.epub"

content = "# Zero-Sum RPG: Core Rulebook (Deutsch)\n\n"

for f in core_files:
    if os.path.exists(f):
        with open(f, 'r') as infile:
            content += infile.read() + "\n\n"

with open(output_md, 'w') as outfile:
    outfile.write(content)

# Use pandoc to generate EPUB
subprocess.run(["pandoc", output_md, "-o", output_epub, "--toc", "--metadata", "title=Zero-Sum RPG Core Rules", "--metadata", "author=Zero-Sum Agent Network"])

# Generate HTML for PDF conversion
html_out = "artifacts/Zero_Sum_RPG_Core_Rules_DE.html"
subprocess.run(["pandoc", output_md, "-o", html_out, "--metadata", "title=Zero-Sum RPG", "-s"])

print("Markdown and EPUB generated. HTML ready for PDF.")
