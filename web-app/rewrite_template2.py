import re

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'r') as f:
    template = f.read()

# Generate the new Player block
new_player_block = """      @defer (when isPlayerMode()) {
        <!-- Player View Tailwind Re-design -->
        <div class="bg-background text-on-background h-screen w-screen overflow-hidden flex flex-col font-body-main text-body-main selection:bg-primary selection:text-on-primary">
            <!-- TopAppBar -->
            <header class="bg-surface text-primary font-data-sm text-data-sm flex justify-between items-center px-edge-margin w-full shrink-0 h-10 border-b border-outline-variant z-20">
                <div class="font-headline-md text-headline-md font-bold text-primary tracking-tighter uppercase flex items-center gap-4">
                    UPLINK // <span class="text-secondary">{{ getPlayerName() }}</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-data-sm text-secondary">ROLE:</span>
                    <strong class="font-data-lg text-primary">{{ getPlayerRole() }}</strong>
                    <div class="h-4 border-l border-outline-variant mx-2"></div>
                    <span class="font-data-sm text-secondary">HEAT:</span>
                    <strong class="font-data-lg text-error bg-error-container px-2 border border-error">{{ heatLevel() }}</strong>
                    <button class="bg-surface text-primary px-2 hover:bg-surface-container-highest border border-outline-variant transition-none ml-4" (click)="show3d.set(!show3d())">3D/2D_TOGGLE</button>
                    <button class="bg-error text-on-error font-bold px-2 border border-error transition-none hover:bg-error-container hover:text-error" (click)="triggerEmergencyHeal()">EMERGENCY_HEAL</button>
                </div>
            </header>

            <main class="flex-1 grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-[1px] bg-outline-variant overflow-hidden">
                <!-- Left: Inventory (Col 1, Row 1-2) -->
                <section class="bg-surface flex flex-col overflow-hidden border-r border-outline-variant">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary">INVENTORY // LOADOUT</div>
                    </div>
                    <div class="flex-1 p-panel-padding overflow-y-auto no-scrollbar flex flex-col gap-2 bg-surface-container-lowest">
                        <div draggable="true" (dragstart)="onDragStart($event, 'usb_drive')" class="border border-primary border-dashed p-2 text-center cursor-grab bg-surface text-primary font-label-caps hover:bg-surface-container-highest">USB_DRIVE</div>
                        <div draggable="true" (dragstart)="onDragStart($event, 'c4_explosive')" class="border border-primary border-dashed p-2 text-center cursor-grab bg-surface text-primary font-label-caps hover:bg-surface-container-highest">C4_CHARGE</div>
                    </div>
                </section>

                <!-- Center: Map (Col 2-3, Row 1-2) -->
                <section class="md:col-span-2 md:row-span-2 bg-surface flex flex-col relative overflow-hidden group" (dragover)="$event.preventDefault()" (drop)="onDropItem($event)">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary flex items-center gap-2">
                            <span class="h-2 w-2 rounded-none bg-primary animate-blink"></span>
                            TACTICAL_OVERVIEW
                        </div>
                    </div>
                    <div class="flex-1 relative overflow-hidden bg-surface-container">
                        <ng-container *ngIf="!show3d(); else threeDViewPlayer">
                            <app-pixi-map [mode]="'player'" [characters]="gameState().characters || {}" [activePlayerId]="activePlayerId()" [currentLevel]="currentLevel()" (playerMoved)="onPlayerMoved($event)" class="absolute inset-0 w-full h-full block"></app-pixi-map>
                        </ng-container>
                        <ng-template #threeDViewPlayer>
                            <app-threejs-map [characters]="gameState().characters || {}" [mode]="'player'" class="absolute inset-0 w-full h-full block"></app-threejs-map>
                        </ng-template>
                        <div class="absolute inset-0 border-[1px] border-primary/20 m-4 pointer-events-none"></div>
                    </div>
                </section>

                <!-- Right Top: Vitals (Col 4, Row 1) -->
                <section class="bg-surface flex flex-col overflow-hidden">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary">PERSONAL_VITALS</div>
                    </div>
                    <div class="flex-1 p-panel-padding overflow-y-auto no-scrollbar flex flex-col gap-2 bg-surface-container-lowest" *ngIf="myCharStats()">
                        <div class="border border-outline-variant p-2 flex flex-col gap-1 bg-surface">
                            <div class="flex justify-between items-center border-b border-outline-variant pb-1">
                                <span class="font-label-caps text-primary">HP_INTEGRITY</span>
                            </div>
                            <div class="font-display-lg text-primary tracking-tighter" [ngClass]="{'text-error': myCharStats().hp_current <= 20}">{{ myCharStats().hp_current }}</div>
                        </div>
                        <div class="border border-outline-variant p-2 flex flex-col gap-1 bg-surface">
                            <div class="flex justify-between items-center border-b border-outline-variant pb-1">
                                <span class="font-label-caps text-primary">STRESS_LOAD</span>
                            </div>
                            <div class="font-display-lg text-error tracking-tighter">{{ myCharStats().stress_current }}</div>
                        </div>
                        <div class="border border-outline-variant p-2 flex flex-col gap-1 bg-surface">
                            <div class="flex justify-between items-center border-b border-outline-variant pb-1">
                                <span class="font-label-caps text-primary">STEALTH_RATING</span>
                            </div>
                            <div class="font-display-lg text-secondary tracking-tighter">{{ myCharStats().stealth_total }}</div>
                        </div>
                    </div>
                </section>

                <!-- Right Bottom: Actions (Col 4, Row 2) -->
                <section class="bg-surface flex flex-col overflow-hidden">
                    <div class="h-8 border-b border-outline-variant bg-surface-container-lowest flex items-center px-density-tight shrink-0">
                        <div class="font-label-caps text-label-caps text-primary">ACTION_EXECUTION</div>
                    </div>
                    <div class="flex-1 p-panel-padding overflow-y-auto no-scrollbar flex flex-col gap-2 justify-center bg-surface-container-lowest">
                        <button class="w-full border border-primary bg-surface text-primary font-label-caps text-lg py-3 hover:bg-surface-container-highest hover:border-b-2 active:bg-primary active:text-on-primary transition-none" (click)="playerAction('attack')">EXEC_ATTACK</button>
                        <button class="w-full border border-primary bg-surface text-primary font-label-caps text-lg py-3 hover:bg-surface-container-highest hover:border-b-2 active:bg-primary active:text-on-primary transition-none" (click)="playerAction('sneak')">EXEC_SNEAK</button>
                        <button class="w-full border border-primary bg-surface text-primary font-label-caps text-lg py-3 hover:bg-surface-container-highest hover:border-b-2 active:bg-primary active:text-on-primary transition-none" (click)="playerAction('dash')">EXEC_DASH</button>
                        <button class="w-full border border-primary bg-surface text-primary font-label-caps text-lg py-3 hover:bg-surface-container-highest hover:border-b-2 active:bg-primary active:text-on-primary transition-none" (click)="playerAction('investigate')">EXEC_INVESTIGATE</button>
                        <button class="w-full border border-error bg-surface text-error font-label-caps text-lg py-3 hover:bg-error-container hover:border-b-2 active:bg-error active:text-on-error transition-none" (click)="playerAction('sabotage')">EXEC_SABOTAGE</button>
                    </div>
                </section>
            </main>
        </div>
      }"""

