import os

files_to_check = [
    'web-app/src/app/app.component.css',
    'web-app/src/app/app.component.ts',
    'web-app/src/app/flashback-overlay.component.ts',
    'web-app/src/app/ui/billboard/billboard.component.css',
    'web-app/src/app/ui/player-uplink/player-uplink.component.css'
]

for filepath in files_to_check:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Replace 100vh with 100dvh
        content = content.replace('100vh', '100dvh')
        
        # Replace min-height/height with max-height where applicable to ensure it doesn't exceed
        # Actually, if we change height: 100dvh to max-height: 100dvh, we should also ensure overflow is handled.
        # But simply changing vh to dvh is the modern standard for mobile responsive viewports.
        # Let's just do vh -> dvh first, and if there are specific height/min-height, we can add max-height: 100dvh as well.
        # Let's just blindly replace 100vh with 100dvh, and add max-height: 100dvh to the wrappers.

        if 'app.component.css' in filepath:
            content = content.replace('height: 100dvh;', 'height: 100dvh; max-height: 100dvh;')
            content = content.replace('min-height: 100dvh;', 'min-height: 100dvh; max-height: 100dvh;')
        if 'app.component.ts' in filepath:
            content = content.replace('height: 100dvh;', 'height: 100dvh; max-height: 100dvh;')

        with open(filepath, 'w') as f:
            f.write(content)
