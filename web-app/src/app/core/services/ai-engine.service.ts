import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AIPersona {
  id: string;
  name: string;
  role: string;
  experienceLevel: string;
  riskTolerance: number;
}

export interface AIResponse {
  thought: string;
  action: string;
  target: string;
  apCost: number;
}

@Injectable({
  providedIn: 'root'
})
export class AIEngineService {
  // Store the API Key (In production, this should be handled via a secure backend proxy)
  public apiKey = signal<string>(environment.geminiApiKey);
  
  constructor() {}

  /**
   * Prompts the AI (Google Gemini via REST) to simulate a player's turn based on their Persona.
   */
  public async generateTurn(persona: AIPersona, context: { heat: number, situation: string }): Promise<AIResponse> {
    if (!this.apiKey() || this.apiKey() === 'REPLACE_WITH_REAL_KEY') {
       throw new Error('[AI Engine] FATAL: Missing API Key. Refusing to mock response.');
    }

    const systemInstruction = `
      Du bist ein Mitspieler im Zero Sum RPG (Cyberpunk TTRPG).
      Deine Persona: ${persona.name}.
      Dein Erfahrungslevel: ${persona.experienceLevel}.
      Deine Risiko-Toleranz (0.0 bis 1.0): ${persona.riskTolerance}.
      Dein Job: ${persona.role}.
      
      Regeln:
      1. Evaluiere die Situation anhand deiner Persona.
      2. Antworte EXAKT im folgenden JSON-Format ohne Markdown Block:
      {
        "thought": "Deine inneren Gedanken zur Situation",
        "action": "Eine Aktion wie move, attack, sneak, hack, investigate, sabotage",
        "target": "Das Ziel deiner Aktion",
        "apCost": 1, 2 oder 3
      }
    `;

    const userPrompt = `Heat Level: ${context.heat}. Situation: ${context.situation}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey()}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
             temperature: persona.riskTolerance, // Risk tolerance directly influences creativity/chaos
             responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
         throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
         return JSON.parse(text) as AIResponse;
      }
      throw new Error('[AI Engine] Empty response from Gemini.');
    } catch (error) {
      console.error('[AI Engine] Failed to generate turn.', error);
      throw error;
    }
  }

  /**
   * Generates a Game Master event based on current heat level.
   */
  public async generateGmEvent(heat: number, recentActions: string[]): Promise<string> {
    if (!this.apiKey() || this.apiKey() === 'REPLACE_WITH_REAL_KEY') {
       throw new Error('[AI Engine] FATAL: Missing API Key for GM Event. Refusing to mock.');
    }

    const prompt = `
      Du bist der gnadenlose Game Master im Zero Sum RPG (Dystopian Cyberpunk).
      Das Heat Level der Spieler ist: ${heat}.
      Letzte Aktionen der Spieler: ${recentActions.join(', ')}.
      
      Generiere in EINEM extrem atmosphärischen Satz eine Konsequenz oder ein Bedrohungsevent für die Spieler.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey()}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "System Error.";
    } catch (error) {
       return `[GM ERROR] Connection lost.`;
    }
  }

}
