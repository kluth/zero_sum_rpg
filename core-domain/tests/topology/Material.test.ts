import { Material, MaterialType } from '../../src/topology/Material';

describe('Material Value Object', () => {
  it('should create a valid material', () => {
    const result = Material.create(MaterialType.CONCRETE);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.type).toBe(MaterialType.CONCRETE);
    }
  });

  it('should fail on unknown material', () => {
    const result = Material.create(MaterialType.UNKNOWN);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('Material type cannot be unknown');
    }
  });
});
