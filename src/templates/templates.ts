import {
    TextBasedParameter,
    NumberBasedParameter,
    AddressParameter,
    BooleanParameter,
    SelectParameter,
    RadioParameter,
    SelectOption,
    StandardParameter,
} from '../interface/inputs';

type AnyParameter =
    | TextBasedParameter
    | NumberBasedParameter
    | AddressParameter
    | BooleanParameter
    | SelectParameter
    | RadioParameter;
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
    } as AddressParameter,

    // Text input genérico
    TEXT: {
        type: 'text' as const,
        label: 'Text',
        required: true,
        minLength: 1,
        maxLength: 100,
        description: 'Enter text',
    } as TextBasedParameter,

    // Amount para transferencias
    AMOUNT: {
        type: 'number' as const,
        label: 'Amount',
        required: true,
        min: 0.000001,
        description: 'Enter the amount to transfer',
    } as NumberBasedParameter,

    // Email
    EMAIL: {
        type: 'email' as const,
        label: 'Email Address',
        required: true,
        pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
        description: 'Enter your email address',
    } as TextBasedParameter,

    // Integer
    INTEGER: {
        type: 'number' as const,
        label: 'Integer',
        required: true,
        pattern: '^[0-9]+$',
    } as NumberBasedParameter,

    // Nombre
    NAME: {
        type: 'text' as const,
        label: 'Name',
        required: true,
        minLength: 2,
        maxLength: 50,
        description: 'Enter your full name',
    } as TextBasedParameter,

    // Selección de token
    TOKEN_SELECT: {
        type: 'select' as const,
        label: 'Select Token',
        required: true,
        options: [
            { label: 'ETH', value: 'eth', description: 'Ethereum' },
            // Otras opciones
        ],
        description: 'Select the token you want to use',
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

    // Booleano
    BOOLEAN: {
        type: 'bool' as const,
        label: 'Enable/Disable',
        required: true,
        description: 'Toggle this setting',
    } as BooleanParameter,

    BOOLEAN_RADIO: {
        type: 'radio' as const,
        label: 'Boolean Choice',
        required: true,
        options: [
            { label: 'True', value: true },
            { label: 'False', value: false },
        ],
        description: 'Select true or false',
    } as RadioParameter,
    // Here we add more in case we need
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

/**
 * Función genérica para crear un parámetro con personalizaciones
 */
export function createParameter<T extends AnyParameter>(
    template: T,
    customizations: Partial<Omit<T, 'type'>> & { name: string },
): T {
    return {
        ...template,
        ...customizations,
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
