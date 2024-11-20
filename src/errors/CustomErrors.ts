export class FunctionNotFoundError extends Error {
    constructor(functionName: string) {
        super(`Function ${functionName} not found in ABI`);
        this.name = "FunctionNotFoundError";
    }
}

export class NoActionDefinedError extends Error {
    constructor() {
        super(`No action defined`);
        this.name = "NoActionDefinedError";
    }
}

export class InvalidAddress extends Error {
    constructor(address: string) {
        super(`Invalid address ${address}`);
        this.name = "InvalidAddress";
    }
}

export class ActionsNumberError extends Error {
    constructor(actionsNumber: number) {
        super(`Number of actions ${actionsNumber} exceeds the maximum allowed (4)`);
        this.name = "ActionsNumberError";
    }
}