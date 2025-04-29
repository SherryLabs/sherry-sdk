import { AbiType } from 'abitype';

// Option for selects and radios
export interface SelectOption {
    label: string;
    value: string | number | boolean;
    description?: string;
}

export interface StandardParameter extends BaseParameter {
    type: BaseInputType;
    minLength?: number;
    maxLength?: number;
    pattern?: string; // Para validaciones con regex
    min?: number; // Para inputs numéricos y datetime
    max?: number; // Para inputs numéricos y datetime
}

export interface BaseParameter {
    name: string;
    label: string;
    required?: boolean;
    description?: string;
    fixed?: boolean; // Si el valor es fijo, no editable
    value?: any; // Valor por defecto, si no se envía, se renderizará un input vacío
}

export interface SelectParameter extends BaseParameter {
    type: 'select';
    options: SelectOption[];
}

export interface RadioParameter extends BaseParameter {
    type: 'radio';
    options: SelectOption[];
}

export type BaseInputType = AbiType | UIInputType | SelectionInputType;

/*
    - bytes all types and string could be used as text
    - address could be used as text
    - boolean could be used as radio
    - uint and int could be used as number
    */
export type SelectionInputType = 'select' | 'radio';

// UI-specific input types (no tienen equivalente directo en Solidity)
export type UIInputType =
    | 'text' // Especialización de string con validación
    | 'number' // Especialización de number, uint o int funcionan para number tambien
    | 'email' // Especialización de string para email
    | 'url' // Especialización de string para url
    | 'datetime' // Especialización de string para fecha
    | 'textarea' // Especialización de string para texto largo
    | 'boolean';
