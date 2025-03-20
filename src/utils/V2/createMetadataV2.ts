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
    SelectionInputType,
} from '../../interface/V2/blockchainActionV2';
import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from 'abitype';
import { ContractFunctionName, isAddress } from 'viem';
import { ChainContext } from '../../interface/chains';
import { SherryValidationError } from '../customErrors';

// Extend AbiParameter with our custom properties using type intersection
type ExtendedAbiParameter = AbiParameter & {
    originalName?: string;
    value?: any;
};

/**
 * Interfaz para metadatos sin procesar
 */
export interface MetadataV2 {
    url: string;
    icon: string;
    title: string;
    description: string;
    actions: BlockchainActionMetadataV2[];
}

/**
 * Interfaz para metadatos procesados y validados
 */
export interface ValidatedMetadataV2 {
    url: string;
    icon: string;
    title: string;
    description: string;
    actions: BlockchainActionV2[];
}

/**
 * Verifica si una función existe en el ABI.
 */
export function isValidFunction(abi: Abi, functionName: ContractFunctionName): boolean {
    return abi.some(
        (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
    );
}

/**
 * Obtiene la función del ABI por su nombre.
 */
export function getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction {
    const abiFunction = abi.find(
        (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
    );
    if (!abiFunction) {
        throw new SherryValidationError(`Function ${functionName} not found in ABI`);
    }
    return abiFunction;
}

/**
 * Obtiene los parámetros de una función en el ABI.
 */
export function getAbiParameters(action: BlockchainActionMetadataV2): ExtendedAbiParameter[] {
    const abiFunction = getAbiFunction(action.abi, action.functionName);
    // Crear una copia profunda de los parámetros ABI
    return abiFunction.inputs.map(param => ({ ...param }) as ExtendedAbiParameter);
}

/**
 * Obtiene el tipo de mutabilidad de una función en el ABI.
 */
export function getBlockchainActionType(action: BlockchainActionMetadataV2): AbiStateMutability {
    const abiFunction = getAbiFunction(action.abi, action.functionName);
    return abiFunction.stateMutability;
}

/**
 * Valida una dirección de contrato.
 */
export function validateContractAddress(address: string): void {
    if (!isAddress(address)) {
        throw new SherryValidationError(`Invalid contract address: ${address}`);
    }
}

/**
 * Valida el contexto de cadena.
 */
export function validateChainContext(chains: ChainContext): void {
    const validChains = ['fuji', 'avalanche', 'alfajores', 'celo', 'monad-testnet'];

    if (!validChains.includes(chains.source)) {
        throw new SherryValidationError(
            `Invalid source chain: ${chains.source}. ` +
                `Valid chains are: ${validChains.join(', ')}`,
        );
    }

    if (chains.destination && !validChains.includes(chains.destination)) {
        throw new SherryValidationError(
            `Invalid destination chain: ${chains.destination}. ` +
                `Valid chains are: ${validChains.join(', ')}`,
        );
    }
}

/**
 * Valida los parámetros base.
 */
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

/**
 * Valida parámetros de selección (select, radio).
 */
function validateSelectionParameter(param: SelectParameter | RadioParameter): void {
    validateBaseParameter(param);

    if (!param.options || !Array.isArray(param.options) || param.options.length === 0) {
        throw new SherryValidationError(
            `${param.type} parameter '${param.name}' must have at least one option`,
        );
    }

    // Verificar opciones duplicadas
    const values = new Set();
    param.options.forEach(opt => {
        if (!opt.label) {
            throw new SherryValidationError(
                `Option missing required 'label' in parameter '${param.name}'`,
            );
        }

        if (opt.value === undefined) {
            throw new SherryValidationError(
                `Option missing required 'value' in parameter '${param.name}'`,
            );
        }

        if (values.has(String(opt.value))) {
            throw new SherryValidationError(
                `Duplicate value '${opt.value}' in ${param.type} parameter '${param.name}'`,
            );
        }
        values.add(String(opt.value));
    });
}

/**
 * Valida parámetros estándar.
 */
function validateStandardParameter(param: StandardParameter): void {
    validateBaseParameter(param);

    // Verificar límites mínimos y máximos
    if (param.min !== undefined && param.max !== undefined) {
        if (param.min > param.max) {
            throw new SherryValidationError(
                `Parameter '${param.name}' has min (${param.min}) greater than max (${param.max})`,
            );
        }
    }

    if (param.minLength !== undefined && param.maxLength !== undefined) {
        if (param.minLength > param.maxLength) {
            throw new SherryValidationError(
                `Parameter '${param.name}' has minLength (${param.minLength}) greater than maxLength (${param.maxLength})`,
            );
        }
    }

    // Validar patrones regex
    if (param.pattern) {
        try {
            new RegExp(param.pattern);
        } catch (error) {
            throw new SherryValidationError(
                `Invalid regex pattern for parameter '${param.name}': ${error}`,
            );
        }
    }

    // Validar tipos específicos
    if (param.type === 'email' && param.value !== undefined && typeof param.value === 'string') {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(param.value)) {
            throw new SherryValidationError(
                `Invalid email format for parameter '${param.name}': ${param.value}`,
            );
        }
    }

    if (param.type === 'url' && param.value !== undefined && typeof param.value === 'string') {
        try {
            new URL(param.value);
        } catch {
            throw new SherryValidationError(
                `Invalid URL format for parameter '${param.name}': ${param.value}`,
            );
        }
    }

    if (param.type === 'address' && param.value !== undefined && typeof param.value === 'string') {
        // Permitir 'sender' como valor especial
        if (param.value !== 'sender' && !isAddress(param.value)) {
            throw new SherryValidationError(
                `Invalid address format for parameter '${param.name}': ${param.value}`,
            );
        }
    }
}

/**
 * Valida cualquier parámetro.
 */
function validateParameter(param: BlockchainParameter): void {
    if (param.type === 'select' || param.type === 'radio') {
        validateSelectionParameter(param as SelectParameter | RadioParameter);
    } else {
        validateStandardParameter(param as StandardParameter);
    }
}

/**
 * Valida que los parámetros coincidan con los del ABI.
 */
function validateParametersMatchAbi(
    abiParams: ExtendedAbiParameter[],
    configParams: BlockchainParameter[],
): void {
    try {
        // Crear un mapa de nombres de parámetros del ABI, filtrando nombres undefined
        const abiParamNames = new Set(
            abiParams.map(p => p.name).filter((name): name is string => name !== undefined),
        );

        // Verificar que cada parámetro configurado exista en el ABI
        configParams.forEach(param => {
            if (!abiParamNames.has(param.name)) {
                throw new SherryValidationError(
                    `Parameter '${param.name}' does not exist in the ABI function parameters. ` +
                        `Available parameters are: ${Array.from(abiParamNames).join(', ')}`,
                );
            }

            // Verificar compatibilidad de tipos entre el UI parameter y el ABI parameter
            const abiParam = abiParams.find(p => p.name === param.name);
            if (abiParam) {
                validateParameterTypeCompatibility(param, abiParam);
            }
        });

        // Opcional: verificar que todos los parámetros del ABI tengan una configuración
        const configParamNames = new Set(configParams.map(p => p.name));
        const missingParams = Array.from(abiParamNames).filter(name => !configParamNames.has(name));

        if (missingParams.length > 0) {
            console.warn(
                `Warning: The following ABI parameters are not configured: ${missingParams.join(
                    ', ',
                )}`,
            );
        }
    } catch (error) {
        if (error instanceof SherryValidationError) {
            throw error;
        } else if (error instanceof Error) {
            throw new SherryValidationError(`Error validating parameters match: ${error.message}`);
        } else {
            throw new SherryValidationError(`Error validating parameters match`);
        }
    }
}

/**
 * Valida la compatibilidad de tipos entre el parámetro de UI y el parámetro ABI.
 */
function validateParameterTypeCompatibility(
    configParam: BlockchainParameter,
    abiParam: ExtendedAbiParameter,
): void {
    try {
        // Map de compatibilidad entre tipos de UI y tipos de ABI
        const typeCompatibilityMap: Record<string, string[]> = {
            address: ['address'],
            string: ['string', 'text', 'textarea', 'email', 'url'],
            uint256: ['number', 'integer'],
            int256: ['number', 'integer'],
            bool: ['boolean', 'checkbox'],
            bytes: ['text', 'file'],
            bytes32: ['text'],
            //'string[]': ['array'],
            // Añadir más mapeos según sea necesario
        };

        // Extraer el tipo base (sin notación de array)
        const baseAbiType = abiParam.type.replace(/\[\d*\]$/, '');
        const compatibleTypes = typeCompatibilityMap[baseAbiType] || [];

        // Si no hay tipos compatibles definidos, permitir cualquier tipo (flexibilidad)
        if (compatibleTypes.length === 0) {
            return;
        }

        // Verificar si el tipo del parámetro de UI es compatible con el tipo ABI
        if (!compatibleTypes.includes(configParam.type)) {
            throw new SherryValidationError(
                `Parameter '${configParam.name}' type '${configParam.type}' is not compatible with ABI type '${abiParam.type}'. ` +
                    `Compatible types are: ${compatibleTypes.join(', ')}`,
            );
        }

        // Verificar compatibilidad de arrays
        const isAbiArray = abiParam.type.includes('[');
        const isConfigArray = configParam.type === ('array' as BaseInputType);

        if (isAbiArray && !isConfigArray) {
            throw new SherryValidationError(
                `Parameter '${configParam.name}' should be of type 'array' for ABI type '${abiParam.type}'`,
            );
        }

        if (!isAbiArray && isConfigArray) {
            throw new SherryValidationError(
                `Parameter '${configParam.name}' is of type 'array' but ABI type '${abiParam.type}' is not an array`,
            );
        }
    } catch (error) {
        if (error instanceof SherryValidationError) {
            throw error;
        } else {
            throw new SherryValidationError(
                `Error validating parameter type compatibility: ${error}`,
            );
        }
    }
}

/**
 * Aplica valores de parámetros a los parámetros del ABI (para compatibilidad con paramsValue).
 */
function applyParamValues(abiParams: ExtendedAbiParameter[], paramsValue?: any[]): void {
    try {
        if (!paramsValue || paramsValue.length === 0) return;

        if (paramsValue.length > abiParams.length) {
            throw new SherryValidationError(
                `Too many parameter values provided: expected ${abiParams.length}, got ${paramsValue.length}`,
            );
        }

        // Efectivamente aplicar y validar los valores a los parámetros
        for (let i = 0; i < paramsValue.length; i++) {
            if (abiParams[i] && paramsValue[i] !== undefined) {
                // Solo validar sin arrojar errores - comentar para pasar a un enfoque menos estricto
                // validateValueType(paramsValue[i], abiParams[i]);

                // Asignar el valor al parámetro
                abiParams[i]!.value = paramsValue[i];
            }
        }
    } catch (error) {
        if (error instanceof SherryValidationError) {
            throw error;
        } else {
            throw new SherryValidationError(`Error applying parameter values: ${error}`);
        }
    }
}

/**
 * Aplica etiquetas de parámetros a los parámetros del ABI (para compatibilidad con paramsLabel).
 */
/*
function applyParamLabels(abiParams: ExtendedAbiParameter[], paramsLabel?: string[]): void {
    try {
        if (!paramsLabel || paramsLabel.length === 0) return;

        if (paramsLabel.length > abiParams.length) {
            throw new SherryValidationError(
                `Too many parameter labels provided: expected ${abiParams.length}, got ${paramsLabel.length}`,
            );
        }

        // Aplicar etiquetas a los parámetros del ABI
        for (let i = 0; i < abiParams.length && i < paramsLabel.length; i++) {
            if (
                abiParams[i] &&
                paramsLabel[i] &&
                abiParams[i] !== undefined &&
                paramsLabel[i] !== undefined &&
                abiParams !== undefined &&
                paramsLabel !== undefined
            ) {
                // Guardamos el nombre original y aplicamos la etiqueta como nombre visible
                if (abiParams[i]?.name !== undefined) {
                    abiParams[i]!.originalName = abiParams[i]!.name;
                    abiParams[i]!.name = paramsLabel[i]!;
                } else {
                    throw new SherryValidationError('Error in applyParamLabels');
                }
            }
        }
    } catch (error) {
        if (error instanceof SherryValidationError) {
            throw error;
        } else {
            throw new SherryValidationError(`Error applying parameter labels: ${error}`);
        }
    }
}
*/

/**
 * Valida una acción blockchain.
 */
export function validateBlockchainAction(action: BlockchainActionMetadataV2): void {
    try {
        if (isBlockchainActionMetadata(action)) {
            // Validar campos básicos
            if (!action.label) {
                throw new SherryValidationError("Action missing required 'label' field");
            }

            if (!action.address) {
                throw new SherryValidationError("Action missing required 'address' field");
            }

            if (!action.abi || !Array.isArray(action.abi)) {
                throw new SherryValidationError(
                    "Action missing required 'abi' field or 'abi' is not an array",
                );
            }

            if (!action.functionName) {
                throw new SherryValidationError("Action missing required 'functionName' field");
            }

            if (!action.chains || !action.chains.source) {
                throw new SherryValidationError(
                    "Action missing required 'chains' field with 'source'",
                );
            }

            // Validar dirección
            validateContractAddress(action.address);

            // Validar contexto de cadena
            validateChainContext(action.chains);

            // Verificar que la función exista en el ABI
            if (!isValidFunction(action.abi, action.functionName)) {
                throw new SherryValidationError(
                    `Function '${action.functionName}' not found in the provided ABI`,
                );
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
            /*
            if (action.paramsValue) {
                applyParamValues(abiParams, action.paramsValue);
            }

            if (action.paramsLabel) {
                applyParamLabels(abiParams, action.paramsLabel);
            }
            */

            // Validar amount para funciones payable
            const actionType = getBlockchainActionType(action);
            if (actionType === 'payable' && action.amount === undefined) {
                console.warn(
                    `Warning: Function '${action.functionName}' is payable but no 'amount' is specified`,
                );
            } else if (actionType !== 'payable' && action.amount !== undefined) {
                throw new SherryValidationError(
                    `'amount' is specified for non-payable function '${action.functionName}'`,
                );
            }
        } else {
            throw new SherryValidationError('It is not blockchain Action  ');
        }
    } catch (error) {
        if (error instanceof SherryValidationError) {
            throw error;
        } else {
            throw new SherryValidationError(`Error validating blockchain action: ${error}`);
        }
    }
}

/**
 * Procesa una acción blockchain.
 */
export function processBlockchainAction(action: BlockchainActionMetadataV2): BlockchainActionV2 {
    try {
        // Validar la acción
        validateBlockchainAction(action);

        // Obtener los parámetros del ABI
        const abiParams = getAbiParameters(action);

        // Aplicar labels si se proporcionan (enfoque legacy)
        /*
        if (action.paramsLabel) {
            applyParamLabels(abiParams, action.paramsLabel);
        }

        // Aplicar valores si se proporcionan (enfoque legacy)
        if (action.paramsValue) {
            applyParamValues(abiParams, action.paramsValue);
        }
        */

        // Obtener el tipo de mutabilidad de la acción
        const blockchainActionType = getBlockchainActionType(action);

        // Devolver la acción procesada
        return {
            ...action,
            abiParams: abiParams as AbiParameter[], // Cast back to AbiParameter for compatibility
            blockchainActionType,
        };
    } catch (error) {
        throw new SherryValidationError(
            `Error processing blockchain action '${action.label || action.functionName}': ${error}`,
        );
    }
}

/**
 * Valida los metadatos básicos.
 */
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
        throw new SherryValidationError('Metadata must include at least one action');
    }

    if (metadata.actions.length > 4) {
        throw new SherryValidationError(
            `Maximum 4 actions allowed, got ${metadata.actions.length}`,
        );
    }
}

/**
 * Función principal para crear metadatos validados.
 * Valida y procesa metadatos y sus acciones.
 */
export function createMetadataV2(metadata: MetadataV2): ValidatedMetadataV2 {
    try {
        // Validar metadatos básicos
        validateBasicMetadata(metadata);

        // Procesar cada acción
        const processedActions = metadata.actions.map(action => {
            return processBlockchainAction(action);
        });

        // Devolver los metadatos procesados
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
            throw new SherryValidationError(`Error processing metadata: ${error}`);
        }
    }
}

/**
 * Verifica si un objeto es una acción blockchain válida.
 */
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

/**
 * Verifica si un objeto es de tipo BlockchainAction.
 */
export function isBlockchainAction(obj: any): obj is BlockchainActionV2 {
    return (
        isBlockchainActionMetadata(obj) &&
        'abiParams' in obj &&
        Array.isArray(obj.abiParams) &&
        'blockchainActionType' in obj &&
        typeof obj.blockchainActionType === 'string'
    );
}
