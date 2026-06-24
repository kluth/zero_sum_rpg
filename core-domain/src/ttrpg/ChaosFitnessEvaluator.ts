import { Result, ok, err } from 'neverthrow';
import { RollRequest, RollResult, ResolutionEngine } from './ResolutionEngine';

export class DomainError extends Error {
  constructor(public readonly type: 'PANIC' | 'INVARIANT_BREACH', message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ChaosFitnessEvaluator {
  constructor(private engine: typeof ResolutionEngine) {}

  /**
   * Führt einen RollRequest isoliert aus und erzwingt das Result-Pattern.
   * Fängt Panics (Exceptions) ab und validiert mathematische Invarianten.
   * McCabe Complexity < 10 (Aktuell: 4)
   */
  public evaluateRoll(request: RollRequest): Result<RollResult, DomainError> {
    try {
      // 1. Isolation Execution
      const result = this.engine.resolve(request);

      // 2. Invariant Checking (Post-Condition Validation)
      if (Number.isNaN(result.finalTotal) || !isFinite(result.finalTotal)) {
        return err(new DomainError('INVARIANT_BREACH', 'FinalTotal resulted in NaN or Infinity.'));
      }

      if (result.rollValue < 1 || result.rollValue > 20) {
        return err(new DomainError('INVARIANT_BREACH', 'd20 roll out of bounds.'));
      }

      // 3. Return Monadic Success
      return ok(result);
    } catch (error) {
      // 4. Panic Handling
      const message = error instanceof Error ? error.message : String(error);
      return err(new DomainError('PANIC', `Engine crashed during resolution: ${message}`));
    }
  }
}
