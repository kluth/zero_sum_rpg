export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;

  private constructor(isSuccess: boolean, private readonly value?: T, private readonly error?: string) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
  }

  public static success<U>(value: U): Result<U> {
    return new Result<U>(true, value);
  }

  public static failure<U>(error: string): Result<U> {
    return new Result<U>(false, undefined, error);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Can't get the value of an error result. Use 'getError' instead.");
    }
    return this.value as T;
  }

  public getError(): string {
    if (this.isSuccess) {
      throw new Error("Can't get the error of a success result. Use 'getValue' instead.");
    }
    return this.error as string;
  }
}
