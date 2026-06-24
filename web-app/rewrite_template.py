import re

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'r') as f:
    template = f.read()

# Generate the new GM block
new_gm_block = """      @defer (when isGmMode()) {
        <!-- GM View Tailwind Re-design -->
        <div class="bg-background text-on-background h-screen w-screen overflow-hidden flex flex-col font-body-main text-body-main selection:bg-primary selection:text-on-primary">
            <!-- TopAppBar -->
            <header class="bg-surface text-primary font-data-sm text-data-sm flex justify-between items-center px-edge-margin w-full shrink-0 h-10 border-b border-outline-variant z-20">
                <div class="font-headline-md text-headline-md font-bold text-primary tracking-tighter uppercase flex items-center gap-4">
                    ZERO SUM <span class="text-secondary">GM_TERM_01</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-data-sm text-secondary">SESSION:</span>
                    <strong class="font-data-lg text-primary bg-surface-container-highest px-2 border border-outline-variant">{{ sessionId() }}</strong>
                    <button class="bg-primary text-on-primary px-2 hover:bg-surface-tint border border-primary transition-none" (click)="publishMap()">SYNC_MAP</button>
                    <button class="bg-surface text-primary px-2 hover:bg-surface-container-highest border border-outline-variant transition-none" (click)="show3d.set(!show3d())">3D/2D_TOGGLE</button>
                </div>
            </header>

            <main class="flex-1 grid grid-cols-1 lg:grid-cols-4 grid-rows-2 gap-[1px] bg-outline-variant overflow-hidden">
                <!-- Center Map (Col 2-3, Row 1-2) -->
                <section class="lg:col-span-2 lg:row-span-2 bg-surface flex flex-col relative overflow-hidden group">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary flex items-center gap-2">
                            <span class="h-2 w-2 rounded-none bg-primary animate-blink"></span>
                            TACTIC_MAP // LOCAL_GRID
                        </div>
                        <div class="font-data-sm text-data-sm text-secondary">FEED: SECURE</div>
                    </div>
                    <div class="flex-1 relative overflow-hidden bg-surface-container">
                        <ng-container *ngIf="!show3d(); else threeDViewGM">
                            <div class="absolute inset-0 w-full h-full">
                                <app-pixi-map 
                                    [mode]="'gm'"
                                    [characters]="gameState().characters || {}"
                                    [activePlayerId]="activePlayerId()"
                                    [paintMode]="activePaintMode()"
                                    [currentLevel]="currentLevel()"
                                    (cellClicked)="onCanvasCellClicked($event)" 
                                    (roomClicked)="onCanvasRoomClicked($event)"
                                    (cellPainted)="onCellPainted($event)"
                                    class="w-full h-full block">
                                </app-pixi-map>
                            </div>
                        </ng-container>
                        <ng-template #threeDViewGM>
                            <app-threejs-map [characters]="gameState().characters || {}" [mode]="'gm'" class="absolute inset-0 w-full h-full"></app-threejs-map>
                        </ng-template>
                    </div>
                </section>

                <!-- Left Tools (Col 1, Row 1-2) -->
                <section class="bg-surface flex flex-col overflow-hidden border-r border-outline-variant">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary">MAP_OPERATIONS // TOOLS</div>
                    </div>
                    <div class="flex-1 p-panel-padding overflow-y-auto no-scrollbar flex flex-col gap-4">
                        
                        <div class="border border-outline-variant p-2 flex flex-col gap-2 bg-surface-container-lowest">
                            <h3 class="font-label-caps text-primary border-b border-outline-variant pb-1">PROC_GEN & BLOCKS</h3>
                            <div class="grid grid-cols-2 gap-1">
                                <button class="border border-outline-variant bg-surface text-secondary hover:text-primary hover:bg-surface-container py-1 font-data-sm" [ngClass]="{'bg-primary text-on-primary': activePrefab() === 'corridor'}" (click)="selectPrefab('corridor')">CORRIDOR</button>
                                <button class="border border-outline-variant bg-surface text-secondary hover:text-primary hover:bg-surface-container py-1 font-data-sm" [ngClass]="{'bg-primary text-on-primary': activePrefab() === 'l_junction'}" (click)="selectPrefab('l_junction')">L-JUNC</button>
                                <button class="border border-outline-variant bg-surface text-secondary hover:text-primary hover:bg-surface-container py-1 font-data-sm" [ngClass]="{'bg-primary text-on-primary': activePrefab() === 'medbay'}" (click)="selectPrefab('medbay')">MEDBAY</button>
                                <button class="border border-outline-variant bg-surface text-secondary hover:text-primary hover:bg-surface-container py-1 font-data-sm" [ngClass]="{'bg-primary text-on-primary': activePrefab() === 'data_terminal'}" (click)="selectPrefab('data_terminal')">TERMINAL</button>
                            </div>
                            <button class="border border-primary bg-primary text-on-primary py-2 font-label-caps hover:bg-surface-tint mt-2" (click)="generateProceduralFacility()">GEN_FACILITY</button>
                            <div class="flex gap-1 mt-1">
                                <button class="flex-1 border border-outline-variant py-1 font-data-sm" [ngClass]="{'bg-primary text-on-primary': currentLevel() === 1, 'bg-surface text-secondary': currentLevel() !== 1}" (click)="currentLevel.set(1)">LEVEL_1</button>
                                <button class="flex-1 border border-outline-variant py-1 font-data-sm" [ngClass]="{'bg-primary text-on-primary': currentLevel() === 2, 'bg-surface text-secondary': currentLevel() !== 2}" (click)="currentLevel.set(2)">LEVEL_2</button>
                            </div>
                        </div>

                        <div class="border border-outline-variant p-2 flex flex-col gap-2 bg-surface-container-lowest">
                            <h3 class="font-label-caps text-primary border-b border-outline-variant pb-1">PAINT_OVERRIDES</h3>
                            <div class="grid grid-cols-2 gap-1">
                                <button class="border border-outline-variant py-1 font-data-sm hover:bg-surface-container" [class.bg-primary]="activePaintMode() === 'wall'" [class.text-on-primary]="activePaintMode() === 'wall'" (click)="activePaintMode.set('wall')">WALL</button>
                                <button class="border border-outline-variant py-1 font-data-sm hover:bg-surface-container" [class.bg-primary]="activePaintMode() === 'breakable_wall'" [class.text-on-primary]="activePaintMode() === 'breakable_wall'" (click)="activePaintMode.set('breakable_wall')">BREAK</button>
                                <button class="border border-outline-variant py-1 font-data-sm hover:bg-surface-container" [class.bg-primary]="activePaintMode() === 'door_locked'" [class.text-on-primary]="activePaintMode() === 'door_locked'" (click)="activePaintMode.set('door_locked')">DOOR_L</button>
                                <button class="border border-outline-variant py-1 font-data-sm hover:bg-surface-container" [class.bg-primary]="activePaintMode() === 'door_open'" [class.text-on-primary]="activePaintMode() === 'door_open'" (click)="activePaintMode.set('door_open')">DOOR_O</button>
                                <button class="border border-outline-variant py-1 font-data-sm hover:bg-surface-container" [class.bg-primary]="activePaintMode() === 'cctv'" [class.text-on-primary]="activePaintMode() === 'cctv'" (click)="activePaintMode.set('cctv')">CCTV</button>
                                <button class="border border-outline-variant py-1 font-data-sm hover:bg-surface-container" [class.bg-primary]="activePaintMode() === 'furniture'" [class.text-on-primary]="activePaintMode() === 'furniture'" (click)="activePaintMode.set('furniture')">TERM</button>
                                <button class="border border-outline-variant py-1 font-data-sm hover:bg-surface-container col-span-2" [class.bg-error]="activePaintMode() === 'floor'" [class.text-on-error]="activePaintMode() === 'floor'" (click)="activePaintMode.set('floor')">ERASE_CELL</button>
                            </div>
                        </div>

                    </div>
                </section>

                <!-- Right Top: Heat & Actions (Col 4, Row 1) -->
                <section class="bg-surface flex flex-col overflow-hidden">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary">DIRECTOR_OVERRIDES</div>
                    </div>
                    <div class="flex-1 p-panel-padding flex flex-col gap-2 overflow-y-auto no-scrollbar">
                        <div class="border border-error p-2 bg-error-container text-on-error-container flex flex-col gap-1 items-center justify-center">
                            <h3 class="font-label-caps tracking-widest text-error">GLOBAL_HEAT_LEVEL</h3>
                            <div class="font-display-lg text-error tracking-tighter">{{ heatLevel() }}</div>
                            <div class="flex gap-2 w-full mt-2">
                                <button class="flex-1 border border-error bg-surface text-error py-1 hover:bg-error hover:text-on-error transition-none" (click)="updateHeat(-1)">DECREASE</button>
                                <button class="flex-1 border border-error bg-surface text-error py-1 hover:bg-error hover:text-on-error transition-none" (click)="updateHeat(1)">INCREASE</button>
                            </div>
                        </div>

                        <div class="border border-outline-variant p-2 flex flex-col gap-1 bg-surface-container-lowest mt-2">
                            <h3 class="font-label-caps text-primary border-b border-outline-variant pb-1">ROOM_PROPS</h3>
                            <div *ngIf="selectedRoomId(); else noSelection" class="flex flex-col gap-2 mt-2">
                                <input type="text" [ngModel]="getRoomTag()" (ngModelChange)="updateRoomTag($event)" placeholder="Room Tag" class="bg-surface border border-outline-variant text-primary font-data-sm px-2 py-1 w-full outline-none focus:border-primary" />
                                <select [ngModel]="getRoomVfx()" (ngModelChange)="updateRoomVfx($event)" class="bg-surface border border-outline-variant text-primary font-data-sm px-2 py-1 w-full outline-none focus:border-primary">
                                    <option value="none">VFX: NONE</option>
                                    <option value="flash_red_alert">VFX: RED_ALARM</option>
                                    <option value="flicker_blue_data">VFX: DATA_CORRUPTION</option>
                                </select>
                            </div>
                            <ng-template #noSelection>
                                <div class="font-data-sm text-secondary py-2 text-center">NO_ROOM_SELECTED</div>
                            </ng-template>
                        </div>
                    </div>
                </section>

                <!-- Right Bottom: Commands (Col 4, Row 2) -->
                <section class="bg-surface flex flex-col overflow-hidden">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary">SQUAD_TRAUMA_INJECTION</div>
                    </div>
                    <div class="flex-1 p-panel-padding flex flex-col gap-2 justify-center bg-surface-container-lowest">
                        <button class="w-full border border-primary bg-surface text-primary font-label-caps py-3 hover:bg-surface-container-highest transition-none" (click)="deploySquad()">DEPLOY_SQUAD</button>
                        <button class="w-full border border-error bg-surface text-error font-label-caps py-3 hover:bg-error-container transition-none" (click)="dealDamageToSquad()">INFLICT_20_DMG</button>
                        <button class="w-full border border-error bg-surface text-error font-label-caps py-3 hover:bg-error-container transition-none" (click)="inflictStressToSquad()">INFLICT_20_STRESS</button>
                        <button class="w-full border border-primary bg-primary text-on-primary font-label-caps py-3 hover:bg-surface-tint transition-none mt-4" (click)="spawnTraumaEvent()">LOG_CASUALTY</button>
                    </div>
                </section>

            </main>
            
            <footer class="bg-surface-container-lowest text-on-surface font-data-sm h-8 border-t border-outline-variant flex justify-between items-center px-edge-margin w-full shrink-0 z-20">
                <div class="flex items-center gap-4 text-secondary">
                    <span>SYS_UPTIME: 99.9%</span>
                    <span>AUTHORIZATION: GAME_MASTER</span>
                </div>
            </footer>
        </div>
      }"""

