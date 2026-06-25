import { WorkforceBase } from './WorkforceBase';
import { Nervenkostuem } from './Nervenkostuem';
import { BurnoutMeter } from './BurnoutMeter';
import { KoffeinPegel } from './KoffeinPegel';
import { Tag } from './Tag';
import { Result, success, failure } from '../shared/Result';

export class Worker extends WorkforceBase {
  private tags: Set<Tag>;

  private constructor(
    id: string,
    name: string,
    nervenkostuem: Nervenkostuem,
    burnoutMeter: BurnoutMeter,
    koffeinPegel: KoffeinPegel,
    tags: Tag[]
  ) {
    super(id, name, nervenkostuem, burnoutMeter, koffeinPegel);
    this.tags = new Set(tags);
  }

  public static create(
    id: string,
    name: string,
    nervenkostuem: Nervenkostuem,
    burnoutMeter: BurnoutMeter,
    koffeinPegel: KoffeinPegel,
    tags: Tag[] = []
  ): Worker {
    return new Worker(id, name, nervenkostuem, burnoutMeter, koffeinPegel, tags);
  }

  public hasTag(tag: Tag): boolean {
    return this.tags.has(tag);
  }

  public performAction(action: Tag, payload: any): Result<string, string> {
    if (!this.hasTag(action)) {
      return failure(`Missing tag: ${action}`);
    }

    switch (action) {
      case Tag.TRIAGE: {
        const sopResult = this.executeSop(20);
        if (sopResult.isFailure()) {
          return failure(`Triage fehlgeschlagen: ${sopResult.error}`);
        }
        const stressResult = this.applyStress(10);
        if (stressResult.isFailure()) {
          return failure(`Triage fehlgeschlagen durch Burnout: ${stressResult.error}`);
        }
        return success(`Patient ${payload.target || 'unknown'} erfolgreich triagiert.`);
      }

      case Tag.DEESKALATION: {
        const sopResult = this.executeSop(30);
        if (sopResult.isFailure()) {
          return failure(`Deeskalation fehlgeschlagen: ${sopResult.error}`);
        }
        const stressResult = this.applyStress(15);
        if (stressResult.isFailure()) {
          return failure(`Deeskalation führte zu Burnout: ${stressResult.error}`);
        }
        return success('Situation erfolgreich deeskaliert.');
      }

      case Tag.PAUSEN_ZIGARETTEN_DIPLOMATIE: {
        const dmgResult = this.takeDamage(10);
        if (dmgResult.isFailure()) {
          return failure(`Pausen-Zigaretten-Diplomatie fehlgeschlagen: ${dmgResult.error}`);
        }
        this.relieveStress(30);
        this.restoreFocus(40);
        return success('Pausen-Zigaretten-Diplomatie erfolgreich durchgeführt.');
      }

      default:
        return failure(`Unknown action: ${action}`);
    }
  }
}
