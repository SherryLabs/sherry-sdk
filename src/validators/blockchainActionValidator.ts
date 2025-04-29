import { Abi, AbiFunction, AbiParameter, AbiStateMutability, AbiType } from 'abitype';
import { ContractFunctionName, isAddress } from 'viem';
import {
    BlockchainActionMetadata,
    BlockchainAction,
    BlockchainParameter,
} from '../interface/actions/blockchainAction';
import { BaseInputType, UIInputType, SelectionInputType } from '../interface/inputs';
import { ChainContext } from '../interface/chains';
import { SherryValidationError, ActionValidationError } from '../errors/customErrors';
import {
    StandardParameter,
    SelectParameter,
    RadioParameter,
    SelectOption,
} from '../interface/inputs';

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
        try {
            // Validate basic metadata structure and ABI/function existence first
            BlockchainActionValidator.validateBlockchainActionMetadataStructure(action);

            // Get the ABI parameters for the specified function
            const abiParams = BlockchainActionValidator.getAbiParameters(action);

            // Get the blockchain action type (mutability)
            const blockchainActionType = BlockchainActionValidator.getBlockchainActionType(action);

            // Validate 'amount' property based on mutability - Check before parameter validation
            const hasAmountParameterInAbi = abiParams.some(param => param.name === 'amount');
            if (
                blockchainActionType !== 'payable' &&
                action.amount !== undefined &&
                !hasAmountParameterInAbi // Allow top-level amount only if there's an ABI param named 'amount'
            ) {
                throw new ActionValidationError(
                    'The action function is not payable according to the ABI, but an "amount" was provided at the top level.',
                );
            }

            console.log('ABI Parameters:', abiParams);
            console.log('Action Parameters:', action.params);
            // Validate the user-provided parameters against the ABI parameters
            if (action.params) {
                if (action.params.length !== abiParams.length) {
                    // If ABI expects params but none are provided
                    throw new ActionValidationError(
                        `Function ${action.functionName} expects ${abiParams.length} parameters, but received ${action.params.length}.`,
                    );
                }
                // Parameter count check moved inside validateBlockchainParameters
                BlockchainActionValidator.validateBlockchainParameters(
                    action.params,
                    abiParams,
                    action.functionName,
                );
            }

            // Validate payable function without amount (if no 'amount' param in ABI)
            if (
                blockchainActionType === 'payable' &&
                action.amount === undefined &&
                !hasAmountParameterInAbi
            ) {
                throw new ActionValidationError(
                    `Payable function ${action.functionName} called without a top-level 'amount' and no 'amount' parameter.`,
                );
            }

            // Return the processed action with additional info
            return {
                ...action,
                abiParams: [...abiParams], // Create a mutable copy of the readonly array
                blockchainActionType,
            };
        } catch (error) {
            if (error instanceof ActionValidationError || error instanceof SherryValidationError) {
                // If the error is already a known validation error, rethrow it
                throw error;
            } else {
                // Wrap unexpected errors
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new ActionValidationError(
                    `Unexpected error validating blockchain action: ${errorMessage}`,
                );
            }
        }
    }

    /**
     * Validates the basic structure of BlockchainActionMetadata (address, abi, functionName, etc.)
     * Does NOT validate parameters against ABI yet.
     */
    static validateBlockchainActionMetadataStructure(action: any): void {
        if (!action || typeof action !== 'object') {
            throw new ActionValidationError('The action must be a valid object');
        }
        if (typeof action.label !== 'string' || !action.label) {
            throw new ActionValidationError('The action must have a valid label');
        }
        if (!action.address || typeof action.address !== 'string' || !isAddress(action.address)) {
            throw new ActionValidationError(
                `Invalid or missing contract address: ${action.address}`,
            );
        }
        if (!Array.isArray(action.abi) || action.abi.length === 0) {
            throw new ActionValidationError('The action must have a valid ABI (non-empty array)');
        }
        if (typeof action.functionName !== 'string' || !action.functionName) {
            throw new ActionValidationError('The action must have a valid function name');
        }
        if (!this.isValidFunction(action.abi, action.functionName)) {
            throw new ActionValidationError(
                `The function "${action.functionName}" does not exist in the provided ABI`,
            );
        }
        if (!this.validateChainContext(action.chains)) {
            throw new ActionValidationError(
                'The action must have a valid chains configuration (source required)',
            );
        }
        if (
            action.amount !== undefined &&
            (typeof action.amount !== 'number' || action.amount < 0)
        ) {
            throw new ActionValidationError(
                'If "amount" is provided, it must be a non-negative number',
            );
        }
        // Basic validation of params structure if present
        if (action.params !== undefined && !Array.isArray(action.params)) {
            throw new ActionValidationError('If "params" is provided, it must be an array');
        }
    }

    /**
     * Validates the chain context (source required, destination optional)
     */
    static validateChainContext(chains: ChainContext): boolean {
        if (!chains || typeof chains !== 'object') return false;
        if (!chains.source || !this.isValidChain(chains.source)) return false;
        if (chains.destination !== undefined && !this.isValidChain(chains.destination))
            return false;
        return true;
    }

    /**
     * Validates that a chain identifier is valid
     */
    static isValidChain(chain: any): boolean {
        // Consider making this list configurable or importing from a central place
        const validChains = ['fuji', 'avalanche', 'alfajores', 'celo', 'monad-testnet', 'ethereum'];
        return typeof chain === 'string' && validChains.includes(chain);
    }

    /**
     * Validates user-provided parameters against the ABI parameters, including type compatibility.
     * Completely refactored with a cleaner approach based on explicit parameter type.
     */
    static validateBlockchainParameters(
        params: BlockchainParameter[],
        abiParams: readonly AbiParameter[],
        functionName: string,
    ): void {
        if (!Array.isArray(params)) {
            throw new ActionValidationError(
                `Parameters for function ${functionName} must be an array.`,
            );
        }
        if (params.length !== abiParams.length) {
            throw new ActionValidationError(
                `Function ${functionName} expects ${abiParams.length} parameters, but received ${params.length}.`,
            );
        }

        for (let i = 0; i < abiParams.length; i++) {
            const abiParam = abiParams[i];
            const userParam = params[i];
            const abiType = abiParam.type as AbiType; // Cast for convenience

            // --- 1. Basic Structural Validation For All Parameter Types ---
            this.validateBasicParameterStructure(userParam, i, functionName);

            if (userParam.name !== abiParam.name) {
                throw new ActionValidationError(
                    `Parameter name mismatch at index ${i} for function ${functionName}. Expected '${abiParam.name}', received '${userParam.name}'. Parameters must be in the same order as the ABI.`,
                );
            }

            // Validate common optional properties (description, required, fixed) that apply to all parameter types
            this.validateCommonOptionalProperties(userParam);

            // Option for debugging - uncomment if needed
            /*
            console.log(`Parameter ${userParam.name} validation:`, {
                name: userParam.name,
                type: userParam.type || 'undefined',
                value: userParam.value,
                fixed: userParam.fixed,
                abiType
            });
            */

            // --- 2. Determine Parameter Type Explicitly ---
            try {
                // First, determine the type of parameter we're dealing with
                const paramType = userParam.type;

                // --- 3. Handle Fixed Value Validation (common to all parameter types) ---
                // This must be done before type-specific validation since 'fixed' is in BaseParameter
                if (userParam.fixed === true) {
                    // CORREGIDO
                    if (userParam.value === undefined) {
                        throw new ActionValidationError(
                            `Parameter "${userParam.name}" is marked as 'fixed: true' but is missing a 'value'.`,
                        );
                    }

                    // Validate the fixed value's compatibility
                    if (!this.isValueCompatible(userParam.value, abiType)) {
                        throw new ActionValidationError(
                            `Fixed 'value' for parameter '${userParam.name}' is not compatible with ABI type '${abiType}'. ` +
                                `Value: ${JSON.stringify(userParam.value)} (type: ${typeof userParam.value})`,
                        );
                    }
                }

                // --- 4. Type-Specific Validation ---
                // Now branch based on the parameter type for type-specific validation
                if (paramType === 'select' || paramType === 'radio') {
                    // SELECT or RADIO parameter validation
                    this.validateSelectionParameter(
                        userParam as SelectParameter | RadioParameter,
                        abiType,
                    );
                } else {
                    // STANDARD parameter validation (includes all standard types like text, number, etc)
                    // We also determine the effective type to use for validation if none was specified
                    const effectiveType = paramType || this.getInputTypeFromAbiType(abiType);
                    this.validateStandardParameter(
                        userParam as StandardParameter,
                        abiType,
                        effectiveType,
                    );
                }
            } catch (error) {
                if (error instanceof ActionValidationError) {
                    throw error; // Re-throw validation errors as is
                } else {
                    // Wrap unexpected errors with more context
                    throw new ActionValidationError(
                        `Error validating parameter '${userParam.name}': ${
                            error instanceof Error ? error.message : String(error)
                        }`,
                    );
                }
            }
        }
    }

    /**
     * Validates the basic structure that all parameter types must have.
     */
    private static validateBasicParameterStructure(
        param: any,
        index: number,
        functionName: string,
    ): void {
        if (!param || typeof param !== 'object') {
            throw new ActionValidationError(
                `Invalid parameter definition at index ${index} for function ${functionName}.`,
            );
        }
        if (typeof param.name !== 'string' || !param.name) {
            throw new ActionValidationError(
                `Parameter at index ${index} for function ${functionName} must have a valid name.`,
            );
        }
        if (typeof param.label !== 'string' || !param.label) {
            throw new ActionValidationError(`Parameter "${param.name}" must have a valid label.`);
        }
    }

    /**
     * Validates common optional properties present in BaseParameter.
     */
    private static validateCommonOptionalProperties(param: BlockchainParameter): void {
        if (param.required !== undefined && typeof param.required !== 'boolean') {
            throw new ActionValidationError(
                `Parameter "${param.name}" has an invalid 'required' value (must be boolean).`,
            );
        }
        if (param.description !== undefined && typeof param.description !== 'string') {
            throw new ActionValidationError(
                `Parameter "${param.name}" has an invalid 'description' value (must be string).`,
            );
        }
        if (param.fixed !== undefined && typeof param.fixed !== 'boolean') {
            throw new ActionValidationError(
                `Parameter "${param.name}" has an invalid 'fixed' value (must be boolean).`,
            );
        }
    }

    /**
     * Validates a standard parameter (text, number, etc.)
     */
    private static validateStandardParameter(
        param: StandardParameter,
        abiType: AbiType,
        effectiveType: string,
    ): void {
        // Validate type compatibility
        if (this.isAbiType(effectiveType) && effectiveType !== abiType) {
            throw new ActionValidationError(
                `Type mismatch for parameter '${param.name}'. ABI expects '${abiType}', but received direct type '${effectiveType}'.`,
            );
        }
        if (this.isUIType(effectiveType) && !this.isUITypeCompatible(effectiveType, abiType)) {
            throw new ActionValidationError(
                `UI type '${effectiveType}' for parameter '${param.name}' is not compatible with ABI type '${abiType}'.`,
            );
        }

        // Validate default value if present and not fixed (fixed values were validated earlier)
        if (param.value !== undefined && param.fixed !== true) {
            if (!this.isValueCompatible(param.value, abiType)) {
                throw new ActionValidationError(
                    `Default 'value' for parameter '${param.name}' is not compatible with ABI type '${abiType}'. ` +
                        `Value: ${JSON.stringify(param.value)}`,
                );
            }
        }

        // Validate standard specific properties
        this.validateStandardParameterProperties(param);
    }

    /**
     * Validates a selection parameter (select, radio)
     */
    /**
     * Validates a selection parameter (select, radio)
     */
    private static validateSelectionParameter(
        param: SelectParameter | RadioParameter,
        abiType: AbiType,
    ): void {
        // Validate options array
        if (!param.options || !Array.isArray(param.options) || param.options.length === 0) {
            throw new ActionValidationError(
                `Parameter '${param.name}' of type '${param.type}' must have a non-empty 'options' array.`,
            );
        }

        // Validate each option
        for (const option of param.options) {
            if (typeof option.label !== 'string' || !option.label) {
                throw new ActionValidationError(
                    `Parameter '${param.name}' has an option with an invalid label.`,
                );
            }
            if (option.value === undefined) {
                throw new ActionValidationError(
                    `Parameter '${param.name}' has an option (label: "${option.label}") without a value.`,
                );
            }
            if (!this.isValueCompatible(option.value, abiType)) {
                throw new ActionValidationError(
                    `Invalid option value '${typeof option.value === 'object' ? JSON.stringify(option.value) : option.value}' ` +
                        `(label: "${option.label}") for parameter '${param.name}'. ` +
                        `Expected value compatible with ABI type '${abiType}'.`,
                );
            }
        }

        // Validate default value (non-fixed) if present
        // Fixed values were already validated in the common section
        if (param.value !== undefined && param.fixed !== true) {
            // Ensure the value is valid for the ABI type
            if (!this.isValueCompatible(param.value, abiType)) {
                throw new ActionValidationError(
                    `Default 'value' for parameter '${param.name}' is not compatible with ABI type '${abiType}'. ` +
                        `Value: ${JSON.stringify(param.value)}`,
                );
            }

            // Ensure value exists in options
            const valueExists = param.options.some(opt => {
                // Use deep comparison for objects
                if (typeof param.value === 'object' && param.value !== null) {
                    return JSON.stringify(opt.value) === JSON.stringify(param.value);
                }
                return opt.value === param.value;
            });

            if (!valueExists) {
                throw new ActionValidationError(
                    `Default 'value' for parameter '${param.name}' does not match any option. ` +
                        `Value: ${JSON.stringify(param.value)}`,
                );
            }
        }

        // Validate selection structure (duplicates, etc.)
        this.validateSelectionOptions(param);
    }

    /**
     * Validates properties specific to StandardParameter (minLength, pattern, etc.).
     */
    private static validateStandardParameterProperties(param: StandardParameter): void {
        if (
            param.minLength !== undefined &&
            (typeof param.minLength !== 'number' || param.minLength < 0)
        ) {
            throw new ActionValidationError(
                `Parameter "${param.name}" has an invalid 'minLength'.`,
            );
        }
        if (
            param.maxLength !== undefined &&
            (typeof param.maxLength !== 'number' || param.maxLength < 0)
        ) {
            throw new ActionValidationError(
                `Parameter "${param.name}" has an invalid 'maxLength'.`,
            );
        }
        if (
            param.minLength !== undefined &&
            param.maxLength !== undefined &&
            param.minLength > param.maxLength
        ) {
            throw new ActionValidationError(`Parameter "${param.name}" has minLength > maxLength.`);
        }
        if (param.min !== undefined && typeof param.min !== 'number') {
            throw new ActionValidationError(
                `Parameter "${param.name}" has an invalid 'min' value.`,
            );
        }
        if (param.max !== undefined && typeof param.max !== 'number') {
            throw new ActionValidationError(
                `Parameter "${param.name}" has an invalid 'max' value.`,
            );
        }
        if (param.min !== undefined && param.max !== undefined && param.min > param.max) {
            throw new ActionValidationError(`Parameter "${param.name}" has min > max.`);
        }
        if (param.pattern !== undefined) {
            if (typeof param.pattern !== 'string') {
                throw new ActionValidationError(
                    `Parameter "${param.name}" has an invalid 'pattern' (must be string).`,
                );
            }
            try {
                new RegExp(param.pattern);
            } catch (e) {
                throw new ActionValidationError(
                    `Parameter "${param.name}" has an invalid regex pattern: ${e instanceof Error ? e.message : e}`,
                );
            }
        }
    }

    /**
     * Validates structural properties of Select/Radio options (duplicates).
     */
    private static validateSelectionOptions(param: SelectParameter | RadioParameter): void {
        // Check for duplicate values
        const uniqueValues = new Set();
        for (const option of param.options) {
            const valueStr =
                typeof option.value === 'object' && option.value !== null
                    ? JSON.stringify(option.value)
                    : String(option.value);

            if (uniqueValues.has(valueStr)) {
                throw new ActionValidationError(
                    `Parameter "${param.name}" has options with duplicate values.`,
                );
            }
            uniqueValues.add(valueStr);
        }

        // Check for duplicate labels
        const labels = param.options.map(o => o.label);
        if (new Set(labels).size !== labels.length) {
            throw new ActionValidationError(
                `Parameter "${param.name}" has options with duplicate labels.`,
            );
        }

        // Radio type specific validation
        if (param.type === 'radio' && param.options.length < 2) {
            throw new ActionValidationError(
                `Radio parameter "${param.name}" must have at least 2 options.`,
            );
        }
    }

    /**
     * Maps ABI types to appropriate input types.
     */
    private static getInputTypeFromAbiType(abiType: AbiType): string {
        if (abiType === 'address') return 'address';
        if (abiType === 'bool') return 'bool';
        if (abiType === 'string') return 'text';
        if (abiType.startsWith('uint') || abiType.startsWith('int')) return 'number';
        if (abiType.startsWith('bytes')) return 'text'; // bytes as hex strings
        if (abiType.endsWith('[]')) return 'text'; // arrays as JSON strings
        return 'text'; // Default fallback to 'text'
    }

    /**
     * Checks if a type string represents a known ABI type.
     */
    private static isAbiType(type: string): type is AbiType {
        if (!type) return false;
        // Basic types
        const basicAbiTypes: Set<string> = new Set([
            'address',
            'bool',
            'string',
            'bytes',
            'function',
            'tuple',
        ]);
        if (basicAbiTypes.has(type)) return true;
        // Numeric types (uint/int)
        if (
            /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(
                type,
            )
        )
            return true;
        // Bytes types (bytes1-32)
        if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])$/.test(type)) return true;
        // Array types (basic recursive check)
        if (type.endsWith('[]')) {
            const baseType = type.slice(0, -2);
            // Avoid infinite recursion on malformed types like '[][]'
            return (
                baseType.length > 0 &&
                !baseType.endsWith('[]') &&
                this.isAbiType(baseType as AbiType)
            );
        }
        return false;
    }

    /**
     * Checks if a type string represents a known UI-specific input type.
     */
    private static isUIType(type: string): type is UIInputType {
        const knownUITypes: Set<string> = new Set([
            'text',
            'number',
            'email',
            'url',
            'datetime',
            'textarea',
        ]);
        return knownUITypes.has(type);
    }

    /**
     * Checks if a UI input type is a reasonable representation for a given ABI type.
     */
    private static isUITypeCompatible(uiType: UIInputType, abiType: AbiType): boolean {
        switch (uiType) {
            case 'text':
            case 'email': // email is a specialized string
            case 'url': // url is a specialized string
            case 'textarea': // textarea is for long strings
                // Compatible with string and bytes types
                return abiType === 'string' || abiType.startsWith('bytes');
            case 'number':
                // Compatible with uint and int types
                return abiType.startsWith('uint') || abiType.startsWith('int');
            case 'datetime':
                // Often represented as uint (timestamp)
                return abiType.startsWith('uint');
            default:
                return false; // Should not happen if isUIType is correct
        }
    }

    /**
     * Validates if a given JavaScript value is compatible with the expected ABI type.
     */
    private static isValueCompatible(value: any, abiType: AbiType): boolean {
        try {
            if (value === null || value === undefined) {
                return false; // Generally invalid for contract calls
            }

            const typeOfValue = typeof value;

            if (abiType === 'address') {
                return (
                    typeOfValue === 'string' &&
                    (value.toLowerCase() === 'sender' || isAddress(value))
                );
            }
            if (abiType === 'bool') {
                return typeOfValue === 'boolean';
            }
            if (abiType === 'string') {
                return typeOfValue === 'string';
            }
            if (abiType.startsWith('uint') || abiType.startsWith('int')) {
                if (typeOfValue === 'number') {
                    return Number.isInteger(value);
                }
                if (typeOfValue === 'bigint') {
                    return true;
                }
                if (typeOfValue === 'string') {
                    const isValidIntegerString = /^-?\d+$/.test(value);
                    return isValidIntegerString;
                }
                return false;
            }
            if (abiType.startsWith('bytes')) {
                if (typeOfValue !== 'string') return false;

                if (!value.startsWith('0x') || !/^(0x)?[0-9a-fA-F]*$/.test(value)) {
                    return false;
                }

                // Fixed-size bytesN
                if (abiType !== 'bytes') {
                    try {
                        const size = parseInt(abiType.replace('bytes', ''));
                        // Each byte is 2 hex characters + '0x' prefix
                        return value.length === 2 + size * 2;
                    } catch (e) {
                        return false;
                    }
                }

                // Dynamic bytes
                return (value.length - 2) % 2 === 0; // Ensure even number of hex digits
            }
            if (abiType.endsWith('[]')) {
                if (!Array.isArray(value)) return false;
                const baseType = abiType.slice(0, -2) as AbiType;
                return value.every(item => this.isValueCompatible(item, baseType));
            }
            if (abiType === 'tuple') {
                // Basic check, deeper validation would need component types from ABI
                return typeOfValue === 'object' && !Array.isArray(value);
            }

            console.warn(`Compatibility check not fully implemented for ABI type: ${abiType}`);
            return true; // Permissive for unknown types
        } catch (error) {
            console.error(`Error validating value compatibility: ${error}`);
            return false; // Fail safely
        }
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
     * Gets the parameters (inputs) of a function from the ABI
     */
    static getAbiParameters(action: BlockchainActionMetadata): readonly AbiParameter[] {
        const abiFunction = this.getAbiFunction(action.abi, action.functionName);
        // Ensure inputs is always an array, even if undefined in ABI
        return abiFunction.inputs || [];
    }

    /**
     * Gets the state mutability type of a function from the ABI
     */
    static getBlockchainActionType(action: BlockchainActionMetadata): AbiStateMutability {
        const abiFunction = this.getAbiFunction(action.abi, action.functionName);
        // Default to 'nonpayable' if stateMutability is missing (though abitype usually adds it)
        return abiFunction.stateMutability || 'nonpayable';
    }

    /**
     * Checks if an object looks like a BlockchainActionMetadata (structural check)
     */
    static isBlockchainActionMetadata(obj: any): obj is BlockchainActionMetadata {
        // This is a basic check, full validation happens in validateBlockchainActionMetadataStructure
        return (
            obj &&
            typeof obj === 'object' &&
            typeof obj.label === 'string' &&
            typeof obj.address === 'string' &&
            Array.isArray(obj.abi) &&
            typeof obj.functionName === 'string' &&
            obj.chains &&
            typeof obj.chains.source === 'string'
        );
    }

    /**
     * Checks if an object is a fully validated BlockchainAction
     */
    static isBlockchainAction(obj: any): obj is BlockchainAction {
        // Check if it has the structure AND the added properties from validation
        return (
            this.isBlockchainActionMetadata(obj) &&
            typeof (obj as any).blockchainActionType === 'string' && // Added by validation
            Array.isArray((obj as any).abiParams) // Added by validation
        );
    }
}
