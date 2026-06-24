import re

filepath = 'web-app/src/app/app.component.css'
with open(filepath, 'r') as f:
    content = f.read()

# Replace mobile stack height: auto to height: 100dvh
content = re.sub(r'\.main-dashboard-wrapper\s*\{[^}]+\}', '.main-dashboard-wrapper { height: 100dvh; max-height: 100dvh; overflow: hidden; }', content)
content = re.sub(r'\.gm-grid\s*\{[^}]+\}', '.gm-grid { grid-template-columns: 1fr; grid-template-rows: 40dvh 1fr; overflow: hidden; height: 100dvh; max-height: 100dvh; }', content)
content = re.sub(r'\.dashboard-grid,\s*\.spectator-grid\s*\{[^}]+\}', '.dashboard-grid, .spectator-grid { grid-template-columns: 1fr; grid-template-rows: 30dvh 40dvh 1fr; overflow: hidden; height: 100dvh; max-height: 100dvh; }', content)
content = re.sub(r'\.spectator-grid-cams\s*\{[^}]+\}', '.spectator-grid-cams { grid-template-columns: 1fr; grid-template-rows: 20dvh 25dvh 30dvh 1fr; overflow: hidden; height: 100dvh; max-height: 100dvh; }', content)
content = re.sub(r'\.left-pane,\s*\.right-pane,\s*\.webcam-pane\s*\{\s*overflow-y:\s*visible\s*!important;\s*\}', '.left-pane, .right-pane, .webcam-pane { overflow-y: auto !important; max-height: 100%; }', content)

# 1200px rules
content = re.sub(r'\.billboard-container\s*\{[^}]+\}', '.billboard-container { height: 100dvh; max-height: 100dvh; overflow-y: auto; justify-content: flex-start; }', content)

# Base classes
content = re.sub(r'\.main-dashboard-wrapper\s*\{.*?min-height:\s*100[dv]h;.*?\}', '.main-dashboard-wrapper { display: flex; flex-direction: column; width: 100vw; height: 100dvh; max-height: 100dvh; overflow: hidden; background: #09090b; }', content, count=1, flags=re.DOTALL)
content = content.replace("min-height: 100dvh; max-height: 100dvh; max-height: 100dvh;", "height: 100dvh; max-height: 100dvh; overflow: hidden;")

with open(filepath, 'w') as f:
    f.write(content)

# Player Uplink CSS
filepath_uplink = 'web-app/src/app/ui/player-uplink/player-uplink.component.css'
with open(filepath_uplink, 'r') as f:
    content_uplink = f.read()

content_uplink = content_uplink.replace('min-height: 100dvh;', 'height: 100dvh; max-height: 100dvh; overflow: hidden;')
with open(filepath_uplink, 'w') as f:
    f.write(content_uplink)

# Billboard CSS
filepath_billboard = 'web-app/src/app/ui/billboard/billboard.component.css'
with open(filepath_billboard, 'r') as f:
    content_billboard = f.read()

content_billboard = content_billboard.replace('height: 100dvh;', 'height: 100dvh; max-height: 100dvh; overflow: hidden;')
with open(filepath_billboard, 'w') as f:
    f.write(content_billboard)

# app.component.ts wrapper inline styles
filepath_ts = 'web-app/src/app/app.component.ts'
with open(filepath_ts, 'r') as f:
    content_ts = f.read()

# Specifically replace the generic "height: 100dvh; max-height: 100dvh; overflow-y: auto;" to "height: 100dvh; max-height: 100dvh; overflow: hidden;"
content_ts = content_ts.replace('height: 100dvh; max-height: 100dvh; overflow-y: auto;', 'height: 100dvh; max-height: 100dvh; overflow: hidden;')

with open(filepath_ts, 'w') as f:
    f.write(content_ts)

