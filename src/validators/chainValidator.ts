import { ChainContext } from '../interface/chains';
import { SherryValidationError } from '../errors/customErrors';

/**
 * Chain validator class
 */
export class ChainValidator {
    /**
     * Valida el contexto de cadena.
     */
    static validateChainContext(chains: ChainContext): void {
        const validChains = ['fuji', 'avalanche', 'alfajores', 'celo', 'monad-testnet'];

        if (!validChains.includes(chains.source)) {
            throw new SherryValidationError(
                `Invalid source chain: ${chains.source}. ` +
                    `Valid chains are: ${validChains.join(', ')}`,
            );
        }

        if (chains.destination && !validChains.includes(chains.destination)) {
            throw new SherryValidationError(
                `Invalid destination chain: ${chains.destination}. ` +
                    `Valid chains are: ${validChains.join(', ')}`,
            );
        }
    }
}

// Export standalone function for backward compatibility
export function validateChainContext(chains: ChainContext): void {
    return ChainValidator.validateChainContext(chains);
}
