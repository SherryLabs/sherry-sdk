import {
    HttpAction,
    HttpParameter,
    SelectParameter,
    RadioParameter,
    StandardParameter,
} from '../interface/httpAction';
import { InvalidMetadataError } from '../errors/customErrors';

export class HttpActionValidator {
    static validateHttpAction(action: HttpAction): HttpAction {
        this.validateEndpoint(action.endpoint);

        const validatedParams = this.validateParameters(action.params);

        return {
            ...action,
            params: validatedParams,
        };
    }

    private static validateEndpoint(endpoint: string): void {
        try {
            new URL(endpoint);
        } catch {
            throw new InvalidMetadataError('Invalid endpoint URL');
        }
    }

    private static validateParameters(parameters?: HttpParameter[]): HttpParameter[] {
        if (!parameters) return [];

        return parameters.map(param => {
            // Validate basic parameter structure
            if (!param.name || typeof param.name !== 'string') {
                throw new InvalidMetadataError(`Invalid parameter name: ${param.name}`);
            }

            // Validate label
            if (!param.label || typeof param.label !== 'string') {
                throw new InvalidMetadataError(`Invalid parameter label for ${param.name}`);
            }

            // Validate by parameter type
            switch (param.type) {
                case 'select':
                    return this.validateSelectParameter(param as SelectParameter);
                case 'radio':
                    return this.validateRadioParameter(param as RadioParameter);
                case 'text':
                case 'email':
                case 'number':
                case 'boolean':
                case 'url':
                case 'datetime':
                case 'textarea':
                    return this.validateStandardParameter(param as StandardParameter);
                default:
                    throw new InvalidMetadataError(
                        `Invalid parameter type: ${(param as any).type}`,
                    );
            }
        });
    }

    private static validateSelectParameter(param: SelectParameter): SelectParameter {
        if (!Array.isArray(param.options) || param.options.length === 0) {
            throw new InvalidMetadataError(`Select parameter ${param.name} must have options`);
        }

        // Validate each option
        param.options.forEach(option => {
            if (!option.label || typeof option.label !== 'string') {
                throw new InvalidMetadataError(`Invalid option label in parameter ${param.name}`);
            }
            if (option.value === undefined || option.value === null) {
                throw new InvalidMetadataError(`Invalid option value in parameter ${param.name}`);
            }
        });

        // Validate default value if present
        if (param.defaultValue !== undefined) {
            if (!param.options.some(opt => opt.value === param.defaultValue)) {
                throw new InvalidMetadataError(`Invalid default value for parameter ${param.name}`);
            }
        }

        return param;
    }

    private static validateRadioParameter(param: RadioParameter): RadioParameter {
        if (!Array.isArray(param.options) || param.options.length === 0) {
            throw new InvalidMetadataError(`Radio parameter ${param.name} must have options`);
        }

        // Validate each option
        param.options.forEach(option => {
            if (!option.label || typeof option.label !== 'string') {
                throw new InvalidMetadataError(`Invalid option label in parameter ${param.name}`);
            }
            if (option.value === undefined || option.value === null) {
                throw new InvalidMetadataError(`Invalid option value in parameter ${param.name}`);
            }
        });

        // Validate default value if present
        if (param.defaultValue !== undefined) {
            if (!param.options.some(opt => opt.value === param.defaultValue)) {
                throw new InvalidMetadataError(`Invalid default value for parameter ${param.name}`);
            }
        }

        return param;
    }

    private static validateStandardParameter(param: StandardParameter): StandardParameter {
        // Validate default value type if present
        if (param.defaultValue !== undefined) {
            switch (param.type) {
                case 'email':
                    if (!this.isValidEmail(param.defaultValue)) {
                        throw new InvalidMetadataError(
                            `Invalid email format for default value in parameter ${param.name}`,
                        );
                    }
                    break;
                case 'url':
                    if (!this.isValidUrl(param.defaultValue)) {
                        throw new InvalidMetadataError(
                            `Invalid URL format for default value in parameter ${param.name}`,
                        );
                    }
                    break;
                case 'datetime':
                    if (!this.isValidDateTime(param.defaultValue)) {
                        throw new InvalidMetadataError(
                            `Invalid datetime format for default value in parameter ${param.name}`,
                        );
                    }
                    break;
                // ... otros casos para los demás tipos
                // TODO: Agregar los demás tipos
            }
        }

        // Validate pattern if present
        if (param.pattern) {
            try {
                new RegExp(param.pattern);
            } catch {
                throw new InvalidMetadataError(`Invalid regex pattern for parameter ${param.name}`);
            }
        }

        return param;
    }

    private static isValidEmail(value: string): boolean {
        const emailRegex = /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(value);
    }

    private static isValidUrl(value: string): boolean {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    private static isValidDateTime(value: string): boolean {
        const date = new Date(value);
        return !isNaN(date.getTime());
    }

    static isHttpAction(action: any): action is HttpAction {
        // First check if it has blockchain or transfer specific properties
        if (
            action.abi !== undefined ||
            action.functionName !== undefined ||
            action.to !== undefined ||
            action.address !== undefined
        ) {
            return false;
        }

        // Then validate HTTP action specific properties
        const hasRequiredProps =
            action &&
            typeof action === 'object' &&
            typeof action.label === 'string' &&
            typeof action.endpoint === 'string'; //&&
        //action.method === 'POST'

        if (!hasRequiredProps) return false;

        // Validate headers if present
        if (action.headers && typeof action.headers !== 'object') {
            return false;
        }

        // Validate parameters if present
        if (action.validatedParams) {
            if (!Array.isArray(action.validatedParams)) return false;

            return action.validatedParams.every(
                (param: HttpParameter) =>
                    param &&
                    typeof param.name === 'string' &&
                    ['string', 'number', 'boolean'].includes(param.type) &&
                    typeof param.required === 'boolean',
            );
        }

        return true;
    }
}
