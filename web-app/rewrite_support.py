import re

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'r') as f:
    template = f.read()

# Replace Support Mode
new_support_block = """      @defer (when isSupportMode()) {
        <!-- Netrunner Shell Tailwind Re-design -->
        <div class="bg-background text-on-background h-screen w-screen overflow-hidden flex flex-col font-body-main text-body-main selection:bg-primary selection:text-on-primary">
            <header class="bg-surface text-primary font-data-sm flex justify-between items-center px-edge-margin w-full shrink-0 h-10 border-b border-outline-variant z-20">
                <div class="font-headline-md font-bold text-primary tracking-tighter uppercase flex items-center gap-4">
                    ICE_TERMINAL // <span class="text-secondary">SYS_ADMIN</span>
                </div>
                <button class="bg-surface text-primary px-4 border border-outline-variant hover:bg-surface-container-highest transition-none" (click)="connectBleBeacon()">[BLE_AIRGAP] CONNECT_BEACON</button>
            </header>
            <main class="flex-1 bg-surface-container-lowest p-8 flex flex-col gap-4 relative overflow-hidden">
                <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                <div class="flex-1 font-data-lg text-primary overflow-hidden flex flex-col-reverse" id="terminalOutput">
                    <div *ngFor="let log of terminalLogs()" class="py-1">> {{ log }}</div>
                </div>
                <div class="flex items-center gap-2 border-t border-outline-variant pt-4 mt-auto">
                    <span class="font-data-lg text-primary">$</span>
                    <input type="text" [(ngModel)]="terminalCommand" (keyup.enter)="executeIceCommand()" placeholder="grep the mainframe..." autofocus class="flex-1 bg-transparent text-primary font-data-lg border-none outline-none focus:ring-0 placeholder:text-secondary" />
                </div>
            </main>
        </div>
      }"""

# Replace 3D Mode
new_3d_block = """      @defer (when is3dMode()) {
        <!-- 3D View Tailwind Re-design -->
        <div class="bg-background text-on-background h-screen w-screen overflow-hidden flex flex-col font-body-main text-body-main selection:bg-primary selection:text-on-primary">
            <header class="bg-surface text-primary font-data-sm flex justify-between items-center px-edge-margin w-full shrink-0 h-10 border-b border-outline-variant z-20">
                <div class="font-headline-md font-bold text-primary tracking-tighter uppercase flex items-center gap-4">
                    THEATER_FLYTHROUGH // <span class="text-secondary">3D_RENDER</span>
                </div>
                <button class="bg-error text-on-error px-4 border border-error hover:bg-error-container hover:text-error transition-none font-bold" (click)="mode.set(null)">EXIT_FLYTHROUGH</button>
            </header>
            <main class="flex-1 relative bg-black overflow-hidden">
                <app-threejs-map [characters]="gameState().characters || {}" [mode]="'3d'" class="absolute inset-0 w-full h-full block"></app-threejs-map>
            </main>
        </div>
      }"""

template = re.sub(r'      @defer \(when isSupportMode\(\)\) \{.*?\n      \}', new_support_block, template, flags=re.DOTALL)
template = re.sub(r'      @defer \(when is3dMode\(\)\) \{.*?\n      \}', new_3d_block, template, flags=re.DOTALL)

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'w') as f:
    f.write(template)

print("Updated Support and 3D views.")
