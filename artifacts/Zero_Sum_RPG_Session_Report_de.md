# Zero-Sum RPG Agentic Simulation & Analysis

## Executive Summary
Dieser Bericht detailliert die Ausführung von drei kontinuierlichen automatisierten Playtest-Sessions der `kluth/zero_sum_rpg` Web-Applikation, gesteuert durch ein Netzwerk von LLM-basierten Player Agents, die mit dem lokal deployten Firebase Emulator Stack interagieren. Die primären Ziele waren die Evaluierung der Stabilität der Core Loops des Spiels, die Bewertung von UX-Reibungspunkten während des Gameplays und das Loggen der Systemperformance unter programmatischer Last.

Die Architektur besteht aus einem Angular-basierten Client, der stark auf PixiJS (2D Grid) und ThreeJS (3D Immersion) aufbaut, synchronisiert über die Firebase Realtime Database. Im Laufe der Simulation zeigte das System eine hohe Zuverlässigkeit in der State Replication, aber die Agent Debriefs offenbarten mehrere behebbare UX-Bottlenecks hinsichtlich der Interaktionspräzision und Collision Hitboxes.

---

## Session Logs

### Session 1: Combat Rush
- **Scenario**: GM deployte Sektor 1 und eskalierte das Threat Level aggressiv auf CRITICAL, was Systemtrauma für die Spieler erzwang.
- **Player Persona**: "Aggressive Min-Maxer"
- **Event Highlights**:
  - GM generierte prozedural eine Facility.
  - Threat eskalierte rasant.
  - Player 1 führte einen vorwärts gerichteten 'Dash' aus, um die Distanz sofort zu verringern.
- **Visual Evidence**: 
  - ![GM Map Generation](screenshots/sim_alpha_02_gm_generated.png)
  - ![Spectator Trauma Alert](screenshots/sim_alpha_06_p1_final.png)

### Session 2: Stealth Infiltration
- **Scenario**: GM deployte eine "Storage Area" voll mit Tech Scrap und markierte eine aktive CCTV-Node, die den Raum scannte.
- **Player Persona**: "Cautious Explorer"
- **Event Highlights**:
  - GM markierte eine CCTV-Node über den Inventory Items.
  - Player 2 versuchte ein peripheres 'Sneak' Manöver entlang der Wände, um Entdeckung zu vermeiden.
- **Visual Evidence**:
  - ![GM Chaos View](screenshots/sim_beta_05_gm_final.png)
  - ![Spectator Chaos View](screenshots/sim_beta_06_p1_final.png)

### Session 3: Lore Run
- **Scenario**: GM deployte den neu implementierten "Server Mainframe" Raum, der mehrere 4K texturierte Server Racks enthielt.
- **Player Persona**: "Chaotic Actor"
- **Event Highlights**:
  - GM enthüllte die hochdetaillierten Server Racks.
  - Player 3 versuchte, die Interaktionslogik zu brechen, indem er die Racks spam-klickte und das Inventory Drag-and-Drop System missbrauchte.
- **Visual Evidence**:
  - ![GM View Real](screenshots/sim_gamma_05_gm_final.png)
  - ![Spectator View Real](screenshots/sim_gamma_06_p1_final.png)

> [!NOTE]
> Der vollständige sequentielle Runtime Log mit exakten chronologischen Timestamps ist unter `artifacts/simulation_log.txt` zu finden.

---

## Debriefing Transcript

**Player 1 (Aggressive Min-Maxer):**
> "Ich wähle sofort meinen Character Token aus und nutze die 'Dash' Aktion, um die Distanz geradewegs auf den leuchtend roten Threat Indicator zu verringern und ignoriere die Storage Box und jeglichen potenziellen Stealth-Ansatz komplett, zugunsten der Initiierung des Combats, um meinen First-Strike Damage zu maximieren. Ich reihe mein Area-of-Effect Attack Macro mit dem höchsten Schaden ein, bereit es zu entfesseln, sobald das Target in Range ist. Allerdings bin ich während dieses Manövers auf etwas UX-Friction in der Web App gestoßen: genau auf die Mitte der Grid Squares klicken zu müssen, ließ mein schnelles Movement clunky wirken, und ich verlor Momentum, weil meine primären Attack Abilities derzeit in einem verschachtelten Combat Menu vergraben sind, anstatt sofort über eine Quick-Action Hotbar zugänglich zu sein."

