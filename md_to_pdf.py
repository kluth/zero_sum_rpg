import os
import glob
import markdown
from weasyprint import HTML

# Find all markdown files recursively
md_files = []
for root, dirs, files in os.walk("."):
    # Skip hidden directories like .git and .agents
    if "/." in root or root.startswith(".agents"):
        continue
    for file in files:
        if file.endswith(".md"):
            md_files.append(os.path.join(root, file))

for f in md_files:
    with open(f, "r") as file:
        md_text = file.read()
    
    # WeasyPrint works better if we provide a simple HTML wrapper
    html_content = markdown.markdown(md_text, extensions=['tables'])
    html = f"""
    <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: sans-serif; line-height: 1.6; padding: 2em; }}
                img {{ max-width: 100%; height: auto; display: block; margin: 1em auto; }}
                h1, h2, h3 {{ color: #333; }}
                code {{ background: #f4f4f4; padding: 2px 4px; border-radius: 4px; }}
            </style>
        </head>
        <body>
            {html_content}
        </body>
    </html>
    """
    
    pdf_filename = f.replace(".md", ".pdf")
    # Base URL is the directory of the file so images load properly
    base_url = os.path.dirname(os.path.abspath(f))
    HTML(string=html, base_url=base_url).write_pdf(pdf_filename)
    print(f"Generated {pdf_filename}")
