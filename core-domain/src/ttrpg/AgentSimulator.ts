import { ResolutionEngine, RollRequest, DegreeOfSuccess } from './ResolutionEngine';

// ==========================================
// 1. Define the 8 Agent Personas
// ==========================================
type ExperienceLevel = 'Anfänger' | 'Casual' | 'Taktiker' | 'Veteran' | 'Chaos';

interface AgentPersona {
  id: string;
  name: string;
  role: string;
  level: ExperienceLevel;
  riskTolerance: number; // 0 to 1
  think(context: any): string;
  decideAction(context: any): { type: string; baseModifier: number; difficultyPenalty: number; apCost: number; payload: any };
}

const agents: AgentPersona[] = [
  {
    id: 'p1', name: 'Alice (The Noob)', role: 'Bystander', level: 'Anfänger', riskTolerance: 0.1,
    think: (ctx) => `This looks dangerous. Heat is ${ctx.heat}. I don't know the rules well, so I'll just try to hide or do something basic.`,
    decideAction: (ctx) => ({ type: 'sneak', baseModifier: 0, difficultyPenalty: ctx.heat > 5 ? 2 : 0, apCost: 1, payload: { target: 'shadows' } })
  },
  {
    id: 'p2', name: 'Bob (The Min-Maxer)', role: 'Netrunner', level: 'Veteran', riskTolerance: 0.9,
    think: (ctx) => `Heat is ${ctx.heat}. If I leverage my +4 Deck modifier against a 0 penalty, my expected value is massive. I will push the system to the limit to extract data.`,
    decideAction: (ctx) => ({ type: 'hack', baseModifier: 4, difficultyPenalty: 0, apCost: 2, payload: { target: 'mainframe' } })
  },
  {
    id: 'p3', name: 'Charlie (The Brute)', role: 'Enforcer', level: 'Casual', riskTolerance: 0.6,
    think: (ctx) => `I see an enemy. I punch it. Who cares about stealth?`,
    decideAction: (ctx) => ({ type: 'attack', baseModifier: 2, difficultyPenalty: ctx.heat > 3 ? 1 : 0, apCost: 3, payload: { target: 'guard' } })
  },
  {
    id: 'p4', name: 'Diana (The Tactician)', role: 'Infiltrator', level: 'Taktiker', riskTolerance: 0.3,
    think: (ctx) => `AP is limited. I should conserve movement. I will perform a low-risk recon action.`,
    decideAction: (ctx) => ({ type: 'investigate', baseModifier: 3, difficultyPenalty: 1, apCost: 1, payload: { target: 'room_layout' } })
  },
  {
    id: 'p5', name: 'Eve (The Chaos Agent)', role: 'Saboteur', level: 'Chaos', riskTolerance: 1.0,
    think: (ctx) => `Let's see what happens if I blow up the generator! It might cause a Panic, but it's fun!`,
    decideAction: (ctx) => ({ type: 'sabotage', baseModifier: -1, difficultyPenalty: 4, apCost: 3, payload: { target: 'generator' } })
  },
  {
    id: 'p6', name: 'Frank (The Medic)', role: 'Support', level: 'Taktiker', riskTolerance: 0.2,
    think: (ctx) => `Team HP is holding, but I should prepare an emergency heal just in case trauma spikes.`,
    decideAction: (ctx) => ({ type: 'EMERGENCY_HEAL', baseModifier: 2, difficultyPenalty: 0, apCost: 2, payload: { target: 'p3' } })
  },
  {
    id: 'p7', name: 'Grace (The Glitcher)', role: 'Netrunner', level: 'Anfänger', riskTolerance: 0.8,
    think: (ctx) => `I read that hacking is cool. I'll try to hack the hardest ICE with no prep.`,
    decideAction: (ctx) => ({ type: 'hack', baseModifier: -2, difficultyPenalty: 5, apCost: 1, payload: { target: 'black_ice' } })
  },
  {
    id: 'p8', name: 'Hank (The Ghost)', role: 'Infiltrator', level: 'Veteran', riskTolerance: 0.5,
    think: (ctx) => `Slow and steady. I will use 3 AP to guarantee my stealth roll and bypass the sensors.`,
    decideAction: (ctx) => ({ type: 'sneak', baseModifier: 5, difficultyPenalty: 2, apCost: 3, payload: { target: 'laser_grid' } })
  }
];

