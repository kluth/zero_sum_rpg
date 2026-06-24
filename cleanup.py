import re

with open('web-app/src/app/app.component.ts', 'r') as f:
    content = f.read()

# Remove inline colors/borders/backgrounds from buttons and other elements that make it look neon
content = re.sub(r'style="[^"]*(color:\s*#[A-Fa-f0-9]+|background:\s*rgba\([^)]+\)|border-color:\s*#[A-Fa-f0-9]+)[^"]*"', '', content)
content = re.sub(r'style="[^"]*text-shadow[^"]*"', '', content)

# Clean up Lobby text
content = content.replace('GM OVERRIDE', 'GAME MASTER')
content = content.replace('CORPORATE BILLBOARD', 'DASHBOARD')
content = content.replace('BILLBOARD (V2 HEXAGONAL)', 'DASHBOARD (V2)')
content = content.replace('NETRUNNER SHELL', 'IT SUPPORT SHELL')
content = content.replace('CYBERPSYCHOSIS', 'STRESS')
content = content.replace('ZERO SUM <span class="text-neon-red">GM OVERRIDE</span>', 'ZERO SUM GAME MASTER')
content = content.replace('TWITCH INTEGRATION ACTIVE 🔴', 'STREAM INTEGRATION ACTIVE')
content = content.replace('INFOSEC MAINFRAME // AI-DRIVEN ICE', 'SERVER ADMINISTRATION')
content = content.replace('BREACH ICE / BYPASS', 'BYPASS SECURITY')

# Fix inline styles for inputs
content = content.replace("style=\"width: 100%; max-width: 300px; padding: 15px; font-size: 24px; background: rgba(0,0,0,0.8); border: 2px solid #00F0FF; color: #00F0FF; text-align: center; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase;\"", "")
content = content.replace("style=\"width: 100%; max-width: 300px; padding: 15px; font-size: 16px; background: rgba(0,0,0,0.8); border: 2px solid #39FF14; color: #39FF14; text-align: center; margin-bottom: 40px; font-family: 'JetBrains Mono', monospace;\"", "")

with open('web-app/src/app/app.component.ts', 'w') as f:
    f.write(content)
