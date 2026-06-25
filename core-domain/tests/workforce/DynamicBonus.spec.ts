import { DynamicBonus } from '../../src/workforce/DynamicBonus';

describe('DynamicBonus', () => {
  it('should create a valid DynamicBonus', () => {
    const result = DynamicBonus.create('Wundversorgung', 1);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.getSkill()).toBe('Wundversorgung');
      expect(result.value.getModifier()).toBe(1);
    }
  });

  it('should fail if skill is empty', () => {
    const result = DynamicBonus.create('  ', 1);
    expect(result.isSuccess()).toBe(false);
    if (result.isFailure()) {
      expect(result.error).toBe('Skill name cannot be empty.');
    }
  });

  it('should fail if modifier is zero', () => {
    const result = DynamicBonus.create('Wundversorgung', 0);
    expect(result.isSuccess()).toBe(false);
    if (result.isFailure()) {
      expect(result.error).toBe('Modifier cannot be zero.');
    }
  });
});
