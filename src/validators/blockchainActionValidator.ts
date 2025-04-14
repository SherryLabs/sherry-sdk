import { Abi, AbiFunction, AbiParameter, AbiStateMutability, AbiType } from 'abitype';
import { ContractFunctionName, isAddress } from 'viem';
import {
    BlockchainActionMetadata,
    BlockchainAction,
    BlockchainParameter,
    StandardParameter,
    SelectParameter,
    RadioParameter,
    BaseInputType,
    UIInputType,
} from '../interface/blockchainAction';
import { ChainContext } from '../interface/chains';
import { SherryValidationError, ActionValidationError } from '../errors/customErrors';
import { ParameterValidator } from './parameterValidator';

/**
 * Validator class for Blockchain Actions
 */
export class BlockchainActionValidator {
    /**
     * Formats a parameter name to make it more user-friendly
     * @param name Original parameter name
     * @returns Formatted parameter name
     */
    static formatParamName(name: string): string {
        // Convert camelCase or snake_case to Title Case with spaces
        return name
            .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
            .trim();
    }

    /**
     * Validates a blockchain action and returns it if valid
     */
    static validateBlockchainAction(action: BlockchainActionMetadata): BlockchainAction {
        this.validateBlockchainActionMetadata(action);

        // Get the ABI parameters
        const abiParams = this.getAbiParameters(action);

        // Get the blockchain action type
        const blockchainActionType = this.getBlockchainActionType(action);

        // Check if there's an ABI parameter named 'amount' to avoid confusion with top-level amount
        const hasAmountParameter = abiParams.some(param => param.name === 'amount');

        // Only throw error if function is not payable, has top-level amount property,
        // and doesn't have a parameter named 'amount' in its ABI
        if (
            blockchainActionType !== 'payable' &&
            action.amount !== undefined &&
            !hasAmountParameter
        ) {
            throw new ActionValidationError(
                'The action is not payable, "amount" should not be provided',
            );
        }

        // Return the processed action with additional info
        return {
            ...action,
            abiParams: [...abiParams], // Create a mutable copy of the readonly array
            blockchainActionType,
        };
    }

    /**
     * Validates that an object is a valid BlockchainActionMetadata
     */
    static validateBlockchainActionMetadata(action: any): boolean {
        // Validate basic properties
        if (!action || typeof action !== 'object') {
            throw new ActionValidationError('The action must be a valid object');
        }

        if (typeof action.label !== 'string' || !action.label) {
            throw new ActionValidationError('The action must have a valid label');
        }

        // Validate contract address
        if (
            !action.address ||
            typeof action.address !== 'string' ||
            !action.address.startsWith('0x')
        ) {
            throw new ActionValidationError(
                'The action must have a valid contract address (format 0x...)',
            );
        }

        if (!isAddress(action.address)) {
            throw new ActionValidationError(`Invalid address: ${action.address}`);
        }

        // Validate ABI
        if (!Array.isArray(action.abi) || action.abi.length === 0) {
            throw new ActionValidationError('The action must have a valid ABI');
        }

        // Validate function name
        if (typeof action.functionName !== 'string' || !action.functionName) {
            throw new ActionValidationError('The action must have a valid function name');
        }

        // Validate that the function exists in the ABI
        if (!this.isValidFunction(action.abi, action.functionName)) {
            throw new ActionValidationError(
                `The function "${action.functionName}" does not exist in the provided ABI`,
            );
        }

        // Validate chains
        if (!this.validateChainContext(action.chains)) {
            throw new ActionValidationError('The action must have a valid chains configuration');
        }

        // Validate amount if present
        if (
            action.amount !== undefined &&
            (typeof action.amount !== 'number' || action.amount < 0)
        ) {
            throw new ActionValidationError(
                'If "amount" is provided, it must be a positive number',
            );
        }

        // Validate parameters if present
        if (action.params !== undefined) {
            this.validateBlockchainParameters(action.params, this.getAbiParameters(action));
        }

        return true;
    }

