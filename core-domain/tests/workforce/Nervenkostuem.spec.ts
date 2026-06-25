import { Nervenkostuem } from '../../src/workforce/Nervenkostuem';

describe('Nervenkostuem', () => {
  it('should create a valid Nervenkostuem', () => {
    const result = Nervenkostuem.create(50);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.getValue()).toBe(50);
    }
  });

  it('should fail to create if value is less than 0', () => {
    const result = Nervenkostuem.create(-10);
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toBe('Nervenkostuem value must be between 0 and 100.');
    }
  });

  it('should fail to create if value is greater than 100', () => {
    const result = Nervenkostuem.create(110);
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toBe('Nervenkostuem value must be between 0 and 100.');
    }
  });

  it('should increase value and cap at 100', () => {
    const result = Nervenkostuem.create(90);
    if (result.isSuccess()) {
      const increased = result.value.increase(20);
      expect(increased.getValue()).toBe(100);
    } else {
      fail('Expected success');
    }
  });

  it('should decrease value and cap at 0', () => {
    const result = Nervenkostuem.create(10);
    if (result.isSuccess()) {
      const decreased = result.value.decrease(20);
      expect(decreased.getValue()).toBe(0);
    } else {
      fail('Expected success');
    }
  });
});
