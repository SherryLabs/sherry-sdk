/**
 * Custom error class representing an error when a function is not found in the ABI.
 *
 * @class FunctionNotFoundError
 * @extends {Error}
 *
 * @param {string} functionName - The name of the function that was not found.
 *
 * @example
 * ```typescript
 * throw new FunctionNotFoundError("transfer");
 * // Throws: Function transfer not found in ABI
 * ```
 */
export class FunctionNotFoundError extends Error {
    constructor(functionName: string) {
        super(`Function ${functionName} not found in ABI`);
        this.name = 'FunctionNotFoundError';
    }
}

/**
 * Custom error class representing an error when no action is defined.
 *
 * @class NoActionDefinedError
 * @extends {Error}
 *
 * @example
 * ```typescript
 * throw new NoActionDefinedError();
 * // Throws: No action defined
 * ```
 */
export class NoActionDefinedError extends Error {
    constructor() {
        super(`No action defined`);
        this.name = 'NoActionDefinedError';
    }
}

/**
 * Custom error class representing an error when an invalid address is provided.
 *
 * @class InvalidAddress
 * @extends {Error}
 *
 * @param {string} address - The invalid address that was provided.
 *
 * @example
 * ```typescript
 * throw new InvalidAddress("0x123");
 * // Throws: Invalid address 0x123
 * ```
 */
export class InvalidAddress extends Error {
    constructor(address: string) {
        super(`Invalid address ${address}`);
        this.name = 'InvalidAddress';
    }
}

/**
 * Custom error class representing an error when the number of actions exceeds the maximum allowed.
 *
 * @class ActionsNumberError
 * @extends {Error}
 *
 * @param {number} actionsNumber - The number of actions attempted.
 *
 * @example
 * ```typescript
 * throw new ActionsNumberError(5);
 * // Throws: Number of actions 5 exceeds the maximum allowed (4)
 * ```
 */
export class ActionsNumberError extends Error {
    constructor(actionsNumber: number) {
        super(`Number of actions ${actionsNumber} exceeds the maximum allowed (4)`);
        this.name = 'ActionsNumberError';
    }
}

export class Invalidparams extends Error {
    constructor() {
        super(`Invalid transaction parameters`);
        this.name = 'Invalidparams';
    }
}

export class InvalidMetadataError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = 'InvalidMetadataError';
    }
}
