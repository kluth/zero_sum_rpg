"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failure = exports.success = exports.Failure = exports.Success = void 0;
class Success {
    constructor(value) {
        this.value = value;
    }
    isSuccess() { return true; }
    isFailure() { return false; }
}
exports.Success = Success;
class Failure {
    constructor(error) {
        this.error = error;
    }
    isSuccess() { return false; }
    isFailure() { return true; }
}
exports.Failure = Failure;
const success = (value) => new Success(value);
exports.success = success;
const failure = (error) => new Failure(error);
exports.failure = failure;
//# sourceMappingURL=Result.js.map