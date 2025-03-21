import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from 'abitype';
import { ContractFunctionName, isAddress } from 'viem';
import {
    BlockchainActionMetadata,
    BlockchainAction,
    BlockchainParameter,
    StandardParameter,
    SelectParameter,
    RadioParameter,
} from '../interface/blockchainAction';
import { ChainContext } from '../interface/chains';
import { Metadata, ValidatedMetadata } from '../interface/metadata';
import { TransferAction } from '../interface/transferAction';
import { HttpAction } from '../interface/httpAction';
import { HttpActionValidator } from '../validators/httpActionValidator';
import { BlockchainActionValidator } from '../validators/blockchainActionValidator';
import { TransferActionValidator } from '../validators/transferActionValidator';
import { ActionValidationError } from '../errors/customErrors';


// Export functions as wrappers around the validator classes for backward compatibility
export const validateBlockchainActionMetadata = BlockchainActionValidator.validateBlockchainActionMetadata.bind(BlockchainActionValidator);
export const validateBlockchainParameters = BlockchainActionValidator.validateBlockchainParameters.bind(BlockchainActionValidator);
export const isStandardParameter = BlockchainActionValidator.isStandardParameter.bind(BlockchainActionValidator);
export const isSelectParameter = BlockchainActionValidator.isSelectParameter.bind(BlockchainActionValidator);
export const isRadioParameter = BlockchainActionValidator.isRadioParameter.bind(BlockchainActionValidator);
export const getAbiFunction = BlockchainActionValidator.getAbiFunction.bind(BlockchainActionValidator);
export const isValidFunction = BlockchainActionValidator.isValidFunction.bind(BlockchainActionValidator);
export const getAbiParameters = BlockchainActionValidator.getAbiParameters.bind(BlockchainActionValidator);
export const getBlockchainActionType = BlockchainActionValidator.getBlockchainActionType.bind(BlockchainActionValidator);
export const processBlockchainAction = BlockchainActionValidator.validateBlockchainAction.bind(BlockchainActionValidator);

/**
 * Valida los metadatos básicos de una mini app
 */
export function validateBasicMetadata(metadata: Metadata): boolean {
    if (!metadata.url || typeof metadata.url !== 'string') {
        throw new ActionValidationError("Metadata debe tener un campo 'url' válido");
    }

    if (!metadata.icon || typeof metadata.icon !== 'string') {
        throw new ActionValidationError("Metadata debe tener un campo 'icon' válido");
    }

    if (!metadata.title || typeof metadata.title !== 'string') {
        throw new ActionValidationError("Metadata debe tener un campo 'title' válido");
    }

    if (!metadata.description || typeof metadata.description !== 'string') {
        throw new ActionValidationError("Metadata debe tener un campo 'description' válido");
    }

    if (!Array.isArray(metadata.actions)) {
        throw new ActionValidationError('Metadata debe tener un array de acciones');
    }

    if (metadata.actions.length === 0) {
        throw new ActionValidationError('Metadata debe incluir al menos una acción');
    }

    if (metadata.actions.length > 4) {
        throw new ActionValidationError(
            `Se permiten máximo 4 acciones, se recibieron ${metadata.actions.length}`,
        );
    }

    return true;
}

/**
 * Crea y valida un objeto MetadataV2 completo
 * Esta función centraliza la validación y creación de metadatos usando el validator
 *
 * @param metadata Los metadatos sin procesar
 * @returns Los metadatos procesados y validados
 * @throws ActionValidationError si hay algún error de validación
 */
export function createMetadata(metadata: Metadata): ValidatedMetadata {
    try {
        // Validar metadatos básicos
        validateBasicMetadata(metadata);

        // Procesar cada acción con la validación de esta clase
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

        // Devolver los metadatos procesados
        return {
            url: metadata.url,
            icon: metadata.icon,
            title: metadata.title,
            description: metadata.description,
            actions: processedActions,
        };
    } catch (error) {
        //console.log('Error en createMetadata');
        throw error
    }
}

/**
 * Verifica si un objeto es una acción de transferencia válida.
 */
export const isTransferAction = TransferActionValidator.isTransferAction.bind(TransferActionValidator);

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


