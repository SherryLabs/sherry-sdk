import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from '../index';
import { ContractFunctionName, isAddress } from '../index';
import { Metadata, ValidatedMetadata } from '../interface/metadata';
import {
    FunctionNotFoundError,
    InvalidAddress,
    NoActionDefinedError,
    ActionsNumberError,
    Invalidparams,
    InvalidMetadataError,
} from './customErrors';
import {
    BlockchainActionMetadata,
    BlockchainAction,
    TransferAction,
} from '../interface/blockchainAction';
import { Chain } from '../interface/chains';
import { InvalidParameterError } from 'abitype';
import { HttpActionValidator } from '../validators/httpActionValidator';

/**
 * Gets the parameters of a function in the ABI.
 *
 * @param {BlockchainActionMetadata} action - The blockchain action.
 * @returns {AbiParameter[]} - The function parameters.
 */
export function getParameters(action: BlockchainActionMetadata): AbiParameter[] {
    const abi: Abi = action.abi;
    const functionName: ContractFunctionName = action.functionName;

    const abiFunction = getAbiFunction(abi, functionName);

    // Create a deep copy of the ABI parameters
    const abiParameters: AbiParameter[] = abiFunction!.inputs.map(param => ({ ...param }));
    return abiParameters;
}

/**
 * Gets a function from the ABI by its name.
 *
 * @param {Abi} abi - The contract ABI.
 * @param {ContractFunctionName} functionName - The function name.
 * @returns {AbiFunction} - The ABI function.
 * @throws {FunctionNotFoundError} - If the function is not found in the ABI.
 */
