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
 * Metadata validator class
 */
export class MetadataValidator {
    /**
     * Validates the basic metadata of a mini app
     */
    static validateBasicMetadata(metadata: Metadata): boolean {
        if (!metadata.url || typeof metadata.url !== 'string') {
            throw new SherryValidationError("Metadata missing required 'url' field");
        }

        if (!metadata.icon || typeof metadata.icon !== 'string') {
            throw new SherryValidationError("Metadata missing required 'icon' field");
        }

        if (!metadata.title || typeof metadata.title !== 'string') {
            throw new SherryValidationError("Metadata missing required 'title' field");
        }

        if (!metadata.description || typeof metadata.description !== 'string') {
            throw new SherryValidationError("Metadata missing required 'description' field");
        }

        if (!Array.isArray(metadata.actions)) {
            throw new SherryValidationError("Metadata missing required 'actions' array");
        }

        if (metadata.actions.length === 0) {
            throw new SherryValidationError('Metadata must include at least one action');
        }

        if (metadata.actions.length > 4) {
            throw new SherryValidationError(
                `Maximum 4 actions allowed, got ${metadata.actions.length}`,
            );
        }

        if (metadata.baseUrl) {
            try {
                new URL(metadata.baseUrl);
            } catch (error) {
                throw new SherryValidationError(`Invalid baseUrl format: ${metadata.baseUrl}`);
            }
        }

        metadata.actions.forEach((action, index) => {
            if (!action.type) {
                throw new SherryValidationError(
                    `Action at index ${index} is missing required 'type' property`,
                );
            }

            // Verificar que sea uno de los tipos permitidos
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
        // Si la metadata tiene baseUrl, comprueba que sea válida
        if (metadata.baseUrl) {
            try {
                new URL(metadata.baseUrl);
            } catch (error) {
                throw new SherryValidationError(`Invalid baseUrl: ${metadata.baseUrl}`);
            }
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
     * Creates and validates a complete Metadata object
     * This function centralizes the validation and creation of metadata
     *
     * @param metadata The unprocessed metadata
     * @returns The processed and validated metadata
     * @throws SherryValidationError if there is any validation error
     */
    static createMetadata(metadata: Metadata): ValidatedMetadata {
        try {
            // 1. Validate basic metadata structure
            this.validateBasicMetadata(metadata);

            // 2. Validate baseUrl and dynamic actions relationship
            // This ensures dynamic actions with relative paths have a baseUrl
            this.validateBaseUrlAndDynamicActions(metadata);

            // 3. Process each action with its appropriate validator
            const processedActions = metadata.actions.map((action): ValidatedAction => {
                const validatorConfig = actionValidators.find(v => v.guard(action));

                if (validatorConfig) {
                    // Check if it's the dynamic action validator and pass baseUrl
                    if (validatorConfig.guard === DynamicActionValidator.isDynamicAction) {
                        try {
                            return (validatorConfig.validate as DynamicActionValidateFn)(
                                action as DynamicAction,
                                metadata.baseUrl,
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
                url: metadata.url,
                icon: metadata.icon,
                title: metadata.title,
                description: metadata.description,
                baseUrl: metadata.baseUrl, // Make sure to include baseUrl in the validated metadata
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

// Export standalone function for backward compatibility
export function createMetadata(metadata: Metadata): ValidatedMetadata {
    return MetadataValidator.createMetadata(metadata);
}
