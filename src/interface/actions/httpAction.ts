export type BaseInputType =
    | 'text'
    | 'number'
    | 'boolean'
    | 'email'
    | 'url'
    | 'datetime'
    | 'textarea';

export type AdvancedInputType = 'select' | 'radio';

export interface SelectOption {
    label: string;
    value: string | number | boolean;
}

export interface BaseParameter {
    name: string;
    label: string;
    required: boolean;
    description?: string;
    defaultValue?: any;
}

export interface StandardParameter extends BaseParameter {
    type: BaseInputType;
    minLength?: number;
    maxLength?: number;
    pattern?: string; // Para validaciones con regex
    min?: number; // Para inputs numéricos y datetime
    max?: number; // Para inputs numéricos y datetime
}

export interface SelectParameter extends BaseParameter {
    type: 'select';
    options: SelectOption[];
}

export interface RadioParameter extends BaseParameter {
    type: 'radio';
    options: SelectOption[];
}

export type HttpParameter = StandardParameter | SelectParameter | RadioParameter;

export interface HttpAction {
    type: 'http';
    label: string;
    path: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: Record<string, any>;
    params?: HttpParameter[];
}

export const INPUT_TYPES = {
    STRING: 'string' as const,
    NUMBER: 'number' as const,
    BOOLEAN: 'boolean' as const,
    EMAIL: 'email' as const,
    URL: 'url' as const,
    DATETIME: 'datetime' as const,
    TEXTAREA: 'textarea' as const,
    SELECT: 'select' as const,
    RADIO: 'radio' as const,
} as const;

// Templates for common cases
export const PARAMETER_TEMPLATES = {
    EMAIL: {
        type: INPUT_TYPES.EMAIL,
        label: 'Email Address',
        required: true,
        pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    },
    WALLET_ADDRESS: {
        type: INPUT_TYPES.STRING,
        label: 'Wallet Address',
        required: true,
        pattern: '^0x[a-fA-F0-9]{40}$',
    },
    PAYMENT_TOKEN: {
        type: INPUT_TYPES.RADIO,
        label: 'Payment Token',
        required: true,
        options: [
            { label: 'USDC', value: 'usdc' },
            { label: 'ETH', value: 'eth' },
        ],
    },
} as const;
