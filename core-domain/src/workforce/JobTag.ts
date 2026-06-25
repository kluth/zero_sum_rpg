import { Result, success, failure } from '../shared/Result';

export class JobTag {
  private constructor(private readonly value: string) {}

  public static create(value: string): Result<JobTag, string> {
    const trimmed = value.trim();
    if (!trimmed) {
      return failure('JobTag cannot be empty.');
    }
    if (trimmed.length > 50) {
      return failure('JobTag exceeds maximum length of 50 characters.');
    }
    return success(new JobTag(trimmed));
  }

  public getValue(): string {
    return this.value;
  }
}