export function getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction {
    const abiFunction = abi.find(
        (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
    );
    if (!abiFunction) {
        throw new FunctionNotFoundError(functionName);
    }
    return abiFunction;
}

/**
 * Checks if a function exists in the ABI.
 *
 * @param {Abi} abi - The contract ABI.
 * @param {ContractFunctionName} functionName - The function name.
 * @returns {boolean} - True if the function exists in the ABI, false otherwise.
 */
export function isValidFunction(abi: Abi, functionName: ContractFunctionName): boolean {
    return abi.some(
        (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
    );
}

/**
 * Validates the parameters of a blockchain action.
 *
 * @param {BlockchainAction} action - The blockchain action.
 * @returns {boolean} - True if the parameter lengths match, false otherwise.
 */
export function validateActionParameters(action: BlockchainAction): boolean {
    const params = getParameters(action);
    return params.length === action.params.length;
}

/**
 * Gets the state mutability type of a function in the ABI.
 *
 * @param {BlockchainActionMetadata} action - The blockchain action.
 * @returns {AbiStateMutability} - The state mutability type of the function.
 * @throws {Error} - If the function is not found in the ABI.
 */
export function getBlockchainActionType(action: BlockchainActionMetadata): AbiStateMutability {
    const abiFunction: AbiFunction | undefined = getAbiFunction(action.abi, action.functionName);
    if (!abiFunction) {
        throw new Error(action.functionName);
    }

    const blockAction: AbiStateMutability = abiFunction.stateMutability;
    return blockAction;
}

/**
 * Creates the validated metadata for a mini app.
 *
 * @param {Metadata} metadata - The mini app metadata.
 * @returns {ValidatedMetadata} - The validated metadata with processed actions.
 * @throws {NoActionDefinedError} - If no actions are defined.
 * @throws {ActionsNumberError} - If more than 4 actions are defined.
 * @throws {InvalidAddress} - If an invalid address is provided.
 */
export function createMetadata(metadata: Metadata): ValidatedMetadata {
    validateMetadata(metadata);

    const processedActions = metadata.actions.map(action => {
        if (isBlockchainActionMetadata(action)) {
            return processAction(action);
        } else if (isTransferAction(action)) {
            return action;
        } else if (HttpActionValidator.isHttpAction(action)) {
            return HttpActionValidator.validateHttpAction(action);
        } else {
            throw new Error('Invalid action type');
        }
    });

    return { ...metadata, actions: processedActions };
}

/**
 * Validates the metadata of a mini app.
 *
 * @param {Metadata} metadata - The mini app metadata to validate.
 * @throws {NoActionDefinedError} - If no actions are defined.
 * @throws {ActionsNumberError} - If more than 4 actions are defined.
 * @throws {InvalidAddress} - If an invalid address is provided.
 * @throws {InvalidMetadataError} - If metadata is invalid.
 * @returns {void}
 */
function validateMetadata(metadata: Metadata): void {
    // Check if metadata exists and is an object
    if (!metadata || typeof metadata !== 'object') {
        throw new InvalidMetadataError('Metadata must be a valid object');
    }

    // Check required metadata properties
    if (typeof metadata.icon !== 'string' || !metadata.icon) {
        throw new InvalidMetadataError('Metadata must have a valid icon URL');
    }

    if (typeof metadata.title !== 'string' || !metadata.title) {
        throw new InvalidMetadataError('Metadata must have a title');
    }

    if (typeof metadata.description !== 'string' || !metadata.description) {
        throw new InvalidMetadataError('Metadata must have a description');
    }

    // Validate actions array
    if (!Array.isArray(metadata.actions)) {
        throw new NoActionDefinedError();
    }

    if (metadata.actions.length === 0) {
        throw new NoActionDefinedError();
    }

    if (metadata.actions.length > 4) {
        throw new ActionsNumberError(metadata.actions.length);
    }

    // Validate each action
    metadata.actions.forEach((action, index) => {
        // Check if action is either BlockchainActionMetadata, TransferAction, or HttpActionMetadata
        if (
            !isBlockchainActionMetadata(action) &&
            !isTransferAction(action) &&
            !HttpActionValidator.isHttpAction(action)
        ) {
            throw new InvalidMetadataError(`Invalid action at index ${index}`);
        }

        // Validate addresses in actions
        if ('address' in action && !isAddress(action.address)) {
            throw new InvalidAddress(action.address);
        }

        if ('to' in action && action.to && !isAddress(action.to)) {
            throw new InvalidAddress(action.to);
        }

        if (!HttpActionValidator.isHttpAction(action)) {
            // Validar el ChainContext
            if (!isValidChainContext(action.chains)) {
                throw new InvalidMetadataError(
                    `Invalid chains configuration in action at index ${index}`,
                );
            }
        }
    });
}

export const helperValidateMetadata = (
    json: string,
): {
    isValid: boolean;
    type: 'Metadata' | 'ValidatedMetadata' | 'Invalid';
    data?: Metadata | ValidatedMetadata;
} => {
    try {
        // Primero parseamos el JSON string a objeto
        const parsedData = JSON.parse(json);

        // Validamos si es una ValidatedMetadata
        if (isValidatedMetadata(parsedData)) {
            return {
                isValid: true,
                type: 'ValidatedMetadata',
                data: parsedData,
            };
        }

        // Si no es ValidatedMetadata, validamos si es Metadata
        if (isMetadata(parsedData)) {
            return {
                isValid: true,
                type: 'Metadata',
                data: parsedData,
            };
        }

        return {
            isValid: false,
            type: 'Invalid',
        };
    } catch (error) {
        console.error('Error validating metadata:', error);
        return {
            isValid: false,
            type: 'Invalid',
        };
    }
};

/**
 * Processes a blockchain action.
 *
 * @param {BlockchainActionMetadata} action - The blockchain action.
 * @returns {BlockchainAction} - The processed action.
 * @throws {FunctionNotFoundError} - If the function is not found in the ABI.
 */
function processAction(action: BlockchainActionMetadata): BlockchainAction {
    const fnc = getAbiFunction(action.abi, action.functionName);
    if (!fnc) {
        throw new FunctionNotFoundError(action.functionName);
    }

    const params: AbiParameter[] = getParameters(action).map(param => ({ ...param })); // Create a mutable copy

    if (action.paramsLabel) {
        replaceParameterNames(params, action.paramsLabel);
    }

    validateParameters(params, action.paramsValue);

    const actionType = getBlockchainActionType(action);

    return { ...action, params: params, blockchainActionType: actionType };
}

function validateParameters(
    params: AbiParameter[],
    paramsValue?: (string | number | bigint | null | boolean)[],
): void {
    if (!paramsValue) return;

    if (paramsValue.length > params.length) {
        throw new InvalidParameterError({
            param: `Too many parameter values provided. Expected ${params.length}, got ${paramsValue.length}`,
        });
    }

    paramsValue.forEach((value, index) => {
        const param = params[index];
        if (!param) return;

        validateSolidityType(value, param.type, param.name);
    });
}

function validateSolidityType(
    value: string | number | bigint | null | boolean,
    type: string,
    name?: string,
): void {
    // Handle null values
    if (value === null) return;

    if (type.startsWith('uint')) {
        if (typeof value !== 'number' && typeof value !== 'bigint') {
            throw new InvalidParameterError({
                param: `Invalid value for type ${type} - name ${name ? name : 'NOT FOUND'}, . Expected number or bigint, got ${typeof value} as ${value}`,
            });
        }
    } else if (type === 'address') {
        if (typeof value !== 'string') {
            throw new InvalidParameterError({
                param: `Invalid value for type ${type} - name ${name ? name : 'NOT FOUND'}. Expected string, got ${typeof value} as ${value}`,
            });
        }

        // Allow 'sender' as valid value
        if (value !== 'sender' && !isAddress(value)) {
            throw new InvalidParameterError({
                param: `Invalid value for type ${type} - name ${name ? name : 'NOT FOUND'}. Expected valid address or 'sender', got ${value}`,
            });
        }
    } else if (type === 'bool') {
        if (typeof value !== 'boolean') {
            throw new InvalidParameterError({
                param: `Invalid value for type ${type} - name ${name ? name : 'NOT FOUND'}. Expected boolean, got ${typeof value} as ${value}`,
            });
        }
    } else if (type === 'string') {
        if (typeof value !== 'string') {
            throw new InvalidParameterError({
                param: `Invalid value for type ${type} - name ${name ? name : 'NOT FOUND'}. Expected string, got ${typeof value} as ${value}`,
            });
        }
    } else if (type === 'bytes') {
        if (typeof value !== 'string') {
            throw new InvalidParameterError({
                param: `Invalid value for type ${type} - name ${name ? name : 'NOT FOUND'}. Expected string, got ${typeof value} as ${value}`,
            });
        }
    } else if (type.startsWith('bytes')) {
        if (typeof value !== 'string') {
            throw new InvalidParameterError({
                param: `Invalid value for type ${type} - name ${name ? name : 'NOT FOUND'}. Expected string, got ${typeof value} as ${value}`,
            });
        }
    }
}

/**
 * Replace param names in tuples
 * @params {AbiParameter[]} params - Array of parameters
 * @params {string[]} labels - Array of names
 */
function replaceParameterNames(params: AbiParameter[], labels: string[]): void {
    for (let i = 0; i < params.length; i++) {
        if (params[i]) {
            const tupleParam = isTupleType(params[i]!);

            if (tupleParam) {
                replaceParameterNames(tupleParam.components, labels);
            } else {
                params[i]!.name = labels[i] ?? (params[i]!.name || '');
            }
        } else {
            throw new Invalidparams();
        }
    }
}

/**
 * Checks if an `AbiParameter` is of type `tuple` or `tuple[]` and has components.
 *
 * @param {AbiParameter} param - The ABI parameter.
 * @returns {AbiParameter & { components: AbiParameter[] } | null} - The parameter with components if it is of type `tuple` or `tuple[]`, otherwise `null`.
 */
function isTupleType(param: AbiParameter): (AbiParameter & { components: AbiParameter[] }) | null {
    if ((param.type === 'tuple' || param.type === 'tuple[]') && 'components' in param) {
        return param as AbiParameter & { components: AbiParameter[] };
    }
    return null;
}

/**
 * Validates that an object conforms to the types of `ValidatedMetadata`.
 *
 * @param {any} obj - The object to validate.
 * @returns {boolean} - True if the object conforms to the types of `ValidatedMetadata`, false otherwise.
 */
export function isValidValidatedMetadata(obj: any): obj is ValidatedMetadata {
    if (typeof obj !== 'object' || obj === null) return false;
    if (!Array.isArray(obj.actions)) return false;
    for (const action of obj.actions) {
        if (!Array.isArray(action.params)) return false;
        if (typeof action.blockchainActionType !== 'string') return false;
    }
    return true;
}

export function isBlockchainActionMetadata(action: any): action is BlockchainActionMetadata {
    return (
        action &&
        typeof action === 'object' &&
        typeof action.label === 'string' &&
        typeof action.address === 'string' &&
        Array.isArray(action.abi) &&
        typeof action.functionName === 'string' &&
        isValidChainContext(action.chains) &&
        (!action.paramsValue || Array.isArray(action.paramsValue)) &&
        (!action.paramsLabel || Array.isArray(action.paramsLabel))
    );
}

// Nueva función auxiliar para validar ChainContext
function isValidChainContext(chains: any): boolean {
    return (
        chains &&
        typeof chains === 'object' &&
        isValidChain(chains.source) &&
        (chains.destination === undefined || isValidChain(chains.destination))
    );
}

export function isBlockchainAction(action: any): action is BlockchainAction {
    return (
        Array.isArray(action.params) &&
        action.params.every(
            (param: any) =>
                typeof param === 'object' &&
                typeof param.type === 'string' &&
                typeof param.name === 'string',
        ) &&
        typeof action.blockchainActionType === 'string' &&
        (!action.paramsValue || Array.isArray(action.paramsValue))
    );
}

export function isTransferAction(action: any): action is TransferAction {
    if (
        action.abi !== undefined ||
        action.functionName !== undefined ||
        action.paramsValue !== undefined ||
        action.paramsLabel !== undefined
    ) {
        return false;
    }

    return (
        action &&
        typeof action === 'object' &&
        typeof action.label === 'string' &&
        isValidChainContext(action.chains) &&
        (action.to === undefined ||
            (typeof action.to === 'string' && action.to.startsWith('0x'))) &&
        (action.amount === undefined || typeof action.amount === 'number')
    );
}

export function isMetadata(json: any): json is Metadata {
    return (
        json &&
        typeof json === 'object' &&
        typeof json.icon === 'string' &&
        typeof json.title === 'string' &&
        typeof json.description === 'string' &&
        Array.isArray(json.actions) &&
        json.actions.every(
            (action: any) =>
                isBlockchainActionMetadata(action) ||
                isTransferAction(action) ||
                HttpActionValidator.isHttpAction(action),
        )
    );
}

export function isValidatedMetadata(json: any): json is ValidatedMetadata {
    if (!json || typeof json !== 'object') return false;

    // Validar propiedades básicas
    const hasRequiredProps =
        typeof json.url === 'string' &&
        typeof json.icon === 'string' &&
        typeof json.title === 'string' &&
        typeof json.description === 'string' &&
        Array.isArray(json.actions);

    if (!hasRequiredProps) return false;

    // Validar cada acción
    return json.actions.every((action: any) => {
        if (isTransferAction(action)) {
            return true;
        }
        if (HttpActionValidator.isHttpAction(action)) {
            return true;
        }
        // Para BlockchainAction, validar como BlockchainAction completo
        if (isBlockchainAction(action)) {
            return true;
        }
        return false;
    });
}

const isValidChain = (chain: any): chain is Chain => {
    return (
        typeof chain === 'string' &&
        ['avalanche', 'fuji', 'celo', 'alfajores', 'monad-testnet'].includes(chain)
    );
};
