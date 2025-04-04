//import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from 'abitype';
//import { ContractFunctionName, isAddress } from 'viem';
//import {
//    BlockchainActionMetadata,
//    BlockchainAction,
//    BlockchainParameter,
//    StandardParameter,
//    SelectParameter,
//    RadioParameter,
//} from '../interface/blockchainAction';
//import { ChainContext } from '../interface/chains';
import { Metadata, ValidatedMetadata } from '../interface/metadata';
//import { TransferAction } from '../interface/transferAction';
//import { HttpAction } from '../interface/httpAction';
import { HttpActionValidator } from './httpActionValidator';
import { BlockchainActionValidator } from './blockchainActionValidator';
import { TransferActionValidator } from './transferActionValidator';
import { ActionValidationError } from '../errors/customErrors';

// Export functions as wrappers around the validator classes for backward compatibility
export const validateBlockchainActionMetadata =
    BlockchainActionValidator.validateBlockchainActionMetadata.bind(BlockchainActionValidator);
export const validateBlockchainParameters =
    BlockchainActionValidator.validateBlockchainParameters.bind(BlockchainActionValidator);
export const isStandardParameter =
    BlockchainActionValidator.isStandardParameter.bind(BlockchainActionValidator);
export const isSelectParameter =
    BlockchainActionValidator.isSelectParameter.bind(BlockchainActionValidator);
export const isRadioParameter =
    BlockchainActionValidator.isRadioParameter.bind(BlockchainActionValidator);
export const getAbiFunction =
    BlockchainActionValidator.getAbiFunction.bind(BlockchainActionValidator);
export const isValidFunction =
    BlockchainActionValidator.isValidFunction.bind(BlockchainActionValidator);
export const getAbiParameters =
    BlockchainActionValidator.getAbiParameters.bind(BlockchainActionValidator);
export const getBlockchainActionType =
    BlockchainActionValidator.getBlockchainActionType.bind(BlockchainActionValidator);
export const processBlockchainAction =
    BlockchainActionValidator.validateBlockchainAction.bind(BlockchainActionValidator);

/**
 * Validates the basic metadata of a mini app
 */
export function validateBasicMetadata(metadata: Metadata): boolean {
    if (!metadata.url || typeof metadata.url !== 'string') {
        throw new ActionValidationError("Metadata must have a valid 'url' field");
    }

    if (!metadata.icon || typeof metadata.icon !== 'string') {
        throw new ActionValidationError("Metadata must have a valid 'icon' field");
    }

    if (!metadata.title || typeof metadata.title !== 'string') {
        throw new ActionValidationError("Metadata must have a valid 'title' field");
    }

    if (!metadata.description || typeof metadata.description !== 'string') {
        throw new ActionValidationError("Metadata must have a valid 'description' field");
    }

    if (!Array.isArray(metadata.actions)) {
        throw new ActionValidationError('Metadata must have an array of actions');
    }

    if (metadata.actions.length === 0) {
        throw new ActionValidationError('Metadata must include at least one action');
    }

    if (metadata.actions.length > 4) {
        throw new ActionValidationError(
            `Maximum 4 actions allowed, received ${metadata.actions.length}`,
        );
    }

    return true;
}

/**
 * Creates and validates a complete MetadataV2 object
 * This function centralizes the validation and creation of metadata using the validator
 *
 * @param metadata The unprocessed metadata
 * @returns The processed and validated metadata
 * @throws ActionValidationError if there is any validation error
 */
export function createMetadata(metadata: Metadata): ValidatedMetadata {
    try {
        // Validate basic metadata
        validateBasicMetadata(metadata);

        // Process each action with the validation from this class
        const processedActions = metadata.actions.map(action => {
            if (BlockchainActionValidator.isBlockchainActionMetadata(action)) {
                return BlockchainActionValidator.validateBlockchainAction(action);
            } else if (TransferActionValidator.isTransferAction(action)) {
                return TransferActionValidator.validateTransferAction(action);
            } else if (HttpActionValidator.isHttpAction(action)) {
                return HttpActionValidator.validateHttpAction(action);
            } else {
                throw new ActionValidationError('Invalid Action');
            }
        });

        // Return the processed metadata
        return {
            url: metadata.url,
            icon: metadata.icon,
            title: metadata.title,
            description: metadata.description,
            actions: processedActions,
        };
    } catch (error) {
        console.log('Error in createMetadata: ', error);
        throw error;
    }
}

/**
 * Verifica si un objeto es una acción de transferencia válida.
 */
export const isTransferAction =
    TransferActionValidator.isTransferAction.bind(TransferActionValidator);

/**
 * Verifica si un objeto es una acción HTTP válida.
 * Reusa la implementación de HttpActionValidator.
 */
export const isHttpAction = HttpActionValidator.isHttpAction.bind(HttpActionValidator);

/**
 * Valida una acción de transferencia.
 * Reusa la implementación de TransferActionValidator.
 */
export { ActionValidationError } from '../errors/customErrors';
