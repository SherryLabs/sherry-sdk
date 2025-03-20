/* 
// create-metadata.ts

import { 
    BlockchainActionMetadataV2, 
    BlockchainActionV2, 
    BlockchainParameter,
    BaseAction,
    StandardParameter,
    SelectParameter,
    RadioParameter,
    BaseInputType,
    SelectionInputType
} from '../../interface/V2/blockchainActionV2';
import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from 'abitype';
import { ContractFunctionName, isAddress } from 'viem';
import { ChainContext } from '../../interface/chains';

// Clase personalizada para errores de validación
export class SherryValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SherryValidationError';
    }
}


export interface MetadataV2 {
    url: string;
    icon: string;
    title: string;
    description: string;
    actions: BlockchainActionMetadataV2[];
}


export interface ValidatedMetadataV2 {
    url: string;
    icon: string;
    title: string;
    description: string;
    actions: BlockchainActionV2[];
}


export function isValidFunction(abi: Abi, functionName: ContractFunctionName): boolean {
    return abi.some(
        (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
    );
}

export function getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction {
    const abiFunction = abi.find(
        (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
    );
    if (!abiFunction) {
        throw new SherryValidationError(`Function ${functionName} not found in ABI`);
    }
    return abiFunction;
}


export function getAbiParameters(action: BlockchainActionMetadataV2): AbiParameter[] {
    const abiFunction = getAbiFunction(action.abi, action.functionName);
    // Crear una copia profunda de los parámetros ABI
    return abiFunction.inputs.map(param => ({ ...param }));
}


export function getBlockchainActionType(action: BlockchainActionMetadataV2): AbiStateMutability {
    const abiFunction = getAbiFunction(action.abi, action.functionName);
    return abiFunction.stateMutability;
}

export function validateContractAddress(address: string): void {
    if (!isAddress(address)) {
        throw new SherryValidationError(`Invalid contract address: ${address}`);
    }
}


export function validateChainContext(chains: ChainContext): void {
    const validChains = ['fuji', 'avalanche', 'alfajores', 'celo', 'monad-testnet'];
    
    if (!validChains.includes(chains.source)) {
        throw new SherryValidationError(
            `Invalid source chain: ${chains.source}. ` +
            `Valid chains are: ${validChains.join(', ')}`
        );
    }
    
    if (chains.destination && !validChains.includes(chains.destination)) {
        throw new SherryValidationError(
            `Invalid destination chain: ${chains.destination}. ` +
            `Valid chains are: ${validChains.join(', ')}`
        );
    }
}


function validateBaseParameter(param: BlockchainParameter): void {
    // Verificar campos requeridos
    if (!param.name) {
        throw new SherryValidationError(`Parameter missing required 'name' field`);
    }
    
    if (!param.label) {
        throw new SherryValidationError(`Parameter '${param.name}' missing required 'label' field`);
    }
    
    // Verificar tipo
    if (!param.type) {
        throw new SherryValidationError(`Parameter '${param}' missing required 'type' field`);
    }
}


function validateSelectionParameter(param: SelectParameter | RadioParameter): void {
    validateBaseParameter(param);
    
    if (!param.options || !Array.isArray(param.options) || param.options.length === 0) {
        throw new SherryValidationError(
            `${param.type} parameter '${param.name}' must have at least one option`
        );
    }
    
    // Verificar opciones duplicadas
    const values = new Set();
    param.options.forEach(opt => {
        if (!opt.label) {
            throw new SherryValidationError(
                `Option missing required 'label' in parameter '${param.name}'`
            );
        }
        
        if (opt.value === undefined) {
            throw new SherryValidationError(
                `Option missing required 'value' in parameter '${param.name}'`
            );
        }
        
        if (values.has(String(opt.value))) {
            throw new SherryValidationError(
                `Duplicate value '${opt.value}' in ${param.type} parameter '${param.name}'`
            );
        }
        values.add(String(opt.value));
    });
}


function validateStandardParameter(param: StandardParameter): void {
    validateBaseParameter(param);
    
    // Verificar límites mínimos y máximos
    if (param.min !== undefined && param.max !== undefined) {
        if (param.min > param.max) {
            throw new SherryValidationError(
                `Parameter '${param.name}' has min (${param.min}) greater than max (${param.max})`
            );
        }
    }
    
    if (param.minLength !== undefined && param.maxLength !== undefined) {
        if (param.minLength > param.maxLength) {
            throw new SherryValidationError(
                `Parameter '${param.name}' has minLength (${param.minLength}) greater than maxLength (${param.maxLength})`
            );
        }
    }
    
    // Validar patrones regex
    if (param.pattern) {
        try {
            new RegExp(param.pattern);
        } catch (error) {
            throw new SherryValidationError(
                `Invalid regex pattern for parameter '${param.name}': ${error}`
            );
        }
    }
    
    // Validar tipos específicos
    if (param.type === 'email' && param.value !== undefined && typeof param.value === 'string') {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(param.value)) {
            throw new SherryValidationError(
                `Invalid email format for parameter '${param.name}': ${param.value}`
            );
        }
    }
    
    if (param.type === 'url' && param.value !== undefined && typeof param.value === 'string') {
        try {
            new URL(param.value);
        } catch {
            throw new SherryValidationError(
                `Invalid URL format for parameter '${param.name}': ${param.value}`
            );
        }
    }
    
    if (param.type === 'address' && param.value !== undefined && typeof param.value === 'string') {
        // Permitir 'sender' como valor especial
        if (param.value !== 'sender' && !isAddress(param.value)) {
            throw new SherryValidationError(
                `Invalid address format for parameter '${param.name}': ${param.value}`
            );
        }
    }
}


function validateParameter(param: BlockchainParameter): void {
    if (param.type === 'select' || param.type === 'radio') {
        validateSelectionParameter(param as SelectParameter | RadioParameter);
    } else {
        validateStandardParameter(param as StandardParameter);
    }
}


function validateParametersMatchAbi(abiParams: AbiParameter[], configParams: BlockchainParameter[]): void {
    // Crear un mapa de nombres de parámetros del ABI
    const abiParamNames = new Set(abiParams.map(p => p.name));
    
    // Verificar que cada parámetro configurado exista en el ABI
    configParams.forEach(param => {
        if (!abiParamNames.has(param.name)) {
            throw new SherryValidationError(
                `Parameter '${param.name}' does not exist in the ABI function parameters. ` +
                `Available parameters are: ${Array.from(abiParamNames).join(', ')}`
            );
        }
    });
    
    // Opcional: verificar que todos los parámetros del ABI tengan una configuración
    const configParamNames = new Set(configParams.map(p => p.name));
    const missingParams = Array.from(abiParamNames).filter(name => !configParamNames.has(name));
    
    if (missingParams.length > 0) {
        console.warn(`Warning: The following ABI parameters are not configured: ${missingParams.join(', ')}`);
    }
}


function applyParamValues(abiParams: AbiParameter[], paramsValue?: any[]): void {
    if (!paramsValue || paramsValue.length === 0) return;
    
    if (paramsValue.length > abiParams.length) {
        throw new SherryValidationError(
            `Too many parameter values provided: expected ${abiParams.length}, got ${paramsValue.length}`
        );
    }
    
    // Los valores se asignarán en el backend cuando se ejecute la transacción
    // Esta función es principalmente para validación
}


function applyParamLabels(abiParams: AbiParameter[], paramsLabel?: string[]): void {
    if (!paramsLabel || paramsLabel.length === 0) return;
    
    if (paramsLabel.length > abiParams.length) {
        throw new SherryValidationError(
            `Too many parameter labels provided: expected ${abiParams.length}, got ${paramsLabel.length}`
        );
    }
    
    // Aplicar etiquetas a los parámetros del ABI
    for (let i = 0; i < abiParams.length && i < paramsLabel.length; i++) {
        if (abiParams[i] && paramsLabel[i]) {
            // Guardamos el nombre original y aplicamos la etiqueta como nombre visible
            // Nota: en una implementación real, podrías querer mantener ambos
            abiParams[i].originalName = abiParams[i].name;
            abiParams[i].name = paramsLabel[i];
        }
    }
}


export function validateBlockchainAction(action: BlockchainActionMetadataV2): void {
    // Validar campos básicos
    if (!action.label) {
        throw new SherryValidationError("Action missing required 'label' field");
    }
    
    if (!action.address) {
        throw new SherryValidationError("Action missing required 'address' field");
    }
    
    if (!action.abi || !Array.isArray(action.abi)) {
        throw new SherryValidationError("Action missing required 'abi' field or 'abi' is not an array");
    }
    
    if (!action.functionName) {
        throw new SherryValidationError("Action missing required 'functionName' field");
    }
    
    if (!action.chains || !action.chains.source) {
        throw new SherryValidationError("Action missing required 'chains' field with 'source'");
    }
    
    // Validar dirección
    validateContractAddress(action.address);
    
    // Validar contexto de cadena
    validateChainContext(action.chains);
    
    // Verificar que la función exista en el ABI
    if (!isValidFunction(action.abi, action.functionName)) {
        throw new SherryValidationError(`Function '${action.functionName}' not found in the provided ABI`);
    }
    
    // Obtener los parámetros del ABI
    const abiParams = getAbiParameters(action);
    
    // Validar parámetros
    if (action.params) {
        // Validar que cada parámetro sea válido
        action.params.forEach(param => validateParameter(param));
        
        // Validar que los parámetros coincidan con el ABI
        validateParametersMatchAbi(abiParams, action.params);
    }
    
    // Validar enfoque legacy
    if (action.paramsValue) {
        applyParamValues(abiParams, action.paramsValue);
    }
    
    if (action.paramsLabel) {
        applyParamLabels(abiParams, action.paramsLabel);
    }
    
    // Validar amount para funciones payable
    const actionType = getBlockchainActionType(action);
    if (actionType === 'payable' && action.amount === undefined) {
        console.warn(`Warning: Function '${action.functionName}' is payable but no 'amount' is specified`);
    } else if (actionType !== 'payable' && action.amount !== undefined) {
        throw new SherryValidationError(
            `'amount' is specified for non-payable function '${action.functionName}'`
        );
    }
}


export function processBlockchainAction(action: BlockchainActionMetadataV2): BlockchainActionV2 {
    // Validar la acción
    validateBlockchainAction(action);
    
    // Obtener los parámetros del ABI
    const abiParams = getAbiParameters(action);
    
    // Aplicar labels si se proporcionan (enfoque legacy)
    if (action.paramsLabel) {
        applyParamLabels(abiParams, action.paramsLabel);
    }
    
    // Obtener el tipo de mutabilidad de la acción
    const blockchainActionType = getBlockchainActionType(action);
    
    // Devolver la acción procesada
    return {
        ...action,
        abiParams,
        blockchainActionType,
    };
}


function validateBasicMetadata(metadata: MetadataV2): void {
    if (!metadata.url) {
        throw new SherryValidationError("Metadata missing required 'url' field");
    }
    
    if (!metadata.icon) {
        throw new SherryValidationError("Metadata missing required 'icon' field");
    }
    
    if (!metadata.title) {
        throw new SherryValidationError("Metadata missing required 'title' field");
    }
    
    if (!metadata.description) {
        throw new SherryValidationError("Metadata missing required 'description' field");
    }
    
    if (!Array.isArray(metadata.actions)) {
        throw new SherryValidationError("Metadata missing required 'actions' array");
    }
    
    if (metadata.actions.length === 0) {
        throw new SherryValidationError("Metadata must include at least one action");
    }
    
    if (metadata.actions.length > 4) {
        throw new SherryValidationError(`Maximum 4 actions allowed, got ${metadata.actions.length}`);
    }
}


export function createMetadata(metadata: MetadataV2): ValidatedMetadataV2 {
    try {
        // Validar metadatos básicos
        validateBasicMetadata(metadata);
        
        // Procesar cada acción
        const processedActions = metadata.actions.map(action => {
            return processBlockchainAction(action);
        });
        
       
        return {
            url: metadata.url,
            icon: metadata.icon,
            title: metadata.title,
            description: metadata.description,
            actions: processedActions,
        };
    } catch (error) {
        // Mejorar errores con contexto
        if (error instanceof SherryValidationError) {
            throw error;
        } else {
            throw new SherryValidationError(`Error processing metadata: ${error.message}`);
        }
    }
}


export function isBlockchainActionMetadata(obj: any): obj is BlockchainActionMetadataV2 {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.label === 'string' &&
        typeof obj.address === 'string' &&
        Array.isArray(obj.abi) &&
        typeof obj.functionName === 'string' &&
        obj.chains &&
        typeof obj.chains === 'object' &&
        typeof obj.chains.source === 'string'
    );
}


export function isBlockchainAction(obj: any): obj is BlockchainActionV2 {
    return (
        isBlockchainActionMetadata(obj) &&
        Array.isArray(obj.abiParams) &&
        typeof obj.blockchainActionType === 'string'
    );
}
*/
