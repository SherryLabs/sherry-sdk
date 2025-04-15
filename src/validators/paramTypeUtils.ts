import { AbiType } from 'abitype';
import {
    StandardParameter,
    SelectParameter,
    RadioParameter,
    BaseInputType,
} from '../interface/blockchainAction';

/**
 * Utility class for parameter type checking and validation
 */
export class ParamTypeUtils {
    /**
     * Gets all valid input types from our type definitions
     * @returns Array of valid input type strings
     */
    static getValidInputTypes(): string[] {
        // Include all UI-specific input types
        const uiTypes: string[] = ['text', 'number', 'email', 'url', 'datetime', 'textarea'];

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
     * Checks if a parameter type is valid
     * @param type The type to check
     * @returns True if the type is valid
     */
    static isValidParamType(type: string): boolean {
        const validTypes = this.getValidInputTypes();

        return (
            // Check if it's one of our recognized types
            validTypes.includes(type) ||
            // Allow array types like uint256[] that might not be in our list
            type.endsWith('[]') ||
            // Special case for tuples
            type === 'tuple'
        );
    }

    /**
     * Checks if an object is a standard parameter
     */
    static isStandardParameter(param: any): param is StandardParameter {
        return (
            param &&
            typeof param === 'object' &&
            typeof param.type === 'string' &&
            this.isValidParamType(param.type)
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
     * Gets the appropriate input type for the given parameter based on ABI
     * @param abiParam ABI parameter
     * @returns Input type
     */
    static getInputTypeFromAbiType(type: string): BaseInputType {
        // First check the main type
        if (type.startsWith('uint') || type.startsWith('int')) {
            return 'number';
        } else if (type === 'address') {
            return 'address';
        } else if (type === 'bool') {
            return 'bool';
        } else if (type === 'string') {
            return 'text';
        } else if (type === 'tuple') {
            return 'tuple';
        } else if (type.endsWith('[]')) {
            // For arrays, use the base type
            return this.getInputTypeFromAbiType(type.substring(0, type.length - 2));
        }

        // Default to text for other types
        return 'text';
    }
}

// Export convenience functions
export const isValidParamType = ParamTypeUtils.isValidParamType.bind(ParamTypeUtils);
export const isStandardParameter = ParamTypeUtils.isStandardParameter.bind(ParamTypeUtils);
export const isSelectParameter = ParamTypeUtils.isSelectParameter.bind(ParamTypeUtils);
export const isRadioParameter = ParamTypeUtils.isRadioParameter.bind(ParamTypeUtils);
export const getInputTypeFromAbiType = ParamTypeUtils.getInputTypeFromAbiType.bind(ParamTypeUtils);
export const getValidInputTypes = ParamTypeUtils.getValidInputTypes.bind(ParamTypeUtils);
