export type Result<T, E> = Success<T, E> | Failure<T, E>;
export declare class Success<T, E> {
    readonly value: T;
    constructor(value: T);
    isSuccess(): this is Success<T, E>;
    isFailure(): this is Failure<T, E>;
}
export declare class Failure<T, E> {
    readonly error: E;
    constructor(error: E);
    isSuccess(): this is Success<T, E>;
    isFailure(): this is Failure<T, E>;
}
export declare const success: <T, E>(value: T) => Result<T, E>;
export declare const failure: <T, E>(error: E) => Result<T, E>;
//# sourceMappingURL=Result.d.ts.map