    /**
     * Validates that the chain context is valid
     */
    static validateChainContext(chains: ChainContext): boolean {
        if (!chains || typeof chains !== 'object') {
            return false;
        }

        // Validate source chain
        if (!chains.source || !this.isValidChain(chains.source)) {
            return false;
        }

        // Validate destination chain if present
        if (chains.destination !== undefined && !this.isValidChain(chains.destination)) {
            return false;
        }

        return true;
    }

    /**
     * Validates that a chain is valid
     */
    static isValidChain(chain: any): boolean {
        const validChains = ['fuji', 'avalanche', 'alfajores', 'celo', 'monad-testnet', 'ethereum'];
        return typeof chain === 'string' && validChains.includes(chain);
    }

    /**
     * Validates that blockchain parameters are valid
     */
    static validateBlockchainParameters(
        params: BlockchainParameter[],
        abiParams: readonly AbiParameter[],
    ): boolean {
        if (!Array.isArray(params)) {
            throw new ActionValidationError('Parameters must be an array');
        }

        // Validate that each parameter has a name that matches the ABI
        const abiParamNames = abiParams.map(p => p.name);

        for (const param of params) {
            // Validate basic properties
            if (typeof param.name !== 'string' || !param.name) {
                throw new ActionValidationError('Each parameter must have a valid name');
            }

            if (typeof param.label !== 'string' || !param.label) {
                throw new ActionValidationError(
                    `The parameter "${param.name}" must have a valid label`,
                );
            }

            // Verify that the parameter name exists in the ABI
            if (!abiParamNames.includes(param.name)) {
                throw new ActionValidationError(
                    `The parameter "${param.name}" does not exist in the function's ABI`,
                );
            }

            // Validate according to parameter type
            if (this.isStandardParameter(param)) {
                this.validateStandardParameter(param);
            } else if (this.isSelectParameter(param)) {
                this.validateSelectParameter(param);
            } else if (this.isRadioParameter(param)) {
                this.validateRadioParameter(param);
            } else {
                throw new ActionValidationError(`Unknown parameter type for "${param}"`);
            }

            // Validate default value according to the parameter type in the ABI
            if (param.value !== undefined) {
                const abiParam = abiParams.find(p => p.name === param.name);
                if (abiParam) {
                    this.validateParameterValue(param.value, abiParam.type, param.name);
                }
            }
        }

        return true;
    }

    /**
     * Validates that a standard parameter is valid
     */
    static validateStandardParameter(param: StandardParameter): boolean {
        // Validate type-specific properties
        if (
            param.minLength !== undefined &&
            (typeof param.minLength !== 'number' || param.minLength < 0)
        ) {
            throw new ActionValidationError(
                `The parameter "${param.name}" has an invalid minLength`,
            );
        }

        if (
            param.maxLength !== undefined &&
            (typeof param.maxLength !== 'number' || param.maxLength < 0)
        ) {
            throw new ActionValidationError(
                `The parameter "${param.name}" has an invalid maxLength`,
            );
        }

        if (param.min !== undefined && typeof param.min !== 'number') {
            throw new ActionValidationError(`The parameter "${param.name}" has an invalid min`);
        }

        if (param.max !== undefined && typeof param.max !== 'number') {
            throw new ActionValidationError(`The parameter "${param.name}" has an invalid max`);
        }

        if (param.min !== undefined && param.max !== undefined && param.min > param.max) {
            throw new ActionValidationError(`The parameter "${param.name}" has min > max`);
        }

        if (param.pattern !== undefined && typeof param.pattern !== 'string') {
            throw new ActionValidationError(`The parameter "${param.name}" has an invalid pattern`);
        }

        // Validate that the pattern is a valid regex
        if (param.pattern) {
            try {
                new RegExp(param.pattern);
            } catch (e) {
                console.error('Error in validateStandardParameter: ', e);
                throw new ActionValidationError(
                    `The parameter "${param.name}" has a pattern that is not a valid regex`,
                );
            }
        }

        return true;
    }

