import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({
  name: 'zero-sum-dice-resolutor',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'interpret_dice_pool',
        description: 'Interprets a multidimensional dice pool roll using a local/simulated LLM to generate narrative consequence text.',
        inputSchema: {
          type: 'object',
          properties: {
            playerId: { type: 'string' },
            intent: { type: 'string', description: 'What the player is trying to do.' },
            contextTags: { type: 'array', items: { type: 'string' }, description: 'Tags like COMPROMISED or UNDER_FIRE.' },
            successes: { type: 'number' },
            advantages: { type: 'number' },
            threats: { type: 'number' },
            triumphs: { type: 'number' },
            despairs: { type: 'number' }
          },
          required: ['playerId', 'intent', 'successes', 'advantages', 'threats', 'triumphs', 'despairs']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'interpret_dice_pool') {
    const args = request.params.arguments as any;
    
    // Simulate LLM Processing the multi-dimensional vectors
    let narrative = `> INTENT: ${args.intent}\n`;
    
    if (args.successes > 0) {
      narrative += `[SUCCESS] The action completes successfully. `;
    } else {
      narrative += `[FAILURE] The action fails entirely. `;
    }

    if (args.triumphs > 0) {
      narrative += `A spectacular triumph occurs! The narrative heavily shifts in your favor. `;
    }
    
    if (args.despairs > 0) {
      narrative += `[DESPAIR DETECTED] A catastrophic failure triggers. System glitching. `;
    }

    if (args.advantages > args.threats) {
      narrative += `You gain a tactical edge (+${args.advantages - args.threats} Advantage).`;
    } else if (args.threats > args.advantages) {
      narrative += `The situation worsens, imposing unexpected complications (+${args.threats - args.advantages} Threat).`;
    }

    // Add context flavoring
    if (args.contextTags && args.contextTags.includes('UNDER_FIRE')) {
      narrative += ` This all happens amidst deafening suppressing fire!`;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
             mechanicalResolution: {
                success: args.successes > 0,
                netAdvantage: args.advantages - args.threats
             },
             prose: narrative
          })
        }
      ]
    };
  }
  
  throw new Error('Tool not found');
});

const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.error('Zero Sum RPG - MultiAxis Resolutor MCP Server running on stdio');
}).catch(e => {
  console.error(e);
  process.exit(1);
});
