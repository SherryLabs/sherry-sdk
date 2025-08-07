import { ChainContext } from '../chains';
import { BaseAction } from './action';
import { SelectOption } from '../inputs';

// Type for addresses that can be either a valid Ethereum address or 'sender' keyword
export type AddressOrSender = `0x${string}` | 'sender';

// Configuration for the "to" field
export interface RecipientConfig {
    defaultValue?: AddressOrSender; // Default address or 'sender' if any
    type?: 'select' | 'radio'; // How to render the selection
    options?: SelectOption[]; // Options if using select/radio
    label?: string; // Label for the input
    description?: string; // Optional description/help text
    required?: boolean; // If selection is required
}

// Configuration for the "amount" field
export interface AmountConfig {
    defaultValue?: number; // Default amount if any
    type?: 'select' | 'radio'; // How to render the selection
    options?: SelectOption[]; // Options if using select/radio
    label?: string; // Label for the input
    description?: string; // Optional description/help text
    required?: boolean; // If selection is required
}

export interface TransferAction extends BaseAction {
    type: 'transfer'; // Type of action
    // Simple configuration
    token?: `0x${string}`; // Token address (ERC20, ERC721, etc.)
    to?: AddressOrSender; // Direct recipient address or 'sender' (takes precedence)
    amount?: number; // Direct amount (takes precedence)

    // Advanced configuration (used if direct values not provided)
    recipient?: RecipientConfig;
    amountConfig?: AmountConfig;
}
