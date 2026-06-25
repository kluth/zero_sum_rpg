import { WorkforceBase } from './WorkforceBase';
import { Nervenkostuem } from './Nervenkostuem';
import { BurnoutMeter } from './BurnoutMeter';
import { KoffeinPegel } from './KoffeinPegel';
import { Result, success, failure } from '../shared/Result';

export class Pflegekraft extends WorkforceBase {
  public static create(
    id: string,
    name: string,
    nervenkostuem: Nervenkostuem,
    burnoutMeter: BurnoutMeter,
    koffeinPegel: KoffeinPegel
  ): Pflegekraft {
    return new Pflegekraft(id, name, nervenkostuem, burnoutMeter, koffeinPegel);
  }

  // Triage: Kostet 20 KoffeinPegel (Fokus), erzeugt 10 Stress
  public triagePatient(patientId: string): Result<string, string> {
    const sopResult = this.executeSop(20);
    if (sopResult.isFailure()) {
      return failure(`Triage fehlgeschlagen: ${sopResult.error}`);
    }

    const stressResult = this.applyStress(10);
    if (stressResult.isFailure()) {
      return failure(`Triage fehlgeschlagen durch Burnout: ${stressResult.error}`);
    }

    return success(`Patient ${patientId} erfolgreich triagiert.`);
  }

  // SOP: Pausen-Zigaretten-Diplomatie
  // Reduziert Burnout um 30, stellt 40 Koffein wieder her, kostet aber 10 Nervenkostuem (ungesund)
  public pausenZigarettenDiplomatie(): Result<string, string> {
    const dmgResult = this.takeDamage(10);
    if (dmgResult.isFailure()) {
      return failure(`Pausen-Zigaretten-Diplomatie fehlgeschlagen: ${dmgResult.error}`);
    }

    this.relieveStress(30);
    this.restoreFocus(40);

    return success('Pausen-Zigaretten-Diplomatie erfolgreich durchgeführt.');
  }
}
