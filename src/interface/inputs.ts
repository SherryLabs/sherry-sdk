import { AbiType } from 'abitype';

// Option for selects and radios
export interface SelectOption {
    label: string;
    value: string | number | boolean;
    description?: string;
}

export interface BaseParameter {
    type: string;
    name: string;
    label: string;
    required?: boolean;
    description?: string;
    fixed?: boolean; // Si el valor es fijo, no editable
    value?: any; // Valor por defecto, si no se envía, se renderizará un input vacío
}

export interface TextBasedParameter extends BaseParameter {
    type:
        | 'text'
        | 'email'
        | 'url'
        | 'textarea'
        | 'string'
        | 'bytes'
        | Extract<AbiType, 'string' | 'bytes' | `bytes${number}`>;
    minLength?: number;
    maxLength?: number;
    pattern?: string; // Para validaciones con regex
}

export interface NumberBasedParameter extends BaseParameter {
    type: 'number' | 'datetime' | Extract<AbiType, `uint${string}` | `int${string}`>;
    min?: number; // Para inputs numéricos y datetime
    max?: number; // Para inputs numéricos y datetime
    pattern?: string; // Para validaciones con regex
}

export interface AddressParameter extends BaseParameter {
    type: 'address' | Extract<AbiType, 'address'>;
    pattern?: string; // Para validaciones con regex
}

export interface BooleanParameter extends BaseParameter {
    type: 'boolean' | Extract<AbiType, 'bool'>;
}

export interface SelectParameter extends BaseParameter {
    type: 'select';
    options: SelectOption[];
}

export interface RadioParameter extends BaseParameter {
    type: 'radio';
    options: SelectOption[];
}

export type StandardParameter =
    | TextBasedParameter
    | NumberBasedParameter
    | AddressParameter
    | BooleanParameter

export type SelectionInputType = 'select' | 'radio';

export type UIInputType =
    | 'text' // Especialización de string con validación
    | 'number' // Especialización de number, uint o int funcionan para number tambien
    | 'email' // Especialización de string para email
    | 'url' // Especialización de string para url
    | 'datetime' // Especialización de string para fecha
    | 'textarea' // Especialización de string para texto largo
    | 'boolean'

export type BaseInputType = AbiType | UIInputType | SelectionInputType;

export type Parameter = StandardParameter | SelectParameter | RadioParameter;