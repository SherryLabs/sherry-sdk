"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsNumberError = exports.InvalidAddress = exports.NoActionDefinedError = exports.FunctionNotFoundError = void 0;
class FunctionNotFoundError extends Error {
    constructor(functionName) {
        super(`Function ${functionName} not found in ABI`);
        this.name = "FunctionNotFoundError";
    }
}
exports.FunctionNotFoundError = FunctionNotFoundError;
class NoActionDefinedError extends Error {
    constructor() {
        super(`No action defined`);
        this.name = "NoActionDefinedError";
    }
}
exports.NoActionDefinedError = NoActionDefinedError;
class InvalidAddress extends Error {
    constructor(address) {
        super(`Invalid address ${address}`);
        this.name = "InvalidAddress";
    }
}
exports.InvalidAddress = InvalidAddress;
class ActionsNumberError extends Error {
    constructor(actionsNumber) {
        super(`Number of actions ${actionsNumber} exceeds the maximum allowed (4)`);
        this.name = "ActionsNumberError";
    }
}
exports.ActionsNumberError = ActionsNumberError;