    /**
     * Validates that a selection parameter is valid
     */
    static validateSelectParameter(param: SelectParameter): boolean {
        if (!Array.isArray(param.options) || param.options.length === 0) {
            throw new ActionValidationError(
                `The parameter "${param.name}" must have valid options`,
            );
        }

        // Validate each option
        for (const option of param.options) {
            if (typeof option.label !== 'string' || !option.label) {
                throw new ActionValidationError(
                    `The parameter "${param.name}" has an option with an invalid label`,
                );
            }

            if (option.value === undefined) {
                throw new ActionValidationError(
                    `The parameter "${param.name}" has an option without a value`,
                );
            }
        }

        // Validate that there are no duplicate options
        const values = param.options.map(o => o.value);
        if (new Set(values).size !== values.length) {
            throw new ActionValidationError(
                `The parameter "${param.name}" has options with duplicate values`,
            );
        }

        return true;
    }

    /**
     * Validates that a radio parameter is valid
     */
    static validateRadioParameter(param: RadioParameter): boolean {
        // Verify that options exist and are an array
        if (!Array.isArray(param.options)) {
            throw new ActionValidationError(
                `The radio parameter "${param.name}" must have an array of options`,
            );
        }

        // Verify that there are at least two options (a radio button typically needs multiple options)
        if (param.options.length < 2) {
            throw new ActionValidationError(
                `The radio parameter "${param.name}" must have at least 2 options`,
            );
        }

        // Validate each option individually
        for (const option of param.options) {
            // Validate label
            if (typeof option.label !== 'string' || !option.label.trim()) {
                throw new ActionValidationError(
                    `The parameter "${param.name}" has an option with an empty or invalid label`,
                );
            }

            // Validate value
            if (option.value === undefined || option.value === null) {
                throw new ActionValidationError(
                    `The parameter "${param.name}" has an option without a defined value`,
                );
            }

            // Verify that the value type is compatible (string, number, or boolean)
            if (
                typeof option.value !== 'string' &&
                typeof option.value !== 'number' &&
                typeof option.value !== 'boolean'
            ) {
                throw new ActionValidationError(
                    `The parameter "${param.name}" has an option with an invalid value type. Must be string, number or boolean`,
                );
            }
        }

        // Validate that there are no duplicate options (by value)
        const values = param.options.map(o => o.value);
        if (new Set(values).size !== values.length) {
            throw new ActionValidationError(
                `The parameter "${param.name}" has options with duplicate values`,
            );
        }

        // Validate that there are no duplicate labels
        const labels = param.options.map(o => o.label);
        if (new Set(labels).size !== labels.length) {
            throw new ActionValidationError(
                `The parameter "${param.name}" has options with duplicate labels`,
            );
        }

        // Validate that the default value (if it exists) is one of the valid options
        if (param.value !== undefined) {
            const isValidValue = param.options.some(option => option.value === param.value);
            if (!isValidValue) {
                throw new ActionValidationError(
                    `The default value "${param.value}" for parameter "${param.name}" is not among the available options`,
                );
            }
        }

        return true;
    }

