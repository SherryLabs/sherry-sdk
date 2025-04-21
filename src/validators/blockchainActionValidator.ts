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
    SelectionInputType, // Make sure this is imported if defined elsewhere
} from '../interface/actions/blockchainAction';
import { ChainContext } from '../interface/chains';
import { SherryValidationError, ActionValidationError } from '../errors/customErrors';
// Assuming ParameterValidator is no longer needed here if validation is consolidated
// import { ParameterValidator } from './parameterValidator';
import {
    isStandardParameter,
    isSelectParameter,
    isRadioParameter,
    getInputTypeFromAbiType,
} from './paramTypeUtils';

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
        // Validate basic metadata structure and ABI/function existence first
        this.validateBlockchainActionMetadataStructure(action);

        // Get the ABI parameters for the specified function
        const abiParams = this.getAbiParameters(action);

        // Validate the user-provided parameters against the ABI parameters
        // This now includes the type compatibility logic
        if (action.params) {
             this.validateBlockchainParameters(action.params, abiParams, action.functionName);
        } else if (abiParams.length > 0) {
            // Handle case where ABI expects parameters but none are provided
            // Depending on strictness, could warn or throw error
             console.warn(`Function ${action.functionName} expects ${abiParams.length} parameters, but none were provided in metadata.`);
             // Potentially throw: throw new ActionValidationError(...)
        }


        // Get the blockchain action type (mutability)
        const blockchainActionType = this.getBlockchainActionType(action);

        // Validate 'amount' property based on mutability
        const hasAmountParameterInAbi = abiParams.some(param => param.name === 'amount');
        if (
            blockchainActionType !== 'payable' &&
            action.amount !== undefined &&
            !hasAmountParameterInAbi // Allow top-level amount if there's an ABI param named 'amount'
        ) {
            throw new ActionValidationError(
                'The action function is not payable according to the ABI, but an "amount" was provided at the top level.',
            );
        }
         if (blockchainActionType === 'payable' && action.amount === undefined && !hasAmountParameterInAbi) {
             // Warn or potentially error if payable but no amount provided (and no 'amount' param)
             console.warn(`Payable function ${action.functionName} called without a top-level 'amount' and no 'amount' parameter.`);
         }


        // Return the processed action with additional info
        return {
            ...action,
            abiParams: [...abiParams], // Create a mutable copy of the readonly array
            blockchainActionType,
        };
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
            throw new ActionValidationError(`Invalid or missing contract address: ${action.address}`);
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
            throw new ActionValidationError('The action must have a valid chains configuration (source required)');
        }
        if (action.amount !== undefined && (typeof action.amount !== 'number' || action.amount < 0)) {
            throw new ActionValidationError('If "amount" is provided, it must be a non-negative number');
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
        if (chains.destination !== undefined && !this.isValidChain(chains.destination)) return false;
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
     */
    static validateBlockchainParameters(
        params: BlockchainParameter[],
        abiParams: readonly AbiParameter[],
        functionName: string, // Pass functionName for better error messages
    ): void {
        if (!Array.isArray(params)) {
            throw new ActionValidationError(`Parameters for function ${functionName} must be an array.`);
        }

        // Check for parameter count mismatch
        if (params.length !== abiParams.length) {
            throw new ActionValidationError(
                `Parameter count mismatch for function ${functionName}. ABI expects ${abiParams.length}, received ${params.length}.`,
            );
        }

        for (let i = 0; i < abiParams.length; i++) {
            const abiParam = abiParams[i];
            const userParam = params[i];

            // 1. Validate basic structure and name matching
            if (!userParam || typeof userParam !== 'object') {
                 throw new ActionValidationError(`Invalid parameter definition at index ${i} for function ${functionName}.`);
            }
            if (typeof userParam.name !== 'string' || !userParam.name) {
                throw new ActionValidationError(`Parameter at index ${i} for function ${functionName} must have a valid name.`);
            }
            if (userParam.name !== abiParam.name) {
                throw new ActionValidationError(
                    `Parameter name mismatch at index ${i} for function ${functionName}. Expected '${abiParam.name}', received '${userParam.name}'. Parameters must be in the same order as the ABI.`,
                );
            }
            if (typeof userParam.label !== 'string' || !userParam.label) {
                throw new ActionValidationError(`Parameter "${userParam.name}" must have a valid label.`);
            }

            // 2. Determine types and validate compatibility
            const abiType = abiParam.type;
            // If user doesn't specify type, infer from ABI for validation, but prefer user's type if provided
            const userSpecifiedType = userParam.type;
            const effectiveUserType = userSpecifiedType || getInputTypeFromAbiType(abiType); // Use helper for default

            // --- Type Compatibility Logic ---
            if (this.isAbiType(effectiveUserType)) {
                // Case 1: User type is an ABI type (e.g., 'address', 'uint256')
                if (effectiveUserType !== abiType) {
                    throw new ActionValidationError(
                        `Type mismatch for parameter '${userParam.name}'. ABI expects '${abiType}', but received direct type '${effectiveUserType}'.`,
                    );
                }
                // Validate fixed value if present
                if (userParam.fixed && userParam.value !== undefined) {
                    if (!this.isValueCompatible(userParam.value, abiType as AbiType)) {
                         throw new ActionValidationError(
                            `Fixed value for parameter '${userParam.name}' is not compatible with ABI type '${abiType}'.`,
                        );
                    }
                }

            } else if (this.isUIType(effectiveUserType)) {
                // Case 2: User type is a UI type (e.g., 'text', 'number')
                // Cast abiType to AbiType to satisfy the function signature
                if (!this.isUITypeCompatible(effectiveUserType, abiType as AbiType)) {
                    throw new ActionValidationError(
                        `UI type '${effectiveUserType}' for parameter '${userParam.name}' is not compatible with ABI type '${abiType}'.`,
                    );
                }
                 // Validate fixed value if present
                 if (userParam.fixed && userParam.value !== undefined) {
                    if (!this.isValueCompatible(userParam.value, abiType as AbiType)) {
                         throw new ActionValidationError(
                            `Fixed value for parameter '${userParam.name}' is not compatible with ABI type '${abiType}'.`,
                        );
                    }
                }
            } else if (effectiveUserType === 'select' || effectiveUserType === 'radio') {
                // Case 3: User type is selection ('select' or 'radio')
                const selectParam = userParam as SelectParameter | RadioParameter;
                if (!selectParam.options || !Array.isArray(selectParam.options) || selectParam.options.length === 0) {
                    throw new ActionValidationError(
                        `Parameter '${userParam.name}' of type '${effectiveUserType}' must have a non-empty 'options' array.`,
                    );
                }

                // Validate structure and values of each option against the ABI type
                for (const option of selectParam.options) {
                     if (typeof option.label !== 'string' || !option.label) {
                         throw new ActionValidationError(`Parameter '${userParam.name}' has an option with an invalid label.`);
                     }
                     if (option.value === undefined) { // Allow null/false/0 as values
                         throw new ActionValidationError(`Parameter '${userParam.name}' has an option (label: "${option.label}") without a value.`);
                     }
                    // *** The crucial check: validate option value against ABI type ***
                    if (!this.isValueCompatible(option.value, abiType as AbiType)) {
                        throw new ActionValidationError(
                            `Invalid option value '${option.value}' (label: "${option.label}") for parameter '${userParam.name}'. Expected value compatible with ABI type '${abiType}'.`,
                        );
                    }
                }

                // Validate default value if present
                 if (userParam.value !== undefined) {
                    if (!this.isValueCompatible(userParam.value, abiType as AbiType)) {
                         throw new ActionValidationError(
                            `Default value for parameter '${userParam.name}' is not compatible with ABI type '${abiType}'.`,
                        );
                    }
                    // Ensure default value is one of the options
                    if (!selectParam.options.some(opt => opt.value === userParam.value)) {
                         throw new ActionValidationError(
                            `Default value for parameter '${userParam.name}' is not present in the available options.`,
                        );
                    }
                }

                 // Additional structural validation for select/radio (e.g., no duplicate values/labels)
                 this.validateSelectionOptions(selectParam);


            } else {
                // Should not happen if type inference and checks are correct, but handle defensively
                throw new ActionValidationError(
                    `Unknown or unsupported parameter type '${effectiveUserType}' specified for parameter '${userParam.name}'.`,
                );
            }

            // 3. Validate common parameter properties (required, description, etc.)
            // These are less critical for type matching but good for completeness
            this.validateCommonParameterProperties(userParam);

             // 4. Validate type-specific standard parameter properties (minLength, pattern, etc.)
             // Only apply if it's effectively a standard parameter (ABI or UI type, not select/radio)
             if (this.isAbiType(effectiveUserType) || this.isUIType(effectiveUserType)) {
                 // We might need to cast userParam safely here if needed
                 this.validateStandardParameterProperties(userParam as StandardParameter);
             }
        }
    }

     /**
      * Validates common properties present in all parameter types.
      */
     private static validateCommonParameterProperties(param: BlockchainParameter): void {
         if (param.required !== undefined && typeof param.required !== 'boolean') {
             throw new ActionValidationError(`Parameter "${param.name}" has an invalid 'required' value (must be boolean).`);
         }
         if (param.description !== undefined && typeof param.description !== 'string') {
             throw new ActionValidationError(`Parameter "${param.name}" has an invalid 'description' value (must be string).`);
         }
         if (param.fixed !== undefined && typeof param.fixed !== 'boolean') {
             throw new ActionValidationError(`Parameter "${param.name}" has an invalid 'fixed' value (must be boolean).`);
         }
         if (param.fixed && param.value === undefined) {
             throw new ActionValidationError(`Parameter "${param.name}" is marked as 'fixed' but has no 'value'.`);
         }
         // Note: Validation of param.value against ABI type happens elsewhere
     }

    /**
     * Validates properties specific to StandardParameter (minLength, pattern, etc.).
     * Assumes the parameter type itself is compatible.
     */
    private static validateStandardParameterProperties(param: StandardParameter): void {
        if (param.minLength !== undefined && (typeof param.minLength !== 'number' || param.minLength < 0)) {
            throw new ActionValidationError(`Parameter "${param.name}" has an invalid 'minLength'.`);
        }
        if (param.maxLength !== undefined && (typeof param.maxLength !== 'number' || param.maxLength < 0)) {
            throw new ActionValidationError(`Parameter "${param.name}" has an invalid 'maxLength'.`);
        }
        if (param.minLength !== undefined && param.maxLength !== undefined && param.minLength > param.maxLength) {
             throw new ActionValidationError(`Parameter "${param.name}" has minLength > maxLength.`);
        }
        if (param.min !== undefined && typeof param.min !== 'number') {
            throw new ActionValidationError(`Parameter "${param.name}" has an invalid 'min' value.`);
        }
        if (param.max !== undefined && typeof param.max !== 'number') {
            throw new ActionValidationError(`Parameter "${param.name}" has an invalid 'max' value.`);
        }
        if (param.min !== undefined && param.max !== undefined && param.min > param.max) {
            throw new ActionValidationError(`Parameter "${param.name}" has min > max.`);
        }
        if (param.pattern !== undefined) {
             if (typeof param.pattern !== 'string') {
                 throw new ActionValidationError(`Parameter "${param.name}" has an invalid 'pattern' (must be string).`);
             }
             try {
                 new RegExp(param.pattern);
             } catch (e) {
                 throw new ActionValidationError(`Parameter "${param.name}" has an invalid regex pattern: ${e instanceof Error ? e.message : e}`);
             }
         }
    }

    /**
     * Validates structural properties of Select/Radio options (duplicates).
     * Assumes individual option values have already been validated for type compatibility.
     */
    private static validateSelectionOptions(param: SelectParameter | RadioParameter): void {
        const values = param.options.map(o => o.value);
        if (new Set(values).size !== values.length) {
            throw new ActionValidationError(
                `Parameter "${param.name}" has options with duplicate values.`,
            );
        }
        const labels = param.options.map(o => o.label);
        if (new Set(labels).size !== labels.length) {
            // This might be acceptable in some cases, but often indicates an error
            console.warn(`Parameter "${param.name}" has options with duplicate labels.`);
            // Optionally throw: throw new ActionValidationError(...)
        }

         // Specific validation for radio (usually needs >= 2 options)
         if (param.type === 'radio' && param.options.length < 2) {
             // Warn or throw depending on requirements
             console.warn(`Radio parameter "${param.name}" has fewer than 2 options.`);
             // Optionally throw: throw new ActionValidationError(...)
         }
    }


    // --- Helper Functions for Type Checking and Compatibility ---

    /**
     * Checks if a type string represents a known ABI type.
     * Includes basic types, fixed-size types, and array notation.
     */
    private static isAbiType(type: string): type is AbiType {
        if (!type) return false;
        // Basic types
        const basicAbiTypes: Set<string> = new Set(['address', 'bool', 'string', 'bytes', 'function', 'tuple']);
        if (basicAbiTypes.has(type)) return true;
        // Numeric types (uint/int)
        if (/^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)$/.test(type)) return true;
        // Bytes types (bytes1-32)
        if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])$/.test(type)) return true;
        // Array types (basic recursive check)
        if (type.endsWith('[]')) {
            const baseType = type.slice(0, -2);
            // Avoid infinite recursion on malformed types like '[][]'
            return baseType.length > 0 && !baseType.endsWith('[]') && this.isAbiType(baseType as AbiType);
        }
        return false;
    }

    /**
     * Checks if a type string represents a known UI-specific input type.
     */
    private static isUIType(type: string): type is UIInputType {
        const knownUITypes: Set<string> = new Set(['text', 'number', 'email', 'url', 'datetime', 'textarea']);
        return knownUITypes.has(type);
    }

     /**
      * Checks if a type string represents a known Selection input type.
      */
     private static isSelectionType(type: string): type is SelectionInputType {
         const knownSelectionTypes: Set<string> = new Set(['select', 'radio']);
         return knownSelectionTypes.has(type);
     }


    /**
     * Checks if a UI input type is a reasonable representation for a given ABI type.
     */
    private static isUITypeCompatible(uiType: UIInputType, abiType: AbiType): boolean {
        switch (uiType) {
            case 'text':
            case 'email': // email is a specialized string
            case 'url':   // url is a specialized string
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
     * This is crucial for validating default values, fixed values, and option values.
     */
    private static isValueCompatible(value: any, abiType: AbiType): boolean {
        if (value === null || value === undefined) {
            // Generally, null/undefined aren't valid values for contract calls unless maybe for optional params,
            // but the 'required' flag handles whether a value *must* be provided.
            // This function checks if an *existing* value is valid.
            // Let's consider null/undefined invalid for now for simplicity.
            return false;
        }

        const typeOfValue = typeof value;

        if (abiType === 'address') {
            // Allow 'sender' as a special keyword, otherwise must be valid address string
            return typeOfValue === 'string' && (value.toLowerCase() === 'sender' || isAddress(value));
        }
        if (abiType === 'bool') {
            return typeOfValue === 'boolean';
        }
        if (abiType === 'string') {
            return typeOfValue === 'string';
        }
        if (abiType.startsWith('uint') || abiType.startsWith('int')) {
            // Allow numbers, BigInts, or strings representing valid integers
            if (typeOfValue === 'number') {
                // Ensure it's an integer and within safe integer range if not using BigInt
                return Number.isInteger(value);
            }
            if (typeOfValue === 'bigint') {
                return true; // BigInt is suitable for large integers
            }
            if (typeOfValue === 'string') {
                // Regex for integer strings (positive or negative)
                const isValidIntegerString = /^-?\d+$/.test(value);
                if (!isValidIntegerString) return false;
                // Optional: Check if string representation fits within target type (e.g., uint8 max 255)
                // This requires parsing and comparing, potentially with BigInt for large types.
                // Example (simplified, needs BigInt for full correctness):
                // if (abiType.startsWith('uint')) {
                //     const num = BigInt(value);
                //     if (num < 0) return false;
                //     // Add checks based on size (uint8, uint16, etc.)
                // } else { // int
                //     // Add checks based on size (int8, int16, etc.)
                // }
                return true; // Basic check: is it an integer string?
            }
            return false;
        }
         if (abiType.startsWith('bytes')) {
             // Expect a hex string (0x...)
             if (typeOfValue !== 'string' || !value.startsWith('0x') || !/^(0x)?[0-9a-fA-F]*$/.test(value)) {
                 return false;
             }
             // For fixed-size bytes (bytes1..32), check length
             if (abiType !== 'bytes') { // It's bytesN
                 try {
                     const size = parseInt(abiType.replace('bytes', ''));
                     // Each byte is 2 hex chars, plus '0x' prefix
                     if (value.length !== 2 + size * 2) {
                         return false;
                     }
                 } catch (e) { return false; } // Invalid bytesN format
             }
             // Check if hex string has an even number of characters after 0x
             return (value.length - 2) % 2 === 0;
         }
         if (abiType.endsWith('[]')) {
             // Array validation
             if (!Array.isArray(value)) return false;
             const baseType = abiType.slice(0, -2) as AbiType; // Get base type
             // Recursively validate each item in the array
             return value.every(item => this.isValueCompatible(item, baseType));
         }
         if (abiType === 'tuple') {
             // Basic check: is it an object? Deeper validation would require component types.
             return typeOfValue === 'object' && !Array.isArray(value);
         }

        // Fallback for unhandled ABI types
        console.warn(`Compatibility check not fully implemented for ABI type: ${abiType}`);
        return true; // Be permissive for unknown types until implemented
    }


    // --- Existing Helper Functions ---

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
            obj.chains && typeof obj.chains.source === 'string'
            // Note: Doesn't check ABI validity or function existence here
        );
    }

    /**
     * Checks if an object is a fully validated BlockchainAction
     */
    static  isBlockchainAction(obj: any): obj is BlockchainAction {
        // Check if it has the structure AND the added properties from validation
        return (
            this.isBlockchainActionMetadata(obj) &&
            typeof (obj as any).blockchainActionType === 'string' && // Added by validation
            Array.isArray((obj as any).abiParams) // Added by validation
        );
    }

    // --- Deprecated/Removed Methods ---
    // Removed validateStandardParameter, validateSelectParameter, validateRadioParameter
    // as their logic is now integrated into validateBlockchainParameters
    // Removed validateParameterValue as its logic is now in isValueCompatible
    // Removed getValidInputTypes, isStandardParameter, isSelectParameter, isRadioParameter
    // as type checking is done differently now.
    // Removed processParams as parameter processing/validation is now part of validateBlockchainParameters
}
