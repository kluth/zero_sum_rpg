import re

filepath = 'web-app/src/app/app.component.css'
with open(filepath, 'r') as f:
    content = f.read()

# Fix the base grid declarations that got overwritten
grids_base = """
.dashboard-grid { display: grid; grid-template-columns: 300px 1fr 300px; gap: 15px; height: 100dvh; max-height: 100dvh; overflow: hidden; }
.gm-grid { display: grid; grid-template-columns: 350px 1fr 300px; gap: 15px; height: 100dvh; max-height: 100dvh; overflow: hidden; }
.spectator-grid { display: grid; grid-template-columns: 350px 1fr 350px; gap: 15px; height: 100dvh; max-height: 100dvh; overflow: hidden; }
.spectator-grid-cams { display: grid; grid-template-columns: 220px 280px 1fr 280px; gap: 15px; height: 100dvh; max-height: 100dvh; overflow: hidden; }

/* Scale down elements to fit within viewport without scrolling */
.glass-panel {
  padding: min(2vh, 24px);
  display: flex;
  flex-direction: column;
}
.glass-panel > * {
  flex-shrink: 1;
}

.cyber-button {
  padding: min(1.2vh, 12px) min(1.5vw, 24px);
  font-size: min(1.2vh, 11px);
  margin-top: min(0.8vh, 10px);
}

.prefab-block, .tool-btn {
  padding: min(0.8vh, 12px);
}

h1, h2, h3 {
  margin-bottom: min(1vh, 10px) !important;
}

input[type="text"], input[type="number"], select {
  padding: min(0.8vh, 8px) min(1vw, 12px) !important;
}
"""

content = re.sub(r'\.dashboard-grid,\s*\.gm-grid.*?max-height:\s*100[dv]h;\s*\}', '', content, flags=re.DOTALL)
content = re.sub(r'\.gm-grid\s*\{.*?max-height:\s*100[dv]h;\s*\}', '', content, flags=re.DOTALL)
content = re.sub(r'\.spectator-grid\s*\{[^}]+\}', '', content, flags=re.DOTALL)
content = re.sub(r'\.spectator-grid-cams\s*\{[^}]+\}', '', content, flags=re.DOTALL)

# Insert after .gm-panel
content = content.replace('.gm-panel {\n  border: 1px solid rgba(255, 255, 255, 0.04) !important;\n}', '.gm-panel {\n  border: 1px solid rgba(255, 255, 255, 0.04) !important;\n}\n' + grids_base)

# Fix mobile layouts
mobile_css = """
@media (max-width: 900px) {
  .main-dashboard-wrapper { height: 100dvh; max-height: 100dvh; overflow: hidden; }
  .gm-grid { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
  .gm-grid > .glass-panel { flex: 1 1 auto; overflow-y: hidden; } /* Ensure children don't overflow the flex container */
  .gm-grid > div:first-child { flex: 0 1 35dvh; min-height: 25dvh; overflow: hidden; } /* map pane */
  
  .dashboard-grid, .spectator-grid { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
  .dashboard-grid > div, .spectator-grid > div { flex: 1 1 auto; overflow: hidden; }
  .dashboard-grid > div:nth-child(2), .spectator-grid > div:nth-child(2) { flex: 0 1 30dvh; min-height: 20dvh; overflow: hidden; } /* map */

  .spectator-grid-cams { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
  .spectator-grid-cams > div { flex: 1 1 auto; overflow: hidden; }
  
  .left-pane, .right-pane, .webcam-pane { overflow: hidden !important; max-height: 100%; }
}
"""

content = re.sub(r'@media\s*\(max-width:\s*900px\)\s*\{.*?\}(?=\s*@keyframes|\s*\Z)', mobile_css, content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)

# We also need to strip inline margins from app.component.ts that cause stretching.
ts_filepath = 'web-app/src/app/app.component.ts'
with open(ts_filepath, 'r') as f:
    ts_content = f.read()

# Replace hardcoded margins that cause overflowing without scroll
ts_content = ts_content.replace('margin-bottom: 20px', 'margin-bottom: 1vh')
ts_content = ts_content.replace('margin-bottom: 15px', 'margin-bottom: 1vh')
ts_content = ts_content.replace('margin-top: 20px', 'margin-top: 1vh')
ts_content = ts_content.replace('padding-bottom: 10px', 'padding-bottom: 1vh')
ts_content = ts_content.replace('padding-top: 10px', 'padding-top: 1vh')
ts_content = ts_content.replace('padding-top: 15px', 'padding-top: 1vh')
ts_content = ts_content.replace('margin-bottom: 10px', 'margin-bottom: 0.5vh')

with open(ts_filepath, 'w') as f:
    f.write(ts_content)
