import * as fc from 'fast-check';
import { ChaosFitnessEvaluator } from './ChaosFitnessEvaluator';
import { ResolutionEngine } from './ResolutionEngine';

describe('ChaosFitnessEvaluator (Engine Annihilator)', () => {
  it('should survive 100 iterations of extreme payload mutation without throwing Panics', () => {
    // Generiere Millionen möglicher RollRequests, inklusive massiver Boundary-Violations
    const rollRequestArbitrary = fc.record({
      playerId: fc.string(),
      baseModifier: fc.integer({ min: -Number.MAX_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }),
      difficultyPenalty: fc.integer({ min: -Number.MAX_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER })
    });

    let issues = 0;

    // Fuzzing Loop (100 Iterations for Block 1)
    fc.assert(
      fc.property(rollRequestArbitrary, (request) => {
        const evaluator = new ChaosFitnessEvaluator(ResolutionEngine);
        const result = evaluator.evaluateRoll(request);

        // Das Result MUSS monadisch sein (ok oder err).
        // Wenn die ResolutionEngine intern crasht (throw new Error), 
        // wird der Evaluator das fangen und als Result.err(DomainError) zurückgeben.
        // Das Brechen einer Invariante (z.B. NaN, Unendlichkeiten) muss abgefangen werden.

        if (result.isErr()) {
          issues++;
          // In der TDD-RED Phase wollen wir sehen, ob die aktuelle ResolutionEngine 
          // Flaws hat (z.B. bei massiven Integer-Overflows oder NaN-Werten).
          return false; // Test schlägt fehl, wenn ein Issue auftritt
        }

        return result.isOk();
      }),
      { numRuns: 100000 }
    );

    // Halt-Condition für diesen Block
    expect(issues).toBe(0);
  });
});
