import { WorkforceBase } from './WorkforceBase';
import { Nervenkostuem } from './Nervenkostuem';
import { BurnoutMeter } from './BurnoutMeter';
import { KoffeinPegel } from './KoffeinPegel';
import { SchichtTasche, Item } from './SchichtTasche';
import { Result, success, failure } from '../shared/Result';

export class Schichtleiter extends WorkforceBase {
  private constructor(
    id: string,
    name: string,
    nervenkostuem: Nervenkostuem,
    burnoutMeter: BurnoutMeter,
    koffeinPegel: KoffeinPegel,
    private tasche: SchichtTasche
  ) {
    super(id, name, nervenkostuem, burnoutMeter, koffeinPegel);
  }

  public static create(
    id: string,
    name: string,
    nervenkostuem: Nervenkostuem,
    burnoutMeter: BurnoutMeter,
    koffeinPegel: KoffeinPegel,
    tasche: SchichtTasche
  ): Schichtleiter {
    return new Schichtleiter(id, name, nervenkostuem, burnoutMeter, koffeinPegel, tasche);
  }

  public getTasche(): SchichtTasche {
    return this.tasche;
  }

  // Inventory Management
  public collectItem(item: Item): Result<string, string> {
    const tascheResult = this.tasche.addItem(item);
    if (tascheResult.isFailure()) {
      return failure(`Cannot collect item: ${tascheResult.error}`);
    }
    this.tasche = tascheResult.value as SchichtTasche;
    return success(`Item ${item.name} collected.`);
  }

  public useItem(itemId: string): Result<string, string> {
    const tascheResult = this.tasche.removeItem(itemId);
    if (tascheResult.isFailure()) {
      return failure(`Cannot use item: ${tascheResult.error}`);
    }
    this.tasche = tascheResult.value as SchichtTasche;
    return success(`Item ${itemId} used.`);
  }

  // Crowd Control: Kostet 30 KoffeinPegel, erzeugt 15 Stress, verhindert Aufstand
  public deeskalieren(): Result<string, string> {
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

  // Logistik-Check: Wenn Tasche voll, dann Stressabbau (weil gute Vorbereitung), 
  // andernfalls Stressaufbau
  public logisticsCheck(): void {
    if (this.tasche.isFull()) {
      this.relieveStress(10);
    } else {
      this.applyStress(5);
    }
  }
}
