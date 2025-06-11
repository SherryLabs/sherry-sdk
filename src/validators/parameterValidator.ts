import { SherryValidationError } from '../errors/customErrors';
import {
    FileParameter,
    ImageParameter,
    SelectParameter,
    RadioParameter,
    TextBasedParameter,
    NumberBasedParameter,
    AddressParameter,
    BooleanParameter,
    BaseParameter,
} from '../interface/inputs';
import { isAddress } from 'viem';

// Type guard for specific parameter types
export function isSelectParameter(param: BaseParameter): param is SelectParameter {
    return param.type === 'select';
}

export function isRadioParameter(param: BaseParameter): param is RadioParameter {
    return param.type === 'radio';
}

export function isTextBasedParameter(param: BaseParameter): param is TextBasedParameter {
    return (
        ['text', 'email', 'url', 'textarea', 'string', 'bytes'].includes(param.type as string) ||
        /^bytes\d+$/.test(param.type as string)
    );
}

export function isNumberBasedParameter(param: BaseParameter): param is NumberBasedParameter {
    return (
        ['number', 'datetime'].includes(param.type as string) ||
        /^(u?int)\d*$/.test(param.type as string)
    );
}

export function isAddressParameter(param: BaseParameter): param is AddressParameter {
    return param.type === 'address';
}

export function isBooleanParameter(param: BaseParameter): param is BooleanParameter {
    return param.type === 'bool' || param.type === 'boolean';
}

export function isFileParameter(param: BaseParameter): param is FileParameter {
    return param.type === 'file';
}

export function isImageParameter(param: BaseParameter): param is ImageParameter {
    return param.type === 'image';
}

/**
 * Validator for blockchain parameters
 */
export class ParameterValidator {
    /**
     * Validates the base parameter properties
     */
    static validateBaseParameter(param: BaseParameter): void {
        // Verify required fields
        if (!param.name) {
            throw new SherryValidationError(`Parameter missing required 'name' field`);
        }

        if (!param.label) {
            throw new SherryValidationError(
                `Parameter '${param.name}' missing required 'label' field`,
            );
        }

        // Verify type
        if (!param.type) {
            throw new SherryValidationError(
                `Parameter '${param.name}' missing required 'type' field`,
            );
        }
    }

    /**
     * Validates selection parameters (select, radio).
     */
    static validateSelectionParameter(param: SelectParameter | RadioParameter): void {
        this.validateBaseParameter(param);

        if (!param.options || !Array.isArray(param.options) || param.options.length === 0) {
            throw new SherryValidationError(
                `${param.type} parameter '${param.name}' must have at least one option`,
            );
        }

        // Check for duplicate options
        const values = new Set();
        param.options.forEach(opt => {
            if (!opt.label) {
                throw new SherryValidationError(
                    `Option missing required 'label' in parameter '${param.name}'`,
                );
            }

            if (opt.value === undefined) {
                throw new SherryValidationError(
                    `Option missing required 'value' in parameter '${param.name}'`,
                );
            }

            // For objects, stringify them for comparison
            const valueKey =
                typeof opt.value === 'object' && opt.value !== null
                    ? JSON.stringify(opt.value)
                    : String(opt.value);

            if (values.has(valueKey)) {
                throw new SherryValidationError(
                    `Duplicate value '${opt.value}' in ${param.type} parameter '${param.name}'`,
                );
            }
            values.add(valueKey);
        });

        // For radio parameters, ensure there are at least 2 options
        if (param.type === 'radio' && param.options.length < 2) {
            throw new SherryValidationError(
                `Radio parameter '${param.name}' must have at least 2 options`,
            );
        }
    }

    /**
     * Validates text-based parameters
     */
    static validateTextBasedParameter(param: TextBasedParameter): void {
        this.validateBaseParameter(param);

        // Validate length constraints
        if (param.minLength !== undefined && param.maxLength !== undefined) {
            if (param.minLength > param.maxLength) {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has minLength (${param.minLength}) greater than maxLength (${param.maxLength})`,
                );
            }
        }

        // Validate regex pattern
        if (param.pattern) {
            try {
                new RegExp(param.pattern);
            } catch (error) {
                throw new SherryValidationError(
                    `Invalid regex pattern for parameter '${param.name}': ${error}`,
                );
            }
        }

        // Type-specific validations
        if (
            param.type === 'email' &&
            param.value !== undefined &&
            typeof param.value === 'string'
        ) {
            const emailRegex = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (!emailRegex.test(param.value)) {
                throw new SherryValidationError(
                    `Invalid email format for parameter '${param.name}': ${param.value}`,
                );
            }
        }

        if (param.type === 'url' && param.value !== undefined && typeof param.value === 'string') {
            try {
                new URL(param.value);
            } catch {
                throw new SherryValidationError(
                    `Invalid URL format for parameter '${param.name}': ${param.value}`,
                );
            }
        }
    }

    /**
     * Validates number-based parameters
     */
    static validateNumberBasedParameter(param: NumberBasedParameter): void {
        this.validateBaseParameter(param);

        // Validate min/max constraints
        if (param.min !== undefined && param.max !== undefined) {
            if (param.min > param.max) {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has min (${param.min}) greater than max (${param.max})`,
                );
            }
        }

        // Validate regex pattern if present
        if (param.pattern) {
            try {
                new RegExp(param.pattern);
            } catch (error) {
                throw new SherryValidationError(
                    `Invalid regex pattern for parameter '${param.name}': ${error}`,
                );
            }
        }

