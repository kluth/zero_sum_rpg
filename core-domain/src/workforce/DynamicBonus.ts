import { Result, success, failure } from '../shared/Result';

export class DynamicBonus {
  private constructor(
    private readonly skill: string,
    private readonly modifier: number
  ) {}

  public static create(skill: string, modifier: number): Result<DynamicBonus, string> {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) {
      return failure('Skill name cannot be empty.');
    }
    if (modifier === 0) {
      return failure('Modifier cannot be zero.');
    }
    return success(new DynamicBonus(trimmedSkill, modifier));
  }

  public getSkill(): string {
    return this.skill;
  }

  public getModifier(): number {
    return this.modifier;
  }
}
