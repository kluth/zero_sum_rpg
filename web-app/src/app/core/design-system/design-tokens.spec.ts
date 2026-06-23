import { ColorToken, DesignSystemConfig } from './design-tokens';
import { Result } from './result';

describe('Design Tokens Contract', () => {
  it('should safely retrieve a ColorToken via Result pattern', () => {
    const result: Result<ColorToken> = DesignSystemConfig.getColor('PaperWhite');
    expect(result.isSuccess).toBeTrue();
    expect(result.getValue()).toBe('#ffffff');
  });

  it('should safely retrieve the Ink text color', () => {
    const result: Result<ColorToken> = DesignSystemConfig.getColor('Ink');
    expect(result.isSuccess).toBeTrue();
    expect(result.getValue()).toBe('#1a1a1a');
  });

  it('should return a Failure Result when requesting an invalid ColorToken', () => {
    const result: Result<ColorToken> = DesignSystemConfig.getColor('NeonPink' as any);
    expect(result.isFailure).toBeTrue();
    expect(result.getError()).toContain('Invalid color token requested');
  });
});
