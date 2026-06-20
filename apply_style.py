import os
import glob
import markdown
from weasyprint import HTML, CSS

css_string = """
@page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
    @top-right {
        content: "ZERO SUM RPG // CONFIDENTIAL";
        font-family: 'Courier New', Courier, monospace;
        font-size: 8pt;
        color: #888;
    }
    @bottom-center {
        content: counter(page);
        font-family: 'Courier New', Courier, monospace;
        font-size: 10pt;
    }
}

body {
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    line-height: 1.6;
    font-size: 11pt;
    background-color: #f9f9f9;
}

h1 {
    font-family: 'Courier New', Courier, monospace;
    font-size: 28pt;
    font-weight: 800;
    text-transform: uppercase;
    color: #000;
    border-bottom: 4px solid #d32f2f;
    padding-bottom: 5px;
    margin-top: 0;
}

h2 {
    font-family: 'Courier New', Courier, monospace;
    font-size: 18pt;
    color: #d32f2f;
    text-transform: uppercase;
    margin-top: 2em;
    border-bottom: 1px solid #ccc;
    padding-bottom: 3px;
}

h3 {
    font-size: 14pt;
    font-weight: bold;
    color: #333;
    margin-top: 1.5em;
}

p {
    margin-bottom: 1.2em;
    text-align: justify;
}

strong {
    color: #000;
    font-weight: 800;
}

em {
    color: #555;
}

blockquote {
    border-left: 5px solid #000;
    background-color: #eaeaea;
    padding: 10px 15px;
    margin: 1.5em 0;
    font-family: 'Courier New', Courier, monospace;
    font-size: 10.5pt;
    color: #333;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 2em 0;
    font-size: 10pt;
}

th {
    background-color: #000;
    color: #fff;
    text-align: left;
    padding: 8px;
    font-family: 'Courier New', Courier, monospace;
    text-transform: uppercase;
}

td {
    border-bottom: 1px solid #ccc;
    padding: 8px;
}

tr:nth-child(even) {
    background-color: #f2f2f2;
}

code {
    font-family: 'Courier New', Courier, monospace;
    background-color: #e0e0e0;
    padding: 2px 4px;
    font-size: 10pt;
    color: #d32f2f;
}

ul, ol {
    margin-bottom: 1.5em;
}

li {
    margin-bottom: 0.5em;
}

img {
    max-width: 100%;
    height: auto;
    border: 2px solid #000;
    filter: grayscale(100%) contrast(120%);
    margin: 10px 0;
}
"""

md_files = []
for root, dirs, files in os.walk("."):
    if "/." in root or root.startswith(".agents") or root.startswith("venv"):
        continue
    for file in files:
        if file.endswith(".md"):
            md_files.append(os.path.join(root, file))

compiled_css = CSS(string=css_string)

for f in md_files:
    with open(f, "r") as file:
        md_text = file.read()
    
    html_content = markdown.markdown(md_text, extensions=['tables'])
    html = f"""
    <html>
        <head><meta charset="utf-8"></head>
        <body>
            {html_content}
        </body>
    </html>
    """
    
    pdf_filename = f.replace(".md", ".pdf")
    base_url = os.path.dirname(os.path.abspath(f))
    
    HTML(string=html, base_url=base_url).write_pdf(pdf_filename, stylesheets=[compiled_css])
    print(f"Styled and Generated {pdf_filename}")
