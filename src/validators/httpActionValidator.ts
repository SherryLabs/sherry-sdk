import { HttpAction, HttpParameter } from '../interface/actions/httpAction';
import { InvalidMetadataError } from '../errors/customErrors';
import { SelectParameter, RadioParameter, StandardParameter } from '../interface/inputs';

export class HttpActionValidator {
    static validateHttpAction(action: HttpAction): HttpAction {
        HttpActionValidator.validatepath(action.path);

        const validatedParams = HttpActionValidator.validateParameters(action.params);

        return {
            ...action,
            params: validatedParams,
        };
    }

    private static validatepath(path: string): void {
        try {
            new URL(path);
        } catch {
            throw new InvalidMetadataError('[HttpAction-validatepath]Invalid path URL');
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
                    return HttpActionValidator.validateSelectParameter(param as SelectParameter);
                case 'radio':
                    return HttpActionValidator.validateRadioParameter(param as RadioParameter);
                case 'text':
                case 'email':
                case 'number':
                case 'boolean':
                case 'url':
                case 'datetime':
                case 'textarea':
                    return HttpActionValidator.validateStandardParameter(
                        param as StandardParameter,
                    );
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

        return param;
    }

    private static validateStandardParameter(param: StandardParameter): StandardParameter {
        // Validate default value type if present
        if (param.value !== undefined) {
            switch (param.type) {
                case 'email':
                    if (!HttpActionValidator.isValidEmail(param.value)) {
                        throw new InvalidMetadataError(
                            `Invalid email format for default value in parameter ${param.name}`,
                        );
                    }
                    break;
                case 'url':
                    if (!HttpActionValidator.isValidUrl(param.value)) {
                        throw new InvalidMetadataError(
                            `Invalid URL format for default value in parameter ${param.name}`,
                        );
                    }
                    break;
                case 'datetime':
                    if (!HttpActionValidator.isValidDateTime(param.value)) {
                        throw new InvalidMetadataError(
                            `Invalid datetime format for default value in parameter ${param.name}`,
                        );
                    }
                    break;
                // ... otros casos para los demás tipos
            }
        }

        // Verificar si el parámetro tiene la propiedad 'pattern' antes de usarla
        if ('pattern' in param && param.pattern) {
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
        if (action.type !== 'http') {
            return false;
        }
        // First we check if the object exists and is actually an object
        if (!action || typeof action !== 'object') {
            return false;
        }

        // Check if this might be another action type (blockchain or transfer)
        // This helps disambiguate between action types
        if (
            // Properties specific to blockchain actions
            action.abi !== undefined ||
            action.functionName !== undefined ||
            action.address !== undefined ||
            // Properties specific to transfer actions
            action.to !== undefined
        ) {
            return false;
        }

        // Then validate HTTP action required properties
        const hasRequiredProps =
            typeof action.label === 'string' && typeof action.path === 'string';

        if (!hasRequiredProps) return false;

        // Validate headers if present
        if (action.headers !== undefined && typeof action.headers !== 'object') {
            return false;
        }

        // Validate params if present
        if (action.params !== undefined) {
            if (!Array.isArray(action.params)) return false;

            // We don't do deep validation here as that's handled by validateHttpAction
            // Just ensure basic structure is present
            const allParamsValid = action.params.every(
                (param: any) =>
                    param &&
                    typeof param === 'object' &&
                    typeof param.name === 'string' &&
                    typeof param.label === 'string' &&
                    typeof param.type === 'string',
            );

            if (!allParamsValid) return false;
        }

        return true;
    }
}
