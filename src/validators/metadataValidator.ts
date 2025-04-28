import { Metadata, ValidatedMetadata } from '../interface/metadata';
import { SherryValidationError } from '../errors/customErrors';
import { ValidatedAction } from '../interface/actions/action';
import { FlowValidator } from './flowValidator';
import { BlockchainActionValidator } from './blockchainActionValidator';
import { TransferActionValidator } from '../validators/transferActionValidator';
import { HttpActionValidator } from '../validators/httpActionValidator';
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
    validate: (action: any) => ValidatedAction; // Use 'any' or refine with generics/overloads if possible
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

        return true;
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
            // Validate basic metadata
            this.validateBasicMetadata(metadata);

            const processedActions = metadata.actions.map((action): ValidatedAction => {
                const validatorConfig = actionValidators.find(v => v.guard(action));

                if (validatorConfig) {
                    // Check if it's the dynamic action validator and pass baseUrl
                    if (validatorConfig.guard === DynamicActionValidator.isDynamicAction) {
                        return (validatorConfig.validate as DynamicActionValidateFn)(
                            action as DynamicAction,
                            metadata.baseUrl,
                        );
                    } else {
                        // For other validators, call normally
                        return (validatorConfig.validate as (action: any) => ValidatedAction)(
                            action,
                        );
                    }
                } else {
                    throw new SherryValidationError(
                        `Invalid Action: Unknown action type for action with label "${action.label ?? 'N/A'}"`,
                    );
                }
            });
            // Return the processed metadata
            return {
                url: metadata.url,
                icon: metadata.icon,
                title: metadata.title,
                description: metadata.description,
                actions: processedActions as ValidatedAction[],
            };
        } catch (error) {
            if (error instanceof SherryValidationError) {
                throw error;
            } else if (error instanceof Error) {
                throw new SherryValidationError(`Error processing metadata: ${error.message}`);
            } else {
                throw new SherryValidationError(`Unknown error processing metadata`);
            }
        }
    }

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
                if (!action.path.startsWith('http') && !metadata.baseUrl) {
                    throw new SherryValidationError(
                        `DynamicAction '${action.label}' has a relative path '${action.path}' but no baseUrl is provided in metadata`,
                    );
                }
            });
        }
    }
}

// Export standalone function for backward compatibility
export function createMetadata(metadata: Metadata): ValidatedMetadata {
    return MetadataValidator.createMetadata(metadata);
}