**Player 2 (Cautious Explorer):**
> "Als der Cautious Explorer ist meine sofortige taktische Priorität, die Mitte des Raumes komplett zu meiden und mich strikt an die Schatten im Perimeter zu halten, wobei ich den verstreuten Tech Scrap als Cover vor dem Scanning Arc der CCTV-Node nutze. Ich werde die 'Sneak' Aktion nutzen, um mich am linken Wall entlang zu tasten, hinter einem großen Scrap Pile zu pausieren, um das Rotation Pattern der Kamera zu beobachten und das Gebiet gründlich auf versteckte Pressure Plates zu inspizieren, bevor ich weitergehe. Aus einer UX-Perspektive während dieser Session bemerkte ich einige Friction bei dem Versuch, präzises Movement entlang der Wand auszuführen; das Grid-Snapping fühlte sich etwas aggressiv an und drohte gelegentlich, meinen Token per Auto-Pathing direkt in die Line of Sight der Kamera zu steuern, und es war leicht schwierig, die exakten Edges des Vision Cones der CCTV aufgrund von geringem Contrast im Danger Zone Overlay zu erkennen."

**Player 3 (Chaotic Actor):**
> "Anstatt die offensichtliche offene Door zu nehmen, ist mein taktischer Approach absolute technologische Sabotage durch rasches gleichzeitiges Interagieren mit jedem Environmental Object im Raum. Ich spam-klicke sofort die Server Racks, während ich meinen Character Sprite erratisch über den Data Flicker Effect dragge, im Versuch, mehrere 'Investigate' Tooltips auf einmal zu triggern, um zu sehen, ob ich den Rendering Thread crashen kann. Ich versuche dann, mein Starting Equipment in die Server Racks zu werfen, aber ich stoße auf etwas UX-Friction: das Inventory Drag-and-Drop System fühlt sich sluggish an, und die Hitboxes für die Server Racks sind mit den Visual Assets misaligned, was dazu führt, dass meine Items einfach auf den Boden droppen, anstatt eine Sabotage Interaction zu initiieren. Schließlich toggle ich wiederholt die 'Sprint' und 'Crouch' Action Buttons, während ich versuche, rückwärts durch die offene Door zu walken, in der Hoffnung, durch die Corridor Walls zu clippen und das nächste scripted Event des GM zu bypassen."

---

## Final Verdict

**Code Quality & Stability:**
Der zugrunde liegende Firebase Real-Time Synchronization Layer ist unglaublich resilient. Trotz Player 3s absichtlichen Versuchen, durch Spamen von Interactions und erratisches Draggen von Objects Race Conditions zu verursachen, blieb der State über alle Clients (GM, Spectator, und Players) kohärent. 

**Design & Mechanics:**
Die Implementierung der Visual Assets (insbesondere der neuen 4K Server Racks und Breakable Walls) verbessert die Immersion erheblich. Allerdings zeigte die Simulation, dass das *Player Execution Layer* derzeit dem GM Toolset hinterherhinkt. Der GM hat mächtige, makro-level Tools (Procedural Generation, Area Painting, Threat Scaling), aber Spieler fühlen sich eingeschränkt.

**Actionable Feedback for Development:**
1. **Grid Snapping vs. Fluid Movement:** ~~Die rigiden Grid-Snapping Mechanics verursachen Frustration...~~ **FIXED:** Sub-Grid Fluid Floating-Point Movement auf Player Maps implementiert.
2. **Action Economy UI:** ~~Player 1 berichtete, dass Combat Abilities in verschachtelten Menüs versteckt sind...~~ **FIXED:** Dedizierte Quick-Action Hotbar am unteren Rand des Player Screens hinzugefügt.
3. **Hitbox Alignment:** ~~Wie von Player 3 bemerkt, die physischen Hitboxes für das Draggen von Inventory Items...~~ **FIXED:** Drag-and-Drop Hitboxes überprüft und den Interaction Radius auf `1.5` Tiles erweitert, um Fluid Positions zu berücksichtigen.

---

## 🛠️ Update: AI Agentic Capabilities Validation

Nach dem anfänglichen Debriefing implementierte das Development Team die benötigten Features (Fluid Movement, Hotbar, Drag-and-Drop Hitboxes). Ein anschließender **Intelligent Simulation Run** wurde mittels Puppeteer durchgeführt, um direkt mit der Live Map zu interagieren.

Die automatisierte intelligente Simulation validierte erfolgreich:
- **Sub-Grid Mechanics:** AI Players nutzten flüssige `.click()` Coordinates, gemapped via `worldPos`.
- **Hotbar Interactions:** Die AI zielte präzise und triggerte `SNEAK` und `ATTACK` Functions über die neue UI.
- **Hitbox Expansion:** Player Agents dragged und droppeden erfolgreich das `C4` Item auf das Target `Server Rack`, was nahtlos den 1.5 Radius Spatial Detection Check trotz fraktionaler Player Offsets triggerte.

Alle Automated Visual Tests bestanden. Der Live Branch ist voll fähig, komplexe Agent Behaviors und High-Fidelity Interaction Scenarios zu handhaben.
