import { Result, success, failure } from '../shared/Result';
import { EverydayHero } from '../workforce/EverydayHero';
import { Nervenkostuem } from '../workforce/Nervenkostuem';
import { BurnoutMeter } from '../workforce/BurnoutMeter';
import { KoffeinPegel } from '../workforce/KoffeinPegel';
import { SchichtTasche } from '../workforce/SchichtTasche';
import { JobTag } from '../workforce/JobTag';

export interface CharacterCreationRequest {
  playerId: string;
  characterName: string;
  jobTags: string[];
}

export class CharacterCreationAdapter {
  public static createCharacter(request: CharacterCreationRequest): Result<EverydayHero, string> {
    const jobTags: JobTag[] = [];

    for (const tagString of request.jobTags) {
      const tagResult = JobTag.create(tagString);
      if (tagResult.isFailure()) {
        return failure(tagResult.error);
      }
      jobTags.push(tagResult.value);
    }

    const nkResult = Nervenkostuem.create(100);
    const bmResult = BurnoutMeter.create(0);
    const kpResult = KoffeinPegel.create(100);
    const stResult = SchichtTasche.create(5); // Default capacity 5

    if (nkResult.isFailure()) return failure(nkResult.error);
    if (bmResult.isFailure()) return failure(bmResult.error);
    if (kpResult.isFailure()) return failure(kpResult.error);
    if (stResult.isFailure()) return failure(stResult.error);

    return EverydayHero.create(
      request.playerId,
      request.characterName,
      nkResult.value,
      bmResult.value,
      kpResult.value,
      stResult.value,
      jobTags
    );
  }
}
