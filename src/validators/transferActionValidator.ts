import { isAddress } from 'viem';
import { TransferAction } from '../interface/actions/transferAction';
import { ChainContext } from '../interface/chains';
import { InvalidMetadataError } from '../errors/customErrors';

/**
 * Validator class for Transfer Actions
 */
export class TransferActionValidator {
    /**
     * Validates a transfer action and returns it if valid
     */
    static validateTransferAction(action: TransferAction): TransferAction {
        // Validate basic fields
        this.validateBasicFields(action);

        // Validate chains
        this.validateChains(action.chains);

        // Validate recipient
        this.validateRecipient(action);

        // Validate amount
        this.validateAmount(action);

        return action;
    }

    /**
     * Validates the basic fields of a transfer action
     */
    private static validateBasicFields(action: TransferAction): void {
        if (!action.label || typeof action.label !== 'string') {
            throw new InvalidMetadataError('Transfer action must have a valid label');
        }

        if (action.description !== undefined && typeof action.description !== 'string') {
            throw new InvalidMetadataError('If provided, description must be a string');
        }
    }

    /**
     * Validates the chains configuration
     */
    private static validateChains(chains: ChainContext): void {
        if (!chains || typeof chains !== 'object') {
            throw new InvalidMetadataError('Chains configuration is required');
        }

        if (!chains.source || typeof chains.source !== 'string') {
            throw new InvalidMetadataError('Source chain is required');
        }

        const validChains = ['fuji', 'avalanche', 'alfajores', 'celo', 'monad-testnet', 'ethereum'];
        if (!validChains.includes(chains.source)) {
            throw new InvalidMetadataError(`Invalid source chain: ${chains.source}`);
        }

        if (chains.destination !== undefined) {
            if (
                typeof chains.destination !== 'string' ||
                !validChains.includes(chains.destination)
            ) {
                throw new InvalidMetadataError(`Invalid destination chain: ${chains.destination}`);
            }
        }
    }

    /**
     * Validates the recipient configuration
     */
    private static validateRecipient(action: TransferAction): void {
        // Direct recipient address
        if (action.to !== undefined) {
            if (typeof action.to !== 'string') {
                throw new InvalidMetadataError('Recipient address must be a string');
            }

            if (!isAddress(action.to)) {
                throw new InvalidMetadataError(`Invalid recipient address: ${action.to}`);
            }
        }

        // Recipient configuration object
        if (action.recipient !== undefined) {
            if (typeof action.recipient !== 'object' || action.recipient === null) {
                throw new InvalidMetadataError('Recipient configuration must be an object');
            }

            if (!['select', 'input'].includes(action.recipient.inputType || '')) {
                throw new InvalidMetadataError(
                    `Invalid recipient input type: ${action.recipient.inputType}`,
                );
            }

            if (
                action.recipient.inputType === 'select' &&
                (!Array.isArray(action.recipient.options) || action.recipient.options.length === 0)
            ) {
                throw new InvalidMetadataError(
                    'Recipient select options must be a non-empty array',
                );
            }
        }

        // Either direct recipient or recipient configuration must be provided
        if (action.to === undefined && action.recipient === undefined) {
            throw new InvalidMetadataError('Either "to" or "recipient" must be provided');
        }
    }

    /**
     * Validates the amount configuration
     */
    private static validateAmount(action: TransferAction): void {
        // Direct amount
        if (action.amount !== undefined) {
            if (typeof action.amount !== 'number' || action.amount <= 0) {
                throw new InvalidMetadataError('Amount must be a positive number');
            }
        }

        // Amount configuration object
        if (action.amountConfig !== undefined) {
            if (typeof action.amountConfig !== 'object' || action.amountConfig === null) {
                throw new InvalidMetadataError('Amount configuration must be an object');
            }

            if (
                action.amountConfig.inputType &&
                !['select', 'radio', 'input'].includes(action.amountConfig.inputType)
            ) {
                throw new InvalidMetadataError(
                    `Invalid amount input type: ${action.amountConfig.inputType}`,
                );
            }

            if (
                ['select', 'radio'].includes(action.amountConfig.inputType || '') &&
                (!Array.isArray(action.amountConfig.options) ||
                    action.amountConfig.options.length === 0)
            ) {
                throw new InvalidMetadataError('Amount options must be a non-empty array');
            }

            if (
                action.amountConfig.defaultValue !== undefined &&
                typeof action.amountConfig.defaultValue !== 'number'
            ) {
                throw new InvalidMetadataError('Default amount must be a number');
            }
        }
    }

    /**
     * Checks if an object is a valid TransferAction
     */
    static isTransferAction(obj: any): obj is TransferAction {
        // Check basic required properties
        const hasBaseProperties =
            obj &&
            typeof obj === 'object' &&
            typeof obj.label === 'string' &&
            obj.chains &&
            typeof obj.chains === 'object' &&
            typeof obj.chains.source === 'string';

        if (!hasBaseProperties) return false;

        // Ensure it has at least one of the transfer-specific properties
        const hasTransferSpecificProperties =
            obj.to !== undefined ||
            obj.amount !== undefined ||
            obj.recipient !== undefined ||
            obj.amountConfig !== undefined;

        // Ensure it doesn't have blockchain-specific properties
        const hasNoBlockchainSpecificProperties =
            obj.address === undefined && obj.abi === undefined && obj.functionName === undefined;

        return hasTransferSpecificProperties && hasNoBlockchainSpecificProperties;
    }
}