# Generate the new Billboard block
new_billboard_block = """      @defer (when isBillboardMode()) {
        <!-- Billboard View Tailwind Re-design -->
        <div class="bg-background text-on-background h-screen w-screen overflow-hidden flex flex-col font-body-main text-body-main selection:bg-primary selection:text-on-primary relative" [ngClass]="{'bg-error-container': heatLevel() >= 8 || recentTrauma()}">
            <div *ngIf="heatLevel() >= 8 || recentTrauma()" class="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(186,26,26,0.3)_100%)] pointer-events-none z-0"></div>
            
            <div class="flex-1 flex flex-col p-10 z-10 relative">
                <h1 class="font-display-lg text-[10vw] leading-none text-center uppercase tracking-tighter" [ngClass]="{'text-error animate-blink': heatLevel() >= 8, 'text-primary': heatLevel() < 8}">GLOBAL HEAT: {{ heatLevel() }}</h1>
                
                <h2 *ngIf="recentTrauma()" class="font-display-lg text-[4vw] leading-none text-center text-error mt-4">
                    LIFE SUPPORT REDIRECTED.<br/>CASUALTY: {{ recentTrauma().civilian }}
                </h2>
                
                <div *ngIf="!recentTrauma()" class="flex flex-1 gap-10 mt-10 overflow-hidden">
                    <!-- Operative Status -->
                    <div class="flex-1 bg-surface border border-outline-variant p-8 flex flex-col justify-evenly items-center text-center shadow-lg">
                        <h3 class="font-headline-md text-primary border-b border-outline-variant pb-4 w-full uppercase">OPERATIVE STATUS</h3>
                        
                        <div class="w-full mt-4">
                            <div class="font-label-caps text-secondary text-lg">SQUAD VITALITY (HP)</div>
                            <div class="font-data-lg text-[6vw] leading-none text-tertiary-fixed-dim font-bold">{{ squadHpAvg() }}%</div>
                            <div class="font-data-sm text-secondary mt-2">Measures average physical integrity.</div>
                        </div>
                        
                        <div class="w-full mt-4">
                            <div class="font-label-caps text-secondary text-lg">ALLOSTATIC LOAD (STRESS)</div>
                            <div class="font-data-lg text-[6vw] leading-none text-error font-bold">{{ squadStressAvg() }}%</div>
                            <div class="font-data-sm text-secondary mt-2">High levels lead to psychological deterioration.</div>
                        </div>
                        
                        <div class="w-full mt-4">
                            <div class="font-label-caps text-secondary text-lg">CONFIRMED CASUALTIES</div>
                            <div class="font-data-lg text-[6vw] leading-none text-primary font-bold">{{ traumaCount() }}</div>
                            <div class="font-data-sm text-secondary mt-2">Collateral damage logged.</div>
                        </div>
                    </div>
                    
                    <!-- Twitch Chaos -->
                    <div class="flex-1 bg-surface border border-outline-variant p-8 flex flex-col justify-evenly items-center text-center shadow-lg">
                        <h3 class="font-headline-md text-primary border-b border-outline-variant pb-4 w-full uppercase">SPECTATOR OVERRIDE</h3>
                        
                        <div class="font-body-main text-secondary text-2xl max-w-[90%] mt-4">
                            YOU ARE AUTHORIZED TO INFLUENCE THE OPERATION. USE TWITCH CHAT TO INJECT CHAOS.
                        </div>
                        
                        <div class="flex flex-col gap-4 w-full mt-8">
                            <div class="bg-surface-container-lowest border border-outline-variant p-6">
                                <span class="font-display-lg text-4xl text-primary">TYPE <span class="text-tertiary-fixed-dim bg-primary px-2">!chaos</span> IN CHAT</span><br/>
                                <span class="font-data-sm text-secondary text-xl mt-2 block">Adds $10 to the Market.</span>
                            </div>
                            <div class="bg-surface-container-lowest border border-outline-variant p-6">
                                <span class="font-display-lg text-4xl text-primary">CHEER BITS</span><br/>
                                <span class="font-data-sm text-secondary text-xl mt-2 block">Adds proportional Chaos.</span>
                            </div>
                        </div>
                        
                        <h3 class="font-display-lg text-[5vw] leading-none text-primary border-4 border-dashed border-primary p-6 mt-8 w-full uppercase">MARKET: $ {{ chaosMarketValue() }}</h3>
                    </div>
                </div>
            </div>
        </div>
      }"""

# Replace the old blocks
template = re.sub(r'      @defer \(when isPlayerMode\(\)\) \{.*?\n      \}', new_player_block, template, flags=re.DOTALL)
template = re.sub(r'      @defer \(when isBillboardMode\(\)\) \{.*?\n      \}', new_billboard_block, template, flags=re.DOTALL)

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/app.component.html', 'w') as f:
    f.write(template)

print("Template updated successfully.")
