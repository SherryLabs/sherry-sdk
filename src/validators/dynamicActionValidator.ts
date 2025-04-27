import { DynamicAction } from '../interface/actions/dynamicAction';
import { ActionValidationError } from '../errors/customErrors';

/**
 * Validator class for Dynamic Actions
 */
export class DynamicActionValidator {
    /**
     * Validates a dynamic action and returns it if valid
     */
    static validateDynamicAction(action: DynamicAction): DynamicAction {
        // Validate basic fields
        this.validateBasicFields(action);

        // Validate resolution URL
        //this.validateResolveUrl(action.resolveUrl);

        // Validate resolution parameters if present
        /*
        if (action.resolveParams) {
            this.validateResolveParams(action.resolveParams);
        }
        */

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

        if (!action.description || typeof action.description !== 'string') {
            throw new ActionValidationError('Dynamic action must have a valid description');
        }
    }

    /**
     * Validates the resolve URL
     */
    private static validateResolveUrl(resolveUrl: string): void {
        if (!resolveUrl || typeof resolveUrl !== 'string') {
            throw new ActionValidationError('Dynamic action must have a valid resolveUrl');
        }

        try {
            new URL(resolveUrl);
        } catch {
            throw new ActionValidationError(`Invalid resolve URL: ${resolveUrl}`);
        }
    }

    /**
     * Validates the resolve parameters
     */
    private static validateResolveParams(params: Record<string, any>): void {
        if (typeof params !== 'object' || params === null) {
            throw new ActionValidationError('resolveParams must be an object');
        }
    }

    /**
     * Checks if an object is a valid DynamicAction
     */
    static isDynamicAction(obj: any): obj is DynamicAction {
        // Check basic required properties
        const hasBaseProperties =
            obj &&
            typeof obj === 'object' &&
            typeof obj.label === 'string' &&
            typeof obj.type === 'string' &&
            obj.type === 'dynamic' &&
            typeof obj.resolveUrl === 'string';

        return hasBaseProperties;
    }
}