        // If there's a value, validate it's a number or can be parsed as one
        if (param.value !== undefined) {
            if (typeof param.value !== 'number' && typeof param.value !== 'bigint') {
                if (typeof param.value === 'string') {
                    if (!/^-?\d+(\.\d+)?$/.test(param.value)) {
                        throw new SherryValidationError(
                            `Invalid number format for parameter '${param.name}': ${param.value}`,
                        );
                    }
                } else {
                    throw new SherryValidationError(
                        `Invalid value type for number parameter '${param.name}': ${typeof param.value}`,
                    );
                }
            }

            // Check against min/max constraints
            if (param.min !== undefined) {
                const numValue = Number(param.value);
                if (numValue < param.min) {
                    throw new SherryValidationError(
                        `Value ${numValue} is less than minimum ${param.min} for parameter '${param.name}'`,
                    );
                }
            }

            if (param.max !== undefined) {
                const numValue = Number(param.value);
                if (numValue > param.max) {
                    throw new SherryValidationError(
                        `Value ${numValue} is greater than maximum ${param.max} for parameter '${param.name}'`,
                    );
                }
            }
        }
    }

    /**
     * Validates address parameters
     */
    static validateAddressParameter(param: AddressParameter): void {
        this.validateBaseParameter(param);

        // Validate pattern if present
        if (param.pattern) {
            try {
                new RegExp(param.pattern);
            } catch (error) {
                throw new SherryValidationError(
                    `Invalid regex pattern for parameter '${param.name}': ${error}`,
                );
            }
        }

        // Validate address value if present
        if (param.value !== undefined && typeof param.value === 'string') {
            // Allow 'sender' as a special value
            if (param.value !== 'sender' && !isAddress(param.value)) {
                throw new SherryValidationError(
                    `Invalid address format for parameter '${param.name}': ${param.value}`,
                );
            }
        }
    }

    /**
     * Validates boolean parameters
     */
    static validateBooleanParameter(param: BooleanParameter): void {
        this.validateBaseParameter(param);

        // Validate value type if present
        if (param.value !== undefined && typeof param.value !== 'boolean') {
            throw new SherryValidationError(
                `Invalid boolean value for parameter '${param.name}': ${param.value}`,
            );
        }
    }

    /**
     * Validates file parameters
     */
    static validateFileParameter(param: FileParameter): void {
        this.validateBaseParameter(param);

        // Validate maxSize
        if (param.maxSize !== undefined) {
            if (typeof param.maxSize !== 'number' || param.maxSize <= 0) {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has invalid maxSize (must be a positive number)`,
                );
            }
        }

        // Validate accept string format
        if (param.accept !== undefined) {
            if (typeof param.accept !== 'string' || param.accept.trim() === '') {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has invalid accept value (must be a non-empty string)`,
                );
            }
        }

        // Validate multiple
        if (param.multiple !== undefined && typeof param.multiple !== 'boolean') {
            throw new SherryValidationError(
                `Parameter '${param.name}' has invalid multiple value (must be boolean)`,
            );
        }
    }

    /**
     * Validates image parameters
     */
    static validateImageParameter(param: ImageParameter): void {
        this.validateBaseParameter(param);

        // Validate common file properties
        if (param.maxSize !== undefined) {
            if (typeof param.maxSize !== 'number' || param.maxSize <= 0) {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has invalid maxSize (must be a positive number)`,
                );
            }
        }

        if (param.accept !== undefined) {
            if (typeof param.accept !== 'string' || param.accept.trim() === '') {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has invalid accept value (must be a non-empty string)`,
                );
            }
        }

        if (param.multiple !== undefined && typeof param.multiple !== 'boolean') {
            throw new SherryValidationError(
                `Parameter '${param.name}' has invalid multiple value (must be boolean)`,
            );
        }

        // Validate image-specific properties
        if (param.maxWidth !== undefined) {
            if (typeof param.maxWidth !== 'number' || param.maxWidth <= 0) {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has invalid maxWidth (must be a positive number)`,
                );
            }
        }

        if (param.maxHeight !== undefined) {
            if (typeof param.maxHeight !== 'number' || param.maxHeight <= 0) {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has invalid maxHeight (must be a positive number)`,
                );
            }
        }

        if (param.aspectRatio !== undefined) {
            if (typeof param.aspectRatio !== 'string') {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has invalid aspectRatio (must be a string)`,
                );
            }

            // Validate aspect ratio format (e.g., "16:9", "4:3", "1:1")
            const aspectRatioRegex = /^\d+:\d+$/;
            if (!aspectRatioRegex.test(param.aspectRatio)) {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has invalid aspectRatio format (must be like "16:9", "4:3", etc.)`,
                );
            }

            // Validate that both numbers are positive
            const [width, height] = param.aspectRatio.split(':').map(Number);
            if (width <= 0 || height <= 0) {
                throw new SherryValidationError(
                    `Parameter '${param.name}' has invalid aspectRatio (both width and height must be positive)`,
                );
            }
        }
    }

    /**
     * Validates any parameter by determining its type
     */
    static validateParameter(param: BaseParameter): void {
        if (isSelectParameter(param)) {
            this.validateSelectionParameter(param);
        } else if (isRadioParameter(param)) {
            this.validateSelectionParameter(param);
        } else if (isTextBasedParameter(param)) {
            this.validateTextBasedParameter(param);
        } else if (isNumberBasedParameter(param)) {
            this.validateNumberBasedParameter(param);
        } else if (isAddressParameter(param)) {
            this.validateAddressParameter(param);
        } else if (isBooleanParameter(param)) {
            this.validateBooleanParameter(param);
        } else if (isFileParameter(param)) {
            this.validateFileParameter(param);
        } else if (isImageParameter(param)) {
            this.validateImageParameter(param);
        } else {
            // Improved error message for unknown parameter types
            throw new SherryValidationError(
                `Unknown parameter type: ${param.type ? `"${param.type}"` : 'undefined'} for parameter "${param.name || 'unnamed'}"`,
            );
        }
    }
}
