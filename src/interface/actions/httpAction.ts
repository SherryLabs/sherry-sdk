import { StandardParameter, SelectParameter, RadioParameter } from '../inputs';

export type AdvancedInputType = 'select' | 'radio';

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
