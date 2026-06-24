import re

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'r') as f:
    template = f.read()

# 1. Replace overflow-y-auto
template = template.replace('overflow-y-auto no-scrollbar', 'overflow-hidden')
template = template.replace('overflow-y-auto', 'overflow-hidden')

# 2. Replace the Lobby Screen
new_lobby_block = """    <!-- LOBBY SCREEN -->
    <div *ngIf="!sessionId()" class="bg-background text-on-background h-screen w-screen overflow-hidden flex flex-col font-body-main text-body-main selection:bg-primary selection:text-on-primary items-center justify-center relative">
        <div class="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.1)_100%)] pointer-events-none z-0"></div>
        <div class="z-10 bg-surface border border-outline-variant p-8 w-full max-w-4xl shadow-lg flex flex-col gap-8">
            <div class="text-center border-b border-outline-variant pb-8">
                <h2 class="font-display-lg text-6xl tracking-tighter text-primary">ZERO_SUM_RPG</h2>
                <div class="font-data-sm text-secondary uppercase tracking-widest mt-2">AUTHORIZATION_REQUIRED</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <input type="text" placeholder="ENTER_SESSION_PIN" [value]="sessionPinInput()" (input)="sessionPinInput.set($any($event.target).value)" class="bg-surface-container-lowest border border-outline-variant text-primary font-data-sm px-4 py-3 w-full outline-none focus:border-primary placeholder:text-secondary uppercase">
                <input type="text" placeholder="TWITCH_CHANNEL (OPTIONAL)" [value]="twitchChannelInput()" (input)="twitchChannelInput.set($any($event.target).value)" class="bg-surface-container-lowest border border-outline-variant text-primary font-data-sm px-4 py-3 w-full outline-none focus:border-primary placeholder:text-secondary uppercase">
            </div>
            
            <div class="flex flex-wrap gap-2 justify-center">
                <button class="bg-surface text-primary border border-outline-variant font-label-caps py-2 px-4 hover:bg-surface-container-highest transition-none" (click)="joinSession('spectator')">SPECTATE</button>
                <button class="bg-primary text-on-primary border border-primary font-label-caps py-2 px-4 hover:bg-surface-tint transition-none" (click)="joinSession('gm')">GAME_MASTER</button>
                <button class="bg-surface text-primary border border-outline-variant font-label-caps py-2 px-4 hover:bg-surface-container-highest transition-none" (click)="joinSession('billboard')">DASHBOARD</button>
                <button class="bg-surface text-primary border border-outline-variant font-label-caps py-2 px-4 hover:bg-surface-container-highest transition-none" (click)="joinSession('support')">IT_SUPPORT_SHELL</button>
                <button class="bg-surface text-primary border border-outline-variant font-label-caps py-2 px-4 hover:bg-surface-container-highest transition-none" (click)="joinSession('3d')">3D_FLYTHROUGH</button>
            </div>

            <div class="mt-4 pt-4 border-t border-outline-variant text-center">
                <div class="font-data-sm text-secondary uppercase tracking-widest mb-4">PROTAGONIST_UPLINKS</div>
                <div class="flex flex-wrap gap-2 justify-center">
                    <button *ngFor="let p of protagonistList" class="bg-surface text-primary border border-outline-variant font-label-caps py-2 px-4 hover:bg-primary hover:text-on-primary transition-none" (click)="joinSession('player', p.id)">{{p.name}} [{{p.role}}]</button>
                </div>
            </div>
        </div>
    </div>"""

template = re.sub(r'    <!-- LOBBY SCREEN -->.*?</div>\n\n    <!-- MAIN DASHBOARD -->', new_lobby_block + '\n\n    <!-- MAIN DASHBOARD -->', template, flags=re.DOTALL)

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'w') as f:
    f.write(template)

print("Removed scrolling and updated lobby.")
