import { BlockchainActionMetadata, BlockchainAction } from './blockchainAction';
import { TransferAction } from './transferAction';
import { HttpAction } from './httpAction';
import { ActionFlow } from './flowAction';
import { DynamicAction } from './dynamicAction';
import { ChainContext } from '../chains';

/**
 * Tipo unión para cualquier tipo de acción que puede ser incluida en la metadata
 */
export type Action =
    | BlockchainActionMetadata // Acción blockchain sin procesar
    | TransferAction // Acción de transferencia
    | HttpAction // Acción HTTP
    | ActionFlow // Flujo de acciones anidadas
    | DynamicAction; // Acción dinámica

/**
 * Tipo unión para cualquier tipo de acción validada
 */
export type ValidatedAction =
    | BlockchainAction // Acción blockchain procesada
    | TransferAction // Acción de transferencia
    | HttpAction // Acción HTTP validada
    | ActionFlow // Flujo de acciones validado
    | DynamicAction;

/**
 * Interfaz base con propiedades comunes a todas las acciones.
 */
export interface BaseAction {
    /**
     * Etiqueta descriptiva para mostrar en la interfaz de usuario.
     * @example "Swap Tokens", "Mint NFT", "Vote Yes"
     */
    label: string;

    /**
     * Configuración de las cadenas de origen y destino para la acción.
     */
    chains: ChainContext;

    /**
     * Propiedad discriminadora para identificar el tipo de acción.
     * Cada interfaz que extienda BaseAction debe definir su propio tipo literal.
     */
    type: string; // El tipo base es string, las implementaciones usarán literales
}
