export declare class FunctionNotFoundError extends Error {
    constructor(functionName: string);
}
export declare class NoActionDefinedError extends Error {
    constructor();
}
export declare class InvalidAddress extends Error {
    constructor(address: string);
}
export declare class ActionsNumberError extends Error {
    constructor(actionsNumber: number);
}
