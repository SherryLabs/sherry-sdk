import { Metadata, ValidatedMetadata } from '../interface/metadata';
import { SherryValidationError, DynamicActionValidationError } from '../errors/customErrors';
import { Action, ValidatedAction } from '../interface/actions/action';
import { FlowValidator } from './flowValidator';
import { BlockchainActionValidator } from './blockchainActionValidator';
import { TransferActionValidator } from './transferActionValidator';
import { HttpActionValidator } from './httpActionValidator';
import { ActionFlow } from '../interface/actions/flowAction';
import { BlockchainActionMetadata } from '../interface/actions/blockchainAction';
import { TransferAction } from '../interface/actions/transferAction';
import { HttpAction } from '../interface/actions/httpAction';
import { DynamicActionValidator } from './dynamicActionValidator';
import { DynamicAction } from '../interface/actions/dynamicAction';

// Define the structure for our validator mapping
interface ActionValidatorConfig {
    // The type guard function
    guard: (action: any) => boolean;
    // The validation function, accepting the specific action type it handles
    validate: (action: any) => ValidatedAction;
}

type DynamicActionValidateFn = (action: DynamicAction, baseUrl?: string) => ValidatedAction;

// Create the lookup table (array) of validators
const actionValidators: ActionValidatorConfig[] = [
    {
        guard: FlowValidator.isActionFlow,
        validate: FlowValidator.validateFlow as (action: ActionFlow) => ValidatedAction,
    },
    {
        guard: BlockchainActionValidator.isBlockchainActionMetadata,
        validate: BlockchainActionValidator.validateBlockchainAction as (
            action: BlockchainActionMetadata,
        ) => ValidatedAction,
    },
    {
        guard: TransferActionValidator.isTransferAction,
        validate: TransferActionValidator.validateTransferAction as (
            action: TransferAction,
        ) => ValidatedAction,
    },
    {
        guard: HttpActionValidator.isHttpAction,
        validate: HttpActionValidator.validateHttpAction as (action: HttpAction) => ValidatedAction,
    },
    {
        guard: DynamicActionValidator.isDynamicAction,
        validate: DynamicActionValidator.validateDynamicAction as (
            action: DynamicAction,
        ) => ValidatedAction,
    },
    // --- Add new action types here ---
    // { guard: NewActionValidator.isNewAction, validate: NewActionValidator.validateNewAction },
];

/**
 * Security constants for metadata validation
 */
const SECURITY_LIMITS = {
    MAX_STRING_LENGTH: 1000,
    MAX_URL_LENGTH: 2000,
    MAX_DESCRIPTION_LENGTH: 2000,
    ALLOWED_PROTOCOLS: ['https:', 'http:'],
    MAX_ACTIONS: 4,
} as const;

/**
 * Security utility functions
 */
class SecurityUtils {
    /**
     * Safely validates that an input is a plain object (not null, array, or other type)
     * Protects against prototype pollution attacks
     */
    static isPlainObject(obj: unknown): obj is Record<string, unknown> {
        return (
            obj !== null &&
            typeof obj === 'object' &&
            Object.prototype.toString.call(obj) === '[object Object]' &&
            Object.getPrototypeOf(obj) === Object.prototype
        );
    }

    /**
     * Safely validates that an input is a real array
     * Protects against array-like objects and prototype pollution
     */
    static isRealArray(arr: unknown): arr is unknown[] {
        return Array.isArray(arr) && Object.prototype.toString.call(arr) === '[object Array]';
    }

    /**
     * Validates string length and content safety
     */
    static validateSafeString(value: unknown, fieldName: string, maxLength: number): string {
        if (typeof value !== 'string' || value.length === 0) {
            throw new SherryValidationError(`Metadata missing required '${fieldName}' field`);
        }

        if (value.length > maxLength) {
            throw new SherryValidationError(
                `${fieldName} exceeds maximum length of ${maxLength} characters`,
            );
        }

        return value;
    }

    /**
     * Validates URL safety including protocol whitelist
     */
    static validateSafeURL(urlString: string, fieldName: string): URL {
        let url: URL;
        try {
            url = new URL(urlString);
        } catch (error) {
            throw new SherryValidationError(`Invalid ${fieldName} format`);
        }

        if (!SECURITY_LIMITS.ALLOWED_PROTOCOLS.includes(url.protocol as 'https:' | 'http:')) {
            throw new SherryValidationError(
                `${fieldName} must use HTTP or HTTPS protocol, got: ${url.protocol}`,
            );
        }

        return url;
    }
}

/**
 * Metadata validator class
 */