    /**
     * Validates that a value is compatible with a Solidity type
     */
    static validateParameterValue(value: any, type: string, paramName: string): boolean {
        // Null values are valid (for optional parameters)
        if (value === null || value === undefined) {
            return true;
        }

        // Validate according to Solidity type
        if (type.startsWith('uint') || type.startsWith('int')) {
            // For numeric types
            if (
                typeof value !== 'number' &&
                typeof value !== 'string' &&
                typeof value !== 'bigint'
            ) {
                throw new ActionValidationError(
                    `The value for "${paramName}" must be a number (type ${type})`,
                );
            }

            // If it's a string, it must be a number
            if (typeof value === 'string' && !/^-?\d+$/.test(value)) {
                throw new ActionValidationError(
                    `The value for "${paramName}" must be a valid number (type ${type})`,
                );
            }
        } else if (type === 'address') {
            // For Ethereum addresses
            if (typeof value !== 'string') {
                throw new ActionValidationError(
                    `The value for "${paramName}" must be a string (type address)`,
                );
            }

            // Special allowed values
            if (value !== 'sender' && !isAddress(value)) {
                throw new ActionValidationError(
                    `The value for "${paramName}" must be a valid address or "sender"`,
                );
            }
        } else if (type === 'bool') {
            // For booleans
            if (typeof value !== 'boolean') {
                throw new ActionValidationError(
                    `The value for "${paramName}" must be a boolean (type bool)`,
                );
            }
        } else if (type === 'string') {
            // For strings
            if (typeof value !== 'string') {
                throw new ActionValidationError(
                    `The value for "${paramName}" must be a string (type string)`,
                );
            }
        } else if (type.startsWith('bytes')) {
            // For bytes
            if (typeof value !== 'string') {
                throw new ActionValidationError(
                    `The value for "${paramName}" must be a string (type ${type})`,
                );
            }

            // If it's fixed bytes, validate length
            if (type !== 'bytes' && type.startsWith('bytes')) {
                const size = parseInt(type.replace('bytes', ''));
                // Each byte is 2 characters in hex
                if (value.startsWith('0x') && value.length !== 2 + size * 2) {
                    throw new ActionValidationError(
                        `The value for "${paramName}" has an incorrect length for ${type}`,
                    );
                }
            }
        }

        return true;
    }

    /**
     * Gets all valid input types from our type definitions
     * @returns Array of valid input type strings
     */
    static getValidInputTypes(): string[] {
        // Include all UI-specific input types
        const uiTypes: string[] = [
            'text',
            'number',
            'email',
            'url',
            'datetime',
            'textarea',
        ];

        // Include all Solidity types from AbiType (which is a union type)
        const solidityTypes: string[] = [
            'address',
            'bool',
            'bytes',
            'function',
            'string',
            'tuple',
            // Add all uint and int types
            ...Array.from({ length: 32 }, (_, i) => `uint${(i + 1) * 8}`),
            ...Array.from({ length: 32 }, (_, i) => `int${(i + 1) * 8}`),
            // Add the byte types
            ...Array.from({ length: 32 }, (_, i) => `bytes${i + 1}`),
            // Add array types
            'uint256[]',
            'string[]',
            'address[]',
            'bool[]',
            'bytes[]',
        ];

        return [...uiTypes, ...solidityTypes];
    }

    /**
     * Checks if an object is a standard parameter
     */
    static isStandardParameter(param: any): param is StandardParameter {
        // Get all valid types
        const validTypes = this.getValidInputTypes();
        
        return (
            param &&
            typeof param === 'object' &&
            typeof param.type === 'string' &&
            (
                // Check if it's one of our recognized types
                validTypes.includes(param.type) ||
                // Allow array types like uint256[] that might not be in our list
                param.type.endsWith('[]') ||
                // Special case for tuples
                param.type === 'tuple'
            )
        );
    }

    /**
     * Checks if an object is a selection parameter
     */
    static isSelectParameter(param: any): param is SelectParameter {
        return (
            param &&
            typeof param === 'object' &&
            param.type === 'select' &&
            Array.isArray(param.options)
        );
    }

    /**
     * Checks if an object is a radio parameter
     */
    static isRadioParameter(param: any): param is RadioParameter {
        return (
            param &&
            typeof param === 'object' &&
            param.type === 'radio' &&
            Array.isArray(param.options)
        );
    }

