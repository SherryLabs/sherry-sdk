import { ChainContext } from '../chains';
import { BaseAction } from './action';

// Option for selects and radios
export interface SelectOption {
    label: string;
    value: string | number | boolean;
    description?: string;
}

// Configuration for the "to" field
export interface RecipientConfig {
    defaultValue?: `0x${string}`; // Default address if any
    inputType?: 'select' | 'radio'; // How to render the selection
    options?: SelectOption[]; // Options if using select/radio
    label?: string; // Label for the input
    description?: string; // Optional description/help text
    required?: boolean; // If selection is required
}

// Configuration for the "amount" field
export interface AmountConfig {
    defaultValue?: number; // Default amount if any
    inputType?: 'select' | 'radio'; // How to render the selection
    options?: SelectOption[]; // Options if using select/radio
    label?: string; // Label for the input
    description?: string; // Optional description/help text
    required?: boolean; // If selection is required
}

export interface TransferAction extends BaseAction {
    type: 'transfer'; // Type of action
    // Simple configuration
    token?: `0x${string}`; // Token address (ERC20, ERC721, etc.)
    to?: `0x${string}`; // Direct recipient address (takes precedence)
    amount?: number; // Direct amount (takes precedence)

    // Advanced configuration (used if direct values not provided)
    recipient?: RecipientConfig;
    amountConfig?: AmountConfig;
}
