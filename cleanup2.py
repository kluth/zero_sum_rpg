import re

with open('web-app/src/app/app.component.ts', 'r') as f:
    content = f.read()

content = content.replace('text-neon-red', '')
content = content.replace('text-neon-blue', '')
content = content.replace('text-acid-green', '')
content = content.replace('cyberpsychosis', 'deterioration')
content = content.replace('Neon Wall', 'Solid Wall')
content = content.replace('isNetrunnerMode', 'isSupportMode')
content = content.replace('netrunner', 'support')
content = content.replace('LLM-ICE', 'SYSTEM')
content = content.replace('LOCAL ICE TERMINAL', 'LOCAL TERMINAL')
content = content.replace('Air-gap hack impossible', 'Physical validation impossible')

with open('web-app/src/app/app.component.ts', 'w') as f:
    f.write(content)
