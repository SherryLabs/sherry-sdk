import { ChainContext, VALID_CHAINS } from '../interface/chains';
import { SherryValidationError } from '../errors/customErrors';

/**
 * Chain validator class
 */
export class ChainValidator {
    /**
     * Valida el contexto de cadena.
     */
    static validateChainContext(chains: ChainContext): void {
        if (!VALID_CHAINS.includes(chains.source as any)) {
            throw new SherryValidationError(
                `Invalid source chain: ${chains.source}. ` +
                    `Valid chains are: ${VALID_CHAINS.join(', ')}`,
            );
        }

        if (chains.destination && !VALID_CHAINS.includes(chains.destination as any)) {
            throw new SherryValidationError(
                `Invalid destination chain: ${chains.destination}. ` +
                    `Valid chains are: ${VALID_CHAINS.join(', ')}`,
            );
        }
    }
}

// Export standalone function for backward compatibility
export function validateChainContext(chains: ChainContext): void {
    return ChainValidator.validateChainContext(chains);
}
