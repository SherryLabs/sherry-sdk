import { Abi, AbiStateMutability, AbiParameter } from '../index';
import { ContractFunctionName } from '../index';
import { ChainContext } from '../chains';

// Input Types
export type BaseInputType =
    | 'text'
    | 'number'
    | 'boolean'
    | 'email'
    | 'url'
    | 'datetime'
    | 'textarea'
    | 'address'; // Blockchain specific type
// | 'bytes'    // Blockchain specific type
// | 'hidden';  // Oculto en UI

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
    placeholder?: string; // Placeholder para inputs
    required?: boolean; // Si es requerido
    fixed?: boolean; // Si el valor es fijo, no editable
    value?: any; // Valor por defecto
}

// Parámetros standard (text, number, boolean, email, url, datetime, textarea)
export interface StandardParameter extends BaseParameter {
    type: BaseInputType;
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
    title: string; // Título para mostrar en UI
    description: string; // Descripción - Ayuda
    chains: ChainContext; // [sourceChain, destinationChain | null]
}

export interface BlockchainActionMetadataV2 extends BaseAction {
    label: string; // Etiqueta para mostrar en UI
    address: `0x${string}`; // Dirección del contrato
    abi: Abi; // ABI del contrato
    functionName: ContractFunctionName; // Nombre de la función
    amount?: number; // If function is payable, amount to send, set proper value as number - will be converted to WEI
}

export interface BlockchainActionV2 extends BlockchainActionMetadataV2 {
    abiParams: AbiParameter[]; // Processed ABI parameters
    blockchainActionType: AbiStateMutability; // Function mutability
}
