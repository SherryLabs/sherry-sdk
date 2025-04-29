// src/validators/dynamicActionValidator.ts
import { DynamicAction } from '../interface/actions/dynamicAction';
import { ActionValidationError } from '../errors/customErrors';
import { ParameterValidator } from './parameterValidator';

/**
 * Validator class for Dynamic Actions
 */
export class DynamicActionValidator {
    /**
     * Validates a dynamic action, considering an optional baseUrl from metadata.
     * @param action The dynamic action to validate.
     * @param baseUrl Optional base URL from the parent Metadata object.
     * @returns The validated dynamic action.
     * @throws {ActionValidationError} If validation fails.
     */
    static validateDynamicAction(action: DynamicAction, baseUrl?: string): DynamicAction {
        // Validate basic fields
        this.validateBasicFields(action);

        // Validate path
        this.validatePath(action.path);

        // Validate the action has access to a baseUrl (either from metadata or complete path)
        if (!baseUrl && !action.path.startsWith('http')) {
            throw new ActionValidationError(
                `Dynamic action '${action.label}' has a relative path '${action.path}' but no baseUrl is provided in metadata`,
            );
        }

        // Validate parameters if present
        if (action.params && action.params.length > 0) {
            this.validateParameters(action.params);
        }

        // Validate chains
        if (!action.chains || !action.chains.source) {
            throw new ActionValidationError('Dynamic action must specify a source chain');
        }

        return action;
    }

    /**
     * Validates the basic fields of a dynamic action
     */
    private static validateBasicFields(action: DynamicAction): void {
        if (!action.label || typeof action.label !== 'string') {
            throw new ActionValidationError('Dynamic action must have a valid label');
        }

        if (!action.type || action.type !== 'dynamic') {
            throw new ActionValidationError('Action type must be "dynamic"');
        }

        if (action.description && typeof action.description !== 'string') {
            throw new ActionValidationError('Description must be a string if provided');
        }
    }

    /**
     * Validates the path, checking for required baseUrl with relative paths.
     * @param path The path string from the action.
     * @param baseUrl Optional base URL from metadata.
     */
    private static validatePath(path: string, baseUrl?: string): void {
        if (!path || typeof path !== 'string') {
            throw new ActionValidationError('Dynamic action must have a valid path');
        }

        if (path.startsWith('http')) {
            // If it's a full URL, validate its format
            try {
                new URL(path);
            } catch (error) {
                throw new ActionValidationError(`Invalid path URL: ${path}`);
            }
        } else if (path.startsWith('/')) {
            // If it's a relative path, baseUrl MUST be present and valid
            if (!baseUrl) {
                throw new ActionValidationError(
                    `Dynamic action has a relative path '${path}' but no baseUrl is provided in metadata.`,
                );
            }
            // Optional: Validate the combined URL
            try {
                new URL(path, baseUrl); // Check if combining works
            } catch (error) {
                throw new ActionValidationError(
                    `Invalid combination of baseUrl ('${baseUrl}') and relative path ('${path}')`,
                );
            }
        } else {
            // Path is not a full URL and not a valid relative path
            throw new ActionValidationError(
                `Invalid path format: '${path}'. Must be a full URL or start with '/'.`,
            );
        }
    }

    /**
     * Validates the parameters
     */
    private static validateParameters(params: any[]): void {
        if (!Array.isArray(params)) {
            throw new ActionValidationError('Parameters must be an array');
        }

        // Use the existing parameter validator to validate each parameter
        params.forEach(param => {
            try {
                ParameterValidator.validateParameter(param);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                throw new ActionValidationError(`Invalid parameter: ${message}`);
            }
        });
    }

    /**
     * Checks if an object is a valid DynamicAction
     */
    static isDynamicAction(obj: any): obj is DynamicAction {
        return (
            obj &&
            typeof obj === 'object' &&
            obj.type === 'dynamic' &&
            typeof obj.label === 'string' &&
            typeof obj.path === 'string' &&
            obj.chains &&
            typeof obj.chains === 'object' &&
            typeof obj.chains.source === 'string'
        );
    }
}
