import { Result } from './result';

describe('Result Pattern', () => {
  it('should create a successful result with a value', () => {
    const res = Result.success('PaperWhite');
    expect(res.isSuccess).toBeTrue();
    expect(res.isFailure).toBeFalse();
    expect(res.getValue()).toBe('PaperWhite');
  });

  it('should create a failure result with an error message', () => {
    const res = Result.failure('Token Not Found');
    expect(res.isFailure).toBeTrue();
    expect(res.isSuccess).toBeFalse();
    expect(res.getError()).toBe('Token Not Found');
  });

  it('should throw an error if getValue is called on a failure', () => {
    const res = Result.failure('Token Not Found');
    expect(() => res.getValue()).toThrowError("Can't get the value of an error result. Use 'getError' instead.");
  });
});