# Generate the new Spectator block
new_spec_block = """      @defer (when isSpectatorMode()) {
        <!-- Spectator View Tailwind Re-design -->
        <div class="bg-background text-on-background h-screen w-screen overflow-hidden flex flex-col font-body-main text-body-main selection:bg-primary selection:text-on-primary">
            <!-- TopAppBar -->
            <header class="bg-surface text-primary font-data-sm text-data-sm flex justify-between items-center px-edge-margin w-full shrink-0 h-10 border-b border-outline-variant z-20">
                <div class="font-headline-md text-headline-md font-bold text-primary tracking-tighter uppercase flex items-center gap-4">
                    TWITCH <span class="text-secondary">VOYEUR_FEED</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-data-sm text-secondary">CHAOS_MARKET:</span>
                    <strong class="font-data-lg text-primary bg-surface-container-highest px-2 border border-outline-variant">${{ chaosMarketValue() }}</strong>
                    <span class="font-data-sm text-secondary ml-4">GLOBAL_HEAT:</span>
                    <strong class="font-data-lg text-error bg-error-container px-2 border border-error">{{ heatLevel() }}</strong>
                    <button class="bg-surface text-primary px-2 hover:bg-surface-container-highest border border-outline-variant transition-none ml-4" (click)="show3d.set(!show3d())">3D/2D_TOGGLE</button>
                </div>
            </header>

            <main class="flex-1 grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-[1px] bg-outline-variant overflow-hidden">
                
                <!-- Left: CAMS (Col 1, Row 1-2) -->
                <section class="bg-surface flex flex-col overflow-hidden border-r border-outline-variant">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary">LIVE_CAMS // ASSET_UPLINK</div>
                    </div>
                    <div class="flex-1 p-panel-padding overflow-y-auto no-scrollbar flex flex-col gap-4 bg-surface-container-lowest">
                        <div *ngFor="let key of getCharacterKeys()" class="relative aspect-video bg-black border border-outline-variant flex items-center justify-center overflow-hidden">
                            <!-- Simulated noise / blank feed -->
                            <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px);"></div>
                            <div class="absolute top-1 left-1 bg-black border border-primary text-primary font-data-sm text-[10px] px-1 z-10">{{ gameState().characters[key].name }}</div>
                            <div class="text-secondary font-data-sm text-xs">[FEED_ENCRYPTED]</div>
                        </div>
                    </div>
                </section>

                <!-- Center: Map (Col 2-3, Row 1-2) -->
                <section class="md:col-span-2 md:row-span-2 bg-surface flex flex-col relative overflow-hidden group">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary flex items-center gap-2">
                            <span class="h-2 w-2 rounded-none bg-primary animate-blink"></span>
                            THEATER_OVERVIEW
                        </div>
                    </div>
                    <div class="flex-1 relative overflow-hidden bg-surface-container">
                        <ng-container *ngIf="!show3d(); else threeDViewSpec">
                            <app-pixi-map [mode]="'spectator'" [characters]="gameState().characters || {}" [currentLevel]="currentLevel()" class="absolute inset-0 w-full h-full block"></app-pixi-map>
                        </ng-container>
                        <ng-template #threeDViewSpec>
                            <app-threejs-map [characters]="gameState().characters || {}" [mode]="'spectator'" class="absolute inset-0 w-full h-full block"></app-threejs-map>
                        </ng-template>
                        <div class="absolute inset-0 border-[1px] border-primary/20 m-4 pointer-events-none"></div>
                    </div>
                </section>

                <!-- Right Top: Squad Status (Col 4, Row 1) -->
                <section class="bg-surface flex flex-col overflow-hidden">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary">SQUAD_VITALS</div>
                    </div>
                    <div class="flex-1 p-panel-padding overflow-y-auto no-scrollbar flex flex-col gap-2">
                        <div *ngFor="let key of getCharacterKeys()" class="border border-outline-variant p-2 flex flex-col gap-1 bg-surface-container-lowest" [ngClass]="{'border-error bg-error-container': (gameState().characters[key].stats?.hp_current || 100) <= 0}">
                            <div class="flex justify-between items-center border-b border-outline-variant pb-1" [ngClass]="{'border-error/50': (gameState().characters[key].stats?.hp_current || 100) <= 0}">
                                <span class="font-label-caps text-label-caps text-primary" [ngClass]="{'text-error': (gameState().characters[key].stats?.hp_current || 100) <= 0}">{{ gameState().characters[key].name }}</span>
                            </div>
                            <div class="flex justify-between items-end mt-1 font-data-sm">
                                <div>HP: <span class="font-data-lg" [ngClass]="{'text-error': (gameState().characters[key].stats?.hp_current || 100) <= 20}">{{ gameState().characters[key].stats?.hp_current || 100 }}</span></div>
                                <div>STR: <span class="font-data-lg text-secondary">{{ gameState().characters[key].stats?.stress_current || 0 }}</span></div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Right Bottom: Feed & Clocks (Col 4, Row 2) -->
                <section class="bg-surface flex flex-col overflow-hidden">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary">THREATS & FEED</div>
                    </div>
                    <div class="flex-1 p-panel-padding overflow-y-auto no-scrollbar flex flex-col gap-4 bg-surface-container-lowest">
                        <!-- Clocks -->
                        <div class="flex flex-wrap gap-2">
                            <app-progress-clock *ngFor="let clock of getPublicClocks()" 
                                [name]="clock.name" [segments]="clock.segments" [filled]="clock.filled" [color]="clock.color" class="scale-75 origin-top-left">
                            </app-progress-clock>
                        </div>
                        <!-- Feed -->
                        <div class="flex-1 overflow-y-auto font-data-sm text-secondary flex flex-col gap-1">
                            <div *ngFor="let roll of gameState().recentRolls || []" class="border-b border-outline-variant/30 py-1 hover:bg-surface-container transition-none flex gap-2">
                                <span class="w-16 shrink-0">{{ roll.timestamp | date:'HH:mm:ss' }}</span>
                                <span class="text-primary">{{ roll.player }}</span>
                                <span>-></span>
                                <span class="font-bold" [ngClass]="{'text-error': roll.result === 'Fail', 'text-primary': roll.result !== 'Fail'}">{{ roll.result }}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
      }"""

# Replace the old blocks
template = re.sub(r'      @defer \(when isGmMode\(\)\) \{.*?\n      \}', new_gm_block, template, flags=re.DOTALL)
template = re.sub(r'      @defer \(when isSpectatorMode\(\)\) \{.*?\n      \}', new_spec_block, template, flags=re.DOTALL)

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'w') as f:
    f.write(template)

print("Template updated successfully.")
