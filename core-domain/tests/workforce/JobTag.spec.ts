import { JobTag } from '../../src/workforce/JobTag';

describe('JobTag', () => {
  it('should create a valid JobTag', () => {
    const result = JobTag.create('Pflegekraft');
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.getValue()).toBe('Pflegekraft');
    }
  });

  it('should fail to create a JobTag with empty string', () => {
    const result = JobTag.create('   ');
    expect(result.isSuccess()).toBe(false);
    if (result.isFailure()) {
      expect(result.error).toBe('JobTag cannot be empty.');
    }
  });

  it('should fail to create a JobTag with too long string', () => {
    const longString = 'a'.repeat(51);
    const result = JobTag.create(longString);
    expect(result.isSuccess()).toBe(false);
    if (result.isFailure()) {
      expect(result.error).toBe('JobTag exceeds maximum length of 50 characters.');
    }
  });
});
