import {
    StandardParameter,
    SelectParameter,
    RadioParameter,
    BlockchainParameter,
    SelectOption,
} from '../interface/actions/blockchainAction';

/**
 * Plantillas para parámetros comunes
 */
export const PARAM_TEMPLATES = {
    // Dirección Ethereum
    ADDRESS: {
        type: 'address' as const,
        label: 'Wallet Address',
        required: true,
        pattern: '^0x[a-fA-F0-9]{40}$',
        description: 'Enter a valid Ethereum address',
    } as StandardParameter,

    // Amount para transferencias
    AMOUNT: {
        type: 'number' as const,
        label: 'Amount',
        required: true,
        min: 0.000001,
        description: 'Enter the amount to transfer',
    } as StandardParameter,

    // Email
    EMAIL: {
        type: 'email' as const,
        label: 'Email Address',
        required: true,
        pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
        description: 'Enter your email address',
    } as StandardParameter,

    // Integer
    INTEGER: {
        type: 'number' as const,
        label: 'Integer',
        required: true,
        pattern: '^[0-9]+$',
    } as StandardParameter,

    // Nombre
    NAME: {
        type: 'text' as const,
        label: 'Name',
        required: true,
        minLength: 2,
        maxLength: 50,
        description: 'Enter your full name',
    } as StandardParameter,

    // Nombre de usuario
    USERNAME: {
        type: 'text' as const,
        label: 'Username',
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$',
        description: 'Enter a username (letters, numbers, underscores only)',
    } as StandardParameter,

    // Mensaje o comentario
    MESSAGE: {
        type: 'textarea' as const,
        label: 'Message',
        required: false,
        minLength: 5,
        maxLength: 500,
        description: 'Please enter your message',
    } as StandardParameter,

    // URL
    URL: {
        type: 'url' as const,
        label: 'Website',
        required: false,
        pattern: '^https?://.*',
        description: 'Enter a valid URL',
    } as StandardParameter,

    // Fecha
    DATE: {
        type: 'datetime' as const,
        label: 'Date',
        required: true,
        description: 'Select a date',
    } as StandardParameter,

    // Selección de token
    TOKEN_SELECT: {
        type: 'select' as const,
        label: 'Select Token',
        required: true,
        options: [
            { label: 'ETH', value: 'eth', description: 'Ethereum' },
            { label: 'USDC', value: 'usdc', description: 'USD Coin' },
            { label: 'USDT', value: 'usdt', description: 'Tether' },
            { label: 'DAI', value: 'dai', description: 'Dai Stablecoin' },
            { label: 'AVAX', value: 'avax', description: 'Avalanche' },
        ],
        description: 'Select the token you want to use',
    } as SelectParameter,

    // Selección de red
    NETWORK_SELECT: {
        type: 'select' as const,
        label: 'Select Network',
        required: true,
        options: [
            { label: 'Ethereum', value: 'ethereum' },
            { label: 'Avalanche', value: 'avalanche' },
            { label: 'Celo', value: 'celo' },
            { label: 'Monad Testnet', value: 'monad-testnet' },
        ],
        description: 'Select the blockchain network',
    } as SelectParameter,

    // Selección Sí/No
    YES_NO: {
        type: 'radio' as const,
        label: 'Confirmation',
        required: true,
        options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
        ],
        description: 'Please confirm your choice',
    } as RadioParameter,

    // Selector de prioridad
    PRIORITY: {
        type: 'radio' as const,
        label: 'Priority',
        required: true,
        options: [
            { label: 'Low', value: 'low', description: 'Slower but cheaper' },
            { label: 'Medium', value: 'medium', description: 'Balance between speed and cost' },
            { label: 'High', value: 'high', description: 'Faster but more expensive' },
        ],
        description: 'Select transaction priority',
    } as RadioParameter,

    // Text inputs
    TEXT: {
        type: 'text' as const,
        label: 'Text',
        required: true,
    } as StandardParameter,

    BOOLEAN_RADIO: {
        type: 'radio' as const,
        label: 'Yes/No',
        required: true,
        options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
        ],
    } as RadioParameter,

    TEXTAREA: {
        type: 'textarea' as const,
        label: 'Text Area',
        required: true,
        minLength: 10,
        maxLength: 500,
    } as StandardParameter,

    // Percentage Example
    PERCENTAGE: {
        type: 'number' as const,
        label: 'Percentage',
        required: true,
        min: 0,
        max: 100,
    } as StandardParameter,

    // Cantidad de tokens NFT
    TOKEN_ID: {
        type: 'number' as const,
        label: 'Token ID',
        required: true,
        min: 1,
        description: 'Enter the token ID',
    } as StandardParameter,

    // Booleano
    BOOLEAN: {
        type: 'bool' as const,
        label: 'Enable/Disable',
        required: true,
        description: 'Toggle this setting',
    } as StandardParameter,

    TOKEN_AMOUNT: {
        type: 'number' as const,
        label: 'Token Amount',
        required: true,
        min: 0,
    } as StandardParameter,

    NFT_ID: {
        type: 'number' as const,
        label: 'NFT ID',
        required: true,
        min: 0,
        pattern: '^[0-9]+$',
    } as StandardParameter,
};

/**
 * Función para crear opciones de selección
 */
export function createSelectOptions(
    options: Array<{ label: string; value: any; description?: string }>,
): SelectOption[] {
    return options.map(option => ({
        label: option.label,
        value: option.value,
        description: option.description,
    }));
}

/**
 * Función para crear un parámetro select personalizado
 */
export function createSelectParam(
    name: string,
    label: string,
    options: Array<{ label: string; value: any; description?: string }>,
    required: boolean = true,
    description?: string,
): SelectParameter {
    return {
        name,
        label,
        type: 'select',
        options: createSelectOptions(options),
        required,
        description,
    };
}

/**
 * Función para crear un parámetro radio personalizado
 */
export function createRadioParam(
    name: string,
    label: string,
    options: Array<{ label: string; value: any; description?: string }>,
    required: boolean = true,
    description?: string,
): RadioParameter {
    return {
        name,
        label,
        type: 'radio',
        options: createSelectOptions(options),
        required,
        description,
    };
}

// Common token options
export const TOKEN_OPTIONS: SelectOption[] = [
    { label: 'ETH', value: 'eth', description: 'Ethereum' },
    { label: 'AVAX', value: 'avax', description: 'Avalanche' },
    { label: 'USDC', value: 'usdc', description: 'USD Coin' },
    { label: 'USDT', value: 'usdt', description: 'Tether USD' },
    { label: 'DAI', value: 'dai', description: 'Dai Stablecoin' },
    { label: 'WBTC', value: 'wbtc', description: 'Wrapped Bitcoin' },
];

// Common chain options
export const CHAIN_OPTIONS: SelectOption[] = [
    { label: 'Ethereum', value: 'ethereum', description: 'Ethereum Mainnet' },
    { label: 'Avalanche', value: 'avalanche', description: 'Avalanche C-Chain' },
    { label: 'Celo', value: 'celo', description: 'Celo Mainnet' },
    { label: 'Fuji', value: 'fuji', description: 'Avalanche Fuji Testnet' },
    { label: 'Alfajores', value: 'alfajores', description: 'Celo Alfajores Testnet' },
    { label: 'Monad Testnet', value: 'monad-testnet', description: 'Monad Testnet' },
];

// Function to create a parameter with customizations
export function createParameter<T extends BlockchainParameter>(
    template: T,
    customizations: Partial<T> & { name: string },
): T {
    return {
        ...template,
        ...customizations,
    };
}
