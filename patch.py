import re

with open('web-app/src/app/app.component.ts', 'r') as f:
    content = f.read()

# Fix 1: onPlayerMoved and playerAction Firebase paths
content = content.replace("set(ref(this.db, 'sessions/' + this.sessionId() + '/characters/' + pid + '/pos'), {x, y});", "set(ref(this.db, 'sessions/' + this.sessionId() + '/gameState/characters/' + pid + '/pos'), {x, y});")
content = content.replace("push(ref(this.db, 'sessions/' + this.sessionId() + '/rolls')", "push(ref(this.db, 'sessions/' + this.sessionId() + '/gameState/recentRolls')")

# Fix 2 & 3: connectFirebase state overwrite and object values
old_state_set = "this.gameState.set(data);"
new_state_set = """
          data.recentRolls = data.recentRolls ? Object.values(data.recentRolls) : [];
          this.gameState.update(s => ({ ...data, clocks: s?.clocks || {}, flashbacks: s?.flashbacks || {} }));
"""
content = content.replace(old_state_set, new_state_set)

# Fix 4: Runaway Effect & Memory Leak
# We need to find the effect for recentTrauma.
# It currently has: 
# this.gameState();
# if (this.recentTrauma()) {
#   setTimeout(() => this.recentTrauma.set(null), 10000);
# }
effect_old = """    effect(() => {
      this.gameState(); // trigger on any state change
      if (this.recentTrauma()) {
        setTimeout(() => this.recentTrauma.set(null), 10000);
      }
    }, {allowSignalWrites: true});"""

effect_new = """    effect(() => {
      this.gameState();
      const currentTrauma = this.recentTrauma();
      if (currentTrauma && currentTrauma.id !== (window as any).lastTraumaId) {
        (window as any).lastTraumaId = currentTrauma.id;
        if ((window as any).traumaTimeout) clearTimeout((window as any).traumaTimeout);
        (window as any).traumaTimeout = setTimeout(() => this.recentTrauma.set(null), 10000);
      }
    }, {allowSignalWrites: true});"""
content = content.replace(effect_old, effect_new)

# Fix 5: Direct State Mutation
content = content.replace("updated[key].stats.hp_current -= 20;", "updated[key] = {...updated[key], stats: {...updated[key].stats, hp_current: updated[key].stats.hp_current - 20}};")
content = content.replace("updated[key].stats.stress += 20;", "updated[key] = {...updated[key], stats: {...updated[key].stats, stress: updated[key].stats.stress + 20}};")


# Fix 6: Missing implements OnDestroy
content = content.replace("export class AppComponent implements OnInit {", "import { OnDestroy } from '@angular/core';\nexport class AppComponent implements OnInit, OnDestroy {")
# Note: we added OnDestroy import, but import { Component... already exists. We can just add it manually if it fails, but this should work, it just adds a new import line above the class.

# Remove unused chaosInterval
content = content.replace("chaosInterval: any;", "")
content = content.replace("if (this.chaosInterval) clearInterval(this.chaosInterval);", "")


# HTML Fixes
content = content.replace("border: 4px solid #FFFFFF;", "border: 1px solid rgba(255, 255, 255, 0.08);")
content = re.sub(r'border-bottom:\s*[24]px\s*solid\s*#[A-Fa-f0-9]+;', 'border-bottom: 1px solid rgba(255, 255, 255, 0.08);', content)
content = re.sub(r'border-top:\s*2px\s*solid\s*#[A-Fa-f0-9]+;', 'border-top: 1px solid rgba(255, 255, 255, 0.08);', content)
content = content.replace("border: 3px solid #39FF14; box-shadow: inset 0 0 50px rgba(57,255,20,0.1);", "border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5);")
content = content.replace('style="border: 2px solid #00F0FF; padding: 10px;"', '')

content = content.replace('style="color: gray; font-size: 14px;"', 'class="data-mono" style="font-size: 11px; text-transform: uppercase;"')
content = content.replace('style="font-size: 12px; color: gray;"', 'class="data-mono" style="font-size: 11px; text-transform: uppercase;"')

content = content.replace('style="margin-top: 30px; font-size: 14px; color: gray;"', 'style="margin-top: 32px; font-size: 12px; font-family: \'JetBrains Mono\', monospace; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.1em;"')
content = content.replace('style="background: black; color: white; border: 1px solid gray; padding: 5px; width: 100%; margin-bottom: 10px;"', '')


with open('web-app/src/app/app.component.ts', 'w') as f:
    f.write(content)
