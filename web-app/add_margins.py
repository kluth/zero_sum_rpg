import re

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'r') as f:
    html = f.read()

# 1. Update the main grid gap and padding for all views
# Old: class="flex-1 grid grid-cols-1 lg:grid-cols-4 grid-rows-2 gap-[1px] bg-outline-variant overflow-hidden"
# New: class="flex-1 grid grid-cols-1 lg:grid-cols-4 grid-rows-2 gap-4 p-4 bg-background overflow-hidden"
html = html.replace('gap-[1px] bg-outline-variant', 'gap-4 p-4 bg-background')

# 2. Add border to all sections
# Old: <section class="... bg-surface flex flex-col ...">
# We can just replace 'bg-surface flex flex-col' with 'bg-surface border border-outline-variant flex flex-col'
html = html.replace('bg-surface flex flex-col', 'bg-surface border border-outline-variant flex flex-col')

# 3. For Support Mode
# Old: <main class="flex-1 bg-surface-container-lowest p-8 flex flex-col gap-4 relative overflow-hidden">
# New: <main class="flex-1 bg-surface-container-lowest m-4 border border-outline-variant p-8 flex flex-col gap-4 relative overflow-hidden shadow-lg">
html = html.replace(
    '<main class="flex-1 bg-surface-container-lowest p-8 flex flex-col gap-4 relative overflow-hidden">',
    '<main class="flex-1 bg-surface-container-lowest m-4 border border-outline-variant p-8 flex flex-col gap-4 relative overflow-hidden shadow-sm rounded-sm">'
)

# 4. Make elements shrinkable instead of hiddenly overflowing
# For GM Mode Tools, change `flex-1 p-panel-padding overflow-hidden flex flex-col gap-4` to `gap-2`
html = html.replace('gap-4', 'gap-3') # Slightly reduce global gaps from 4 to 3 where they were hardcoded, to make room.

# For the Support Terminal Logs, they are currently `flex-col-reverse` so they grow up.
# If they overflow, we should let them truncate. `overflow-hidden` is already there.

# 5. Fix some remaining `overflow-hidden` inside the tools panels to use `flex-shrink` if needed.
# Let's change the `p-panel-padding` to `p-3` and add `justify-between` to some flex columns to spread things out instead of cramping.
html = html.replace('p-panel-padding', 'p-3 flex-shrink-0')

# Also, ensure Billboard has margin
# Old: <div class="flex-1 flex flex-col p-10 z-10 relative">
# New: <div class="flex-1 flex flex-col m-4 p-6 z-10 relative bg-surface border border-outline-variant shadow-sm rounded-sm">
html = html.replace(
    '<div class="flex-1 flex flex-col p-10 z-10 relative">',
    '<div class="flex-1 flex flex-col m-6 p-8 z-10 relative bg-surface border border-outline-variant shadow-sm">'
)

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'w') as f:
    f.write(html)

print("Margins added and layouts updated.")
