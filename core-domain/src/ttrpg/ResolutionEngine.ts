export enum DegreeOfSuccess {
  CRITICAL_FAILURE = 'CRITICAL_FAILURE', // 1-9
  MIXED_SUCCESS = 'MIXED_SUCCESS',       // 10-15
  CLEAN_SUCCESS = 'CLEAN_SUCCESS',       // 16-19
  CRITICAL_TRIUMPH = 'CRITICAL_TRIUMPH'  // 20+
}

export interface RollRequest {
  readonly playerId: string;
  readonly baseModifier: number; // Must be between -5 and +5
  readonly difficultyPenalty: number; // E.g., -2 for low visibility
}

export interface RollResult {
  readonly rollValue: number; // The natural d20 roll (1-20)
  readonly finalTotal: number; // rollValue + modifier - penalty
  readonly degree: DegreeOfSuccess;
  readonly consequences: string[];
}

export class ResolutionEngine {
  /**
   * Resolves an action using the new strict Bounded Accuracy (d20) system.
   * Runs in true O(1) time.
   */
  public static resolve(request: RollRequest, randomProvider: () => number = Math.random): RollResult {
    // 1. Cap modifiers to prevent power-creep (Bounded Accuracy)
    // Secure against NaN exploits guaranteeing Critical Triumphs
    const safeMod = Number.isFinite(request.baseModifier) ? request.baseModifier : 0;
    const safePen = Number.isFinite(request.difficultyPenalty) ? request.difficultyPenalty : 0;
    
    const clampedModifier = Math.max(-5, Math.min(5, Math.round(safeMod)));
    const clampedPenalty = Math.max(0, Math.round(safePen));

    // 2. Execute natural roll (1 to 20)
    const naturalRoll = Math.floor(randomProvider() * 20) + 1;
    
    // 3. Calculate Final Total
    const finalTotal = naturalRoll + clampedModifier - clampedPenalty;

    // 4. Determine Degree of Success
    let degree: DegreeOfSuccess;
    const consequences: string[] = [];

    if (naturalRoll === 1) {
      degree = DegreeOfSuccess.CRITICAL_FAILURE;
      consequences.push('ACTION_FAILED', 'SNR_INCREASED', 'CRITICAL_GLITCH');
    } else if (naturalRoll === 20) {
      degree = DegreeOfSuccess.CRITICAL_TRIUMPH;
      consequences.push('ACTION_SUCCEEDED', 'MOMENTUM_GAINED', 'AP_REFUNDED', 'NATURAL_CRIT');
    } else if (finalTotal < 10) {
      degree = DegreeOfSuccess.CRITICAL_FAILURE;
      consequences.push('ACTION_FAILED', 'SNR_INCREASED');
    } else if (finalTotal <= 15) {
      degree = DegreeOfSuccess.MIXED_SUCCESS;
      consequences.push('ACTION_SUCCEEDED', 'COMPLICATION_ADDED');
    } else if (finalTotal <= 19) {
      degree = DegreeOfSuccess.CLEAN_SUCCESS;
      consequences.push('ACTION_SUCCEEDED');
    } else {
      degree = DegreeOfSuccess.CRITICAL_TRIUMPH;
      consequences.push('ACTION_SUCCEEDED', 'MOMENTUM_GAINED', 'AP_REFUNDED');
    }

    return {
      rollValue: naturalRoll,
      finalTotal,
      degree,
      consequences
    };
  }
}
