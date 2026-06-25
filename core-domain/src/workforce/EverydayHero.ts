import { Result, success, failure } from '../shared/Result';
import { Nervenkostuem } from './Nervenkostuem';
import { BurnoutMeter } from './BurnoutMeter';
import { KoffeinPegel } from './KoffeinPegel';
import { SchichtTasche } from './SchichtTasche';
import { JobTag } from './JobTag';

export class EverydayHero {
  private constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly nervenkostuem: Nervenkostuem,
    private readonly burnoutMeter: BurnoutMeter,
    private readonly koffeinPegel: KoffeinPegel,
    private readonly schichtTasche: SchichtTasche,
    private readonly jobTags: JobTag[]
  ) {}

  public static create(
    id: string,
    name: string,
    nervenkostuem: Nervenkostuem,
    burnoutMeter: BurnoutMeter,
    koffeinPegel: KoffeinPegel,
    schichtTasche: SchichtTasche,
    jobTags: JobTag[] = []
  ): Result<EverydayHero, string> {
    if (!id.trim()) {
      return failure('ID cannot be empty.');
    }
    if (!name.trim()) {
      return failure('Name cannot be empty.');
    }
    return success(
      new EverydayHero(id, name, nervenkostuem, burnoutMeter, koffeinPegel, schichtTasche, [...jobTags])
    );
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getNervenkostuem(): Nervenkostuem {
    return this.nervenkostuem;
  }

  public getBurnoutMeter(): BurnoutMeter {
    return this.burnoutMeter;
  }

  public getKoffeinPegel(): KoffeinPegel {
    return this.koffeinPegel;
  }

  public getSchichtTasche(): SchichtTasche {
    return this.schichtTasche;
  }

  public getJobTags(): JobTag[] {
    return [...this.jobTags];
  }

  public hasJobTag(tagValue: string): boolean {
    return this.jobTags.some(tag => tag.getValue() === tagValue);
  }

  public addJobTag(tag: JobTag): EverydayHero {
    if (this.hasJobTag(tag.getValue())) {
      return this;
    }
    return new EverydayHero(
      this.id,
      this.name,
      this.nervenkostuem,
      this.burnoutMeter,
      this.koffeinPegel,
      this.schichtTasche,
      [...this.jobTags, tag]
    );
  }
}