export class MetadataValidator {
    /**
     * Validates the basic metadata of a mini app with enhanced security
     */
    static validateBasicMetadata(metadata: unknown): boolean {
        // First, ensure we have a safe plain object
        if (!SecurityUtils.isPlainObject(metadata)) {
            throw new SherryValidationError('Metadata must be a valid object');
        }

        // Validate required string fields with length limits
        const url = SecurityUtils.validateSafeString(
            metadata.url,
            'url',
            SECURITY_LIMITS.MAX_URL_LENGTH,
        );
        SecurityUtils.validateSafeURL(url, 'url');

        SecurityUtils.validateSafeString(metadata.icon, 'icon', SECURITY_LIMITS.MAX_URL_LENGTH);
        SecurityUtils.validateSafeURL(metadata.icon as string, 'icon');

        SecurityUtils.validateSafeString(
            metadata.title,
            'title',
            SECURITY_LIMITS.MAX_STRING_LENGTH,
        );

        SecurityUtils.validateSafeString(
            metadata.description,
            'description',
            SECURITY_LIMITS.MAX_DESCRIPTION_LENGTH,
        );

        // Validate actions array with enhanced security
        if (!SecurityUtils.isRealArray(metadata.actions)) {
            throw new SherryValidationError('Metadata must have a valid actions array');
        }

        const actions = metadata.actions;
        if (actions.length === 0) {
            throw new SherryValidationError('Metadata must include at least one action');
        }

        if (actions.length > SECURITY_LIMITS.MAX_ACTIONS) {
            throw new SherryValidationError(
                `Maximum ${SECURITY_LIMITS.MAX_ACTIONS} actions allowed, got ${actions.length}`,
            );
        }

        // Validate baseUrl if present
        if (metadata.baseUrl !== undefined) {
            const baseUrl = SecurityUtils.validateSafeString(
                metadata.baseUrl,
                'baseUrl',
                SECURITY_LIMITS.MAX_URL_LENGTH,
            );
            SecurityUtils.validateSafeURL(baseUrl, 'baseUrl');
        }

        // Validate each action with enhanced security
        actions.forEach((action, index) => {
            if (!SecurityUtils.isPlainObject(action)) {
                throw new SherryValidationError(`Action at index ${index} must be a valid object`);
            }

            if (typeof action.type !== 'string') {
                throw new SherryValidationError(
                    `Action at index ${index} is missing required 'type' property`,
                );
            }

            const validTypes = ['blockchain', 'transfer', 'http', 'dynamic', 'flow'];
            if (!validTypes.includes(action.type)) {
                throw new SherryValidationError(
                    `Action at index ${index} has invalid type: '${action.type}'. Must be one of: ${validTypes.join(', ')}`,
                );
            }
        });

        return true;
    }

    /**
     * Validates the relationship between baseUrl and dynamic actions
     * Ensures that dynamic actions with relative paths have a baseUrl available
     */
    static validateBaseUrlAndDynamicActions(metadata: Metadata): void {
        // Enhanced baseUrl validation with security checks
        if (metadata.baseUrl) {
            SecurityUtils.validateSafeURL(metadata.baseUrl, 'baseUrl');
        }

        // Comprueba si hay DynamicActions que requieran una baseUrl
        const dynamicActions = metadata.actions.filter(
            action => action.type === 'dynamic',
        ) as DynamicAction[];

        if (dynamicActions.length > 0) {
            // Para cada DynamicAction, verifica que tenga acceso a una URL completa
            dynamicActions.forEach(action => {
                // Si el path es relativo pero no hay baseUrl, es un error
                if (action.path && action.path.startsWith('/') && !metadata.baseUrl) {
                    throw new DynamicActionValidationError(
                        `Dynamic action '${action.label}' has a relative path '${action.path}' but no baseUrl is provided in metadata`,
                    );
                }
            });
        }
    }

    /**
     * Creates and validates a complete Metadata object with enhanced security
     * This function centralizes the validation and creation of metadata
     *
     * @param metadata The unprocessed metadata (unknown type for security)
     * @returns The processed and validated metadata
     * @throws SherryValidationError if there is any validation error
     */
    static createMetadata(metadata: unknown): ValidatedMetadata {
        try {
            // 1. Enhanced security validation of metadata structure
            this.validateBasicMetadata(metadata);

            // Cast to Metadata after security validation
            const safeMetadata = metadata as Metadata;

            // 2. Validate baseUrl and dynamic actions relationship
            // This ensures dynamic actions with relative paths have a baseUrl
            this.validateBaseUrlAndDynamicActions(safeMetadata);

            // 3. Process each action with its appropriate validator
            const processedActions = safeMetadata.actions.map((action): ValidatedAction => {
                const validatorConfig = actionValidators.find(v => v.guard(action));

                if (validatorConfig) {
                    // Check if it's the dynamic action validator and pass baseUrl
                    if (validatorConfig.guard === DynamicActionValidator.isDynamicAction) {
                        try {
                            return (validatorConfig.validate as DynamicActionValidateFn)(
                                action as DynamicAction,
                                safeMetadata.baseUrl,
                            );
                        } catch (error) {
                            if (error instanceof Error) {
                                throw new DynamicActionValidationError(
                                    `Dynamic action '${action.label}' validation failed: ${error.message}`,
                                );
                            }
                            throw error;
                        }
                    } else {
                        // For other validators, call normally
                        return (validatorConfig.validate as (action: Action) => ValidatedAction)(
                            action,
                        );
                    }
                } else {
                    throw new SherryValidationError(
                        `Invalid Action: Unknown action type for action with label "${action.label ?? 'N/A'}"`,
                    );
                }
            });

            // 4. Return the processed metadata with validated actions
            return {
                url: safeMetadata.url,
                icon: safeMetadata.icon,
                title: safeMetadata.title,
                description: safeMetadata.description,
                baseUrl: safeMetadata.baseUrl,
                actions: processedActions as ValidatedAction[],
            };
        } catch (error) {
            // Re-throw specific error types
            if (
                error instanceof SherryValidationError ||
                error instanceof DynamicActionValidationError
            ) {
                throw error;
            } else if (error instanceof Error) {
                throw new SherryValidationError(`Error processing metadata: ${error.message}`);
            } else {
                throw new SherryValidationError(`Unknown error processing metadata`);
            }
        }
    }
}

// Export standalone function for backward compatibility with enhanced security
export function createMetadata(metadata: unknown): ValidatedMetadata {
    return MetadataValidator.createMetadata(metadata);
}
