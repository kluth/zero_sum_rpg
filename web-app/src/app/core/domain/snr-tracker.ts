import { Result } from '../design-system/result';

export enum ThreatLevel {
  NORMAL = 'NORMAL',
  ELEVATED = 'ELEVATED',
  LOCKDOWN = 'LOCKDOWN',
  SWAT = 'SWAT'
}

export class SnrTracker {
  private currentSnr: number = 0;

  public getSnr(): number {
    return this.currentSnr;
  }

  public increaseSnr(amount: number): Result<number> {
    if (amount < 0) {
      return Result.failure('Cannot increase SNR by a negative amount');
    }
    this.currentSnr += amount;
    return Result.success(this.currentSnr);
  }

  public decreaseSnr(amount: number): Result<number> {
    if (amount < 0) {
      return Result.failure('Cannot decrease SNR by a negative amount');
    }
    if (this.currentSnr - amount < 0) {
      return Result.failure('SNR cannot drop below 0');
    }
    this.currentSnr -= amount;
    return Result.success(this.currentSnr);
  }

  public getThreatLevel(): ThreatLevel {
    if (this.currentSnr >= 30) return ThreatLevel.SWAT;
    if (this.currentSnr >= 20) return ThreatLevel.LOCKDOWN;
    if (this.currentSnr >= 10) return ThreatLevel.ELEVATED;
    return ThreatLevel.NORMAL;
  }
}
