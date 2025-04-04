import { BlockchainActionMetadata, BlockchainAction } from './blockchainAction';
import { TransferAction } from './transferAction';
import { HttpAction } from './httpAction';
import { ActionFlow } from './nestedAction';

/**
 * Tipo unión para cualquier tipo de acción que puede ser incluida en la metadata
 */
export type Action =
    | BlockchainActionMetadata // Acción blockchain sin procesar
    | TransferAction // Acción de transferencia
    | HttpAction // Acción HTTP
    | ActionFlow; // Flujo de acciones anidadas

/**
 * Tipo unión para cualquier tipo de acción validada
 */
export type ValidatedAction =
    | BlockchainAction // Acción blockchain procesada
    | TransferAction // Acción de transferencia
    | HttpAction // Acción HTTP validada
    | ActionFlow; // Flujo de acciones validado
