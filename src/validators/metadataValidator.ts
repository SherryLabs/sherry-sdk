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

// Define the structure for our validator mapping
interface ActionValidatorConfig {
    // The type guard function
    guard: (action: any) => boolean;
    // The validation function, accepting the specific action type it handles
    validate: (action: any) => ValidatedAction; // Use 'any' or refine with generics/overloads if possible
}

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

            // Process each action with the appropriate validator
            const processedActions = metadata.actions.map(action => {
                if (FlowValidator.isActionFlow(action)) {
                    return FlowValidator.validateFlow(action);
                } else if (BlockchainActionValidator.isBlockchainActionMetadata(action)) {
                    return BlockchainActionValidator.validateBlockchainAction(action);
                } else if (TransferActionValidator.isTransferAction(action)) {
                    return TransferActionValidator.validateTransferAction(action);
                } else if (HttpActionValidator.isHttpAction(action)) {
                    return HttpActionValidator.validateHttpAction(action);
                } else {
                    throw new SherryValidationError('Invalid Action: Unknown action type');
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
}

// Export standalone function for backward compatibility
export function createMetadata(metadata: Metadata): ValidatedMetadata {
    return MetadataValidator.createMetadata(metadata);
}