    /**
     * Gets a function from the ABI by its name
     */
    static getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction {
        const abiFunction = abi.find(
            (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
        );
        if (!abiFunction) {
            throw new ActionValidationError(`Function "${functionName}" not found in the ABI`);
        }
        return abiFunction;
    }

    /**
     * Checks if a function exists in the ABI
     */
    static isValidFunction(abi: Abi, functionName: ContractFunctionName): boolean {
        return abi.some(
            (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
        );
    }

    /**
     * Gets the parameters of a function from the ABI
     */
    static getAbiParameters(action: BlockchainActionMetadata): readonly AbiParameter[] {
        const abiFunction = this.getAbiFunction(action.abi, action.functionName);
        return abiFunction.inputs;
    }

    /**
     * Gets the state mutability type of a function from the ABI
     */
    static getBlockchainActionType(action: BlockchainActionMetadata): AbiStateMutability {
        const abiFunction = this.getAbiFunction(action.abi, action.functionName);
        return abiFunction.stateMutability;
    }

    /**
     * Checks if an object is a valid BlockchainActionMetadata
     */
    static isBlockchainActionMetadata(obj: any): obj is BlockchainActionMetadata {
        return (
            obj &&
            typeof obj === 'object' &&
            typeof obj.label === 'string' &&
            typeof obj.address === 'string' &&
            Array.isArray(obj.abi) &&
            typeof obj.functionName === 'string' &&
            obj.chains &&
            typeof obj.chains === 'object' &&
            typeof obj.chains.source === 'string'
        );
    }

    /**
     * Checks if an object is a BlockchainAction
     */
    static isBlockchainAction(obj: any): obj is BlockchainAction {
        return (
            this.isBlockchainActionMetadata(obj) &&
            //'blockchainActionType' in obj &&
            Array.isArray((obj as any).abiParams)
        );
    }

    /**
     * Gets the appropriate input type for the given parameter based on ABI
     * @param abiParam ABI parameter
     * @returns Input type
     */
    static getInputTypeFromAbiParam(abiParam: AbiParameter): BaseInputType {
        // First check the main type
        if (abiParam.type.startsWith('uint') || abiParam.type.startsWith('int')) {
            return 'number';
        } else if (abiParam.type === 'address') {
            return 'address';
        } else if (abiParam.type === 'bool') {
            return 'bool';
        } else if (abiParam.type === 'string') {
            return 'text';
        } else if (abiParam.type === 'tuple') {
            return 'tuple';
        } else if (abiParam.type.endsWith('[]')) {
            // For arrays, use the base type
            return this.getInputTypeFromAbiParam({
                ...abiParam,
                type: abiParam.type.substring(0, abiParam.type.length - 2) as AbiType,
            });
        }

        // Default to text for other types
        return 'text';
    }

    /**
     * Processes params for a blockchain action, ensuring they have all required fields
     * @param action Blockchain action to validate
     * @param abiParams ABI parameters for the function
     * @throws SherryValidationError if params are invalid
     */
    static processParams(
        action: BlockchainActionMetadata,
        abiParams: AbiParameter[],
    ): BlockchainParameter[] {
        // For each ABI param, find or create the corresponding param
        return abiParams.map((abiParam, i) => {
            const inputType = this.getInputTypeFromAbiParam(abiParam);
            
            // Check if there's a matching param in the action
            let param = action.params?.find(p => p.name === abiParam.name);

            if (!param) {
                // If not found, create a default parameter based on ABI
                if (inputType === 'tuple') {
                    // For tuple types, create a special parameter with object type
                    return {
                        name: abiParam.name,
                        label: this.formatParamName(abiParam.name!),
                        type: 'tuple' as BaseInputType,
                        required: true,
                        value: {},
                    } as StandardParameter;
                } else {
                    // For regular types, create a standard parameter
                    return {
                        name: abiParam.name,
                        label: this.formatParamName(abiParam.name!),
                        type: inputType,
                        required: true,
                    } as StandardParameter;
                }
            }

            // For standard parameters, ensure they have a type
            if (this.isStandardParameter(param) && !param.type) {
                (param as StandardParameter).type = inputType;
            }

            // Validate the parameter
            ParameterValidator.validateParameter(param);
            
            return param;
        });
    }
}

// Export standalone functions for backward compatibility
export function isBlockchainActionMetadata(obj: any): obj is BlockchainActionMetadata {
    return BlockchainActionValidator.isBlockchainActionMetadata(obj);
}

export function isBlockchainAction(obj: any): obj is BlockchainAction {
    return BlockchainActionValidator.isBlockchainAction(obj);
}
