import { Abi, AbiStateMutability, AbiParameter } from '../index';
import { ContractFunctionName } from '../index';
import { ChainContext } from '../chains';
import { AbiType } from 'abitype';

// Input Types
export type BaseInputType = AbiType | UIInputType | SelectionInputType;

// UI-specific input types (no tienen equivalente directo en Solidity)
export type UIInputType =
    | 'text' // Especialización de string con validación
    | 'number' // Especialización de number, uint o int funcionan para number tambien
    | 'email' // Especialización de string para email
    | 'url' // Especialización de string para url
    | 'datetime' // Especialización de string para fecha
    | 'textarea'; // Especialización de string para texto largo

/*
    - bytes all types and string could be used as text
    - address could be used as text
    - boolean could be used as radio
    - uint and int could be used as number
    */
export type SelectionInputType = 'select' | 'radio';

// Option for selects and radios
export interface SelectOption {
    label: string;
    value: string | number | boolean;
    description?: string;
}

// Base parameter that all share
export interface BaseParameter {
    name: string; // Nombre del parámetro, debe coincidir con el ABI
    label: string; // Etiqueta para mostrar en UI
    description?: string; // Descripción - Ayuda
    required?: boolean; // Si es requerido
    fixed?: boolean; // Si el valor es fijo, no editable
    value?: any; // Valor por defecto, si no se envía, se renderizará un input vacío
    // El input será según el valor en `type`, si no se envía, se tomará el del ABI
}

// Parámetros standard (text, number, boolean, email, url, datetime, textarea)
export interface StandardParameter extends BaseParameter {
    type: BaseInputType; // Si agregas un param y no seteas el type, tomamos el del ABI para renderizar input
    minLength?: number; // Longitud mínima Texto
    maxLength?: number; // Longitud máxima Texto
    pattern?: string; // Para validaciones con regex
    min?: number; // Para inputs numéricos y datetime
    max?: number; // Para inputs numéricos y datetime
}

// Parámetro de selección (select, radio)
export interface SelectParameter extends BaseParameter {
    type: 'select';
    options: SelectOption[];
}

// Parámetro de radio
export interface RadioParameter extends BaseParameter {
    type: 'radio';
    options: SelectOption[];
}

// Tipo unión para todos los parámetros
export type BlockchainParameter = StandardParameter | SelectParameter | RadioParameter;

// Base Action Interface
export interface BaseAction {
    label: string; // Etiqueta para mostrar en UI
    description: string; // Descripción - Ayuda
    chains: ChainContext; // [sourceChain, destinationChain | null]
}

export interface BlockchainActionMetadata extends BaseAction {
    label: string; // Etiqueta para mostrar en UI
    address: `0x${string}`; // Dirección del contrato
    abi: Abi; // ABI del contrato
    functionName: ContractFunctionName; // Nombre de la función
    amount?: number; // If function is payable, amount to send, set proper value as number - will be converted to WEI
    params?: BlockchainParameter[]; // Array de parámetros configurados - DEBES ENVIARLOS EN EL MISMO ORDEN QUE EN EL ABI
}

export interface BlockchainAction extends BlockchainActionMetadata {
    abiParams: AbiParameter[]; // Processed ABI parameters
    blockchainActionType: AbiStateMutability; // Function mutability
}