// ==========================================
// 2. Define Scenarios
// ==========================================
interface Scenario {
  name: string;
  description: string;
  baseHeat: number;
  turns: number;
}

const scenarios: Scenario[] = [
  { name: 'Corporate Extraction', description: 'Extract a VIP from a high-security facility.', baseHeat: 3, turns: 10 },
  { name: 'Data Heist', description: 'Steal encrypted research from an air-gapped server.', baseHeat: 5, turns: 8 },
  { name: 'Suicide Mission', description: 'Assault a heavily fortified black-site.', baseHeat: 8, turns: 12 }
];

// ==========================================
// 3. Simulator Core
// ==========================================
function runSimulation() {
  let logOutput = `# ZERO SUM RPG - NEURO-EVOLUTIONARY PLAYTEST LOGS\n\n`;
  let totalAnomalies = 0;
  let totalCrits = 0;
  let totalGlitches = 0;

  // Run each scenario 3 times with different squad compositions
  for (const scenario of scenarios) {
    for (let run = 1; run <= 3; run++) {
      let currentHeat = scenario.baseHeat;
      let momentum = 0;
      logOutput += `## SCENARIO: ${scenario.name} (Run ${run})\n`;
      logOutput += `*Base Heat: ${currentHeat} | Turns: ${scenario.turns}*\n\n`;

      // Pick 4 random agents for the squad
      const squad = [...agents].sort(() => 0.5 - Math.random()).slice(0, 4);
      logOutput += `**Deployed Squad:** ${squad.map(a => `${a.name} [${a.level}]`).join(', ')}\n\n`;

      for (let turn = 1; turn <= scenario.turns; turn++) {
        logOutput += `### Turn ${turn} (Heat: ${currentHeat}, Momentum: ${momentum})\n`;
        
        for (const agent of squad) {
          const context = { heat: currentHeat, momentum };
          const thought = agent.think(context);
          const action = agent.decideAction(context);

          // Simulate Dice Roll using the absolute Resolution Engine
          const request: RollRequest = {
            playerId: agent.id,
            baseModifier: action.baseModifier + (momentum > 0 ? 1 : 0),
            difficultyPenalty: action.difficultyPenalty + Math.floor(currentHeat / 3)
          };

          const result = ResolutionEngine.resolve(request);
          
          logOutput += `#### [${agent.name} - ${action.type.toUpperCase()}]\n`;
          logOutput += `> **Thought:** "${thought}"\n`;
          logOutput += `- **Attempt:** Modifier: ${request.baseModifier}, Penalty: ${request.difficultyPenalty}, AP Cost: ${action.apCost}\n`;
          logOutput += `- **Result:** ${result.degree}\n`;
          logOutput += `- **Consequences:** ${result.consequences.join(', ')}\n`;

          // Apply Consequences
          if (result.degree === DegreeOfSuccess.CRITICAL_TRIUMPH) {
             totalCrits++;
             momentum++;
             currentHeat = Math.max(1, currentHeat - 1);
          } else if (result.degree === DegreeOfSuccess.CRITICAL_FAILURE) {
             totalGlitches++;
             currentHeat += 2;
             momentum = 0;
          } else if (result.degree === DegreeOfSuccess.MIXED_SUCCESS) {
             currentHeat += 1;
          }

          logOutput += `\n`;
        }
      }
    }
  }

  logOutput += `## SIMULATION SUMMARY\n`;
  logOutput += `- Total Critical Triumphs: ${totalCrits}\n`;
  logOutput += `- Total Critical Glitches: ${totalGlitches}\n`;
  logOutput += `- Heat Escalation Average: Extremely Volatile\n`;

  console.log(logOutput);
}

runSimulation();
