import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from 'abitype';
import { ContractFunctionName, isAddress } from 'viem';
import {
    BlockchainActionMetadata,
    BlockchainAction,
    BlockchainParameter,
    StandardParameter,
    SelectParameter,
    RadioParameter,
} from '../interface/blockchainAction';
import { ChainContext } from '../interface/chains';
import { Metadata, ValidatedMetadata } from '../interface/metadata';
import { isBlockchainActionMetadata } from './createMetadata';

/**
 * Error personalizado para validación de acciones
 */
export class ActionValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ActionValidationError';
    }
}

/**
 * Valida que un objeto sea una BlockchainActionMetadataV2 válida
 */
export function validateBlockchainActionMetadata(action: any): boolean {
    // Validar propiedades básicas
    if (!action || typeof action !== 'object') {
        throw new ActionValidationError('La acción debe ser un objeto válido');
    }

    if (typeof action.label !== 'string' || !action.label) {
        throw new ActionValidationError('La acción debe tener una etiqueta válida');
    }

    if (typeof action.description !== 'string' || !action.description) {
        throw new ActionValidationError('La acción debe tener una descripción válida');
    }

    // Validar dirección del contrato
    if (!action.address || typeof action.address !== 'string' || !action.address.startsWith('0x')) {
        throw new ActionValidationError(
            'La acción debe tener una dirección de contrato válida (formato 0x...)',
        );
    }

    if (!isAddress(action.address)) {
        throw new ActionValidationError(`Dirección inválida: ${action.address}`);
    }

    // Validar ABI
    if (!Array.isArray(action.abi) || action.abi.length === 0) {
        throw new ActionValidationError('La acción debe tener un ABI válido');
    }

    // Validar nombre de función
    if (typeof action.functionName !== 'string' || !action.functionName) {
        throw new ActionValidationError('La acción debe tener un nombre de función válido');
    }

    // Validar que la función exista en el ABI
    if (!isValidFunction(action.abi, action.functionName)) {
        throw new ActionValidationError(
            `La función "${action.functionName}" no existe en el ABI proporcionado`,
        );
    }

    // Validar chains
    if (!validateChainContext(action.chains)) {
        throw new ActionValidationError('La acción debe tener una configuración de chains válida');
    }

    // Validar amount si está presente
    if (action.amount !== undefined && (typeof action.amount !== 'number' || action.amount < 0)) {
        throw new ActionValidationError('Si se proporciona "amount", debe ser un número positivo');
    }

    // Validar parámetros si están presentes
    if (action.params !== undefined) {
        validateBlockchainParameters(action.params, getAbiParameters(action));
    }

    return true;
}

/**
 * Valida que el contexto de cadena sea válido
 */
function validateChainContext(chains: ChainContext): boolean {
    if (!chains || typeof chains !== 'object') {
        return false;
    }

    // Validar source chain
    if (!chains.source || !isValidChain(chains.source)) {
        return false;
    }

    // Validar destination chain si está presente
    if (chains.destination !== undefined && !isValidChain(chains.destination)) {
        return false;
    }

    return true;
}

/**
 * Valida que una cadena sea válida
 */
function isValidChain(chain: any): boolean {
    const validChains = ['fuji', 'avalanche', 'alfajores', 'celo', 'monad-testnet'];
    return typeof chain === 'string' && validChains.includes(chain);
}

/**
 * Valida que los parámetros blockchain sean válidos
 */
export function validateBlockchainParameters(
    params: BlockchainParameter[],
    abiParams: AbiParameter[],
): boolean {
    if (!Array.isArray(params)) {
        throw new ActionValidationError('Los parámetros deben ser un array');
    }

    // Validar que cada parámetro tenga un nombre que coincida con el ABI
    const abiParamNames = abiParams.map(p => p.name);

    for (const param of params) {
        // Validar propiedades básicas
        if (typeof param.name !== 'string' || !param.name) {
            throw new ActionValidationError('Cada parámetro debe tener un nombre válido');
        }

        if (typeof param.label !== 'string' || !param.label) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" debe tener una etiqueta válida`,
            );
        }

        // Verificar que el nombre del parámetro exista en el ABI
        if (!abiParamNames.includes(param.name)) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" no existe en el ABI de la función`,
            );
        }

        // Validar según el tipo de parámetro
        if (isStandardParameter(param)) {
            validateStandardParameter(param);
        } else if (isSelectParameter(param)) {
            validateSelectParameter(param);
        } else if (isRadioParameter(param)) {
            validateRadioParameter(param);
        } else {
            throw new ActionValidationError(`Tipo de parámetro desconocido para "${param}"`);
        }

        // Validar valor por defecto según el tipo del parámetro en el ABI
        if (param.value !== undefined) {
            const abiParam = abiParams.find(p => p.name === param.name);
            if (abiParam) {
                validateParameterValue(param.value, abiParam.type, param.name);
            }
        }
    }

    return true;
}

/**
 * Valida que un parámetro estándar sea válido
 */
function validateStandardParameter(param: StandardParameter): boolean {
    // Validar propiedades específicas del tipo
    if (
        param.minLength !== undefined &&
        (typeof param.minLength !== 'number' || param.minLength < 0)
    ) {
        throw new ActionValidationError(`El parámetro "${param.name}" tiene un minLength inválido`);
    }

    if (
        param.maxLength !== undefined &&
        (typeof param.maxLength !== 'number' || param.maxLength < 0)
    ) {
        throw new ActionValidationError(`El parámetro "${param.name}" tiene un maxLength inválido`);
    }

    if (param.min !== undefined && typeof param.min !== 'number') {
        throw new ActionValidationError(`El parámetro "${param.name}" tiene un min inválido`);
    }

    if (param.max !== undefined && typeof param.max !== 'number') {
        throw new ActionValidationError(`El parámetro "${param.name}" tiene un max inválido`);
    }

    if (param.min !== undefined && param.max !== undefined && param.min > param.max) {
        throw new ActionValidationError(`El parámetro "${param.name}" tiene min > max`);
    }

    if (param.pattern !== undefined && typeof param.pattern !== 'string') {
        throw new ActionValidationError(`El parámetro "${param.name}" tiene un pattern inválido`);
    }

    // Validar que el patrón sea una regex válida
    if (param.pattern) {
        try {
            new RegExp(param.pattern);
        } catch (e) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" tiene un pattern que no es una regex válida`,
            );
        }
    }

    return true;
}

/**
 * Valida que un parámetro de selección sea válido
 */
function validateSelectParameter(param: SelectParameter): boolean {
    if (!Array.isArray(param.options) || param.options.length === 0) {
        throw new ActionValidationError(`El parámetro "${param.name}" debe tener opciones válidas`);
    }

    // Validar cada opción
    for (const option of param.options) {
        if (typeof option.label !== 'string' || !option.label) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" tiene una opción con etiqueta inválida`,
            );
        }

        if (option.value === undefined) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" tiene una opción sin valor`,
            );
        }
    }

    // Validar que no haya opciones duplicadas
    const values = param.options.map(o => o.value);
    if (new Set(values).size !== values.length) {
        throw new ActionValidationError(
            `El parámetro "${param.name}" tiene opciones con valores duplicados`,
        );
    }

    return true;
}

/**
 * Valida que un parámetro de tipo radio sea válido
 * @param param El parámetro radio a validar
 * @returns true si el parámetro es válido
 * @throws ActionValidationError si el parámetro no es válido
 */
function validateRadioParameter(param: RadioParameter): boolean {
    // Verificar que existan opciones y sean un array
    if (!Array.isArray(param.options)) {
        throw new ActionValidationError(
            `El parámetro radio "${param.name}" debe tener un array de opciones`,
        );
    }

    // Verificar que haya al menos dos opciones (un radio button típicamente necesita múltiples opciones)
    if (param.options.length < 2) {
        throw new ActionValidationError(
            `El parámetro radio "${param.name}" debe tener al menos 2 opciones`,
        );
    }

    // Validar cada opción individualmente
    for (const option of param.options) {
        // Validar etiqueta
        if (typeof option.label !== 'string' || !option.label.trim()) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" tiene una opción con etiqueta vacía o inválida`,
            );
        }

        // Validar valor
        if (option.value === undefined || option.value === null) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" tiene una opción sin valor definido`,
            );
        }

        // Verificar que el tipo de valor sea compatible (string, number o boolean)
        if (
            typeof option.value !== 'string' &&
            typeof option.value !== 'number' &&
            typeof option.value !== 'boolean'
        ) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" tiene una opción con valor de tipo inválido. Debe ser string, number o boolean`,
            );
        }
    }

    // Validar que no haya opciones duplicadas (por valor)
    const values = param.options.map(o => o.value);
    if (new Set(values).size !== values.length) {
        throw new ActionValidationError(
            `El parámetro "${param.name}" tiene opciones con valores duplicados`,
        );
    }

    // Validar que no haya etiquetas duplicadas
    const labels = param.options.map(o => o.label);
    if (new Set(labels).size !== labels.length) {
        throw new ActionValidationError(
            `El parámetro "${param.name}" tiene opciones con etiquetas duplicadas`,
        );
    }

    // Validar que el valor por defecto (si existe) sea una de las opciones válidas
    if (param.value !== undefined) {
        const isValidValue = param.options.some(option => option.value === param.value);
        if (!isValidValue) {
            throw new ActionValidationError(
                `El valor por defecto "${param.value}" del parámetro "${param.name}" no está entre las opciones disponibles`,
            );
        }
    }

    return true;
}

/**
 * Valida que un valor sea compatible con un tipo de Solidity
 */
function validateParameterValue(value: any, type: string, paramName: string): boolean {
    // Valores null son válidos (para parámetros opcionales)
    if (value === null || value === undefined) {
        return true;
    }

    // Validar según el tipo de Solidity
    if (type.startsWith('uint') || type.startsWith('int')) {
        // Para tipos numéricos
        if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'bigint') {
            throw new ActionValidationError(
                `El valor para "${paramName}" debe ser un número (tipo ${type})`,
            );
        }

        // Si es string, debe ser un número
        if (typeof value === 'string' && !/^-?\d+$/.test(value)) {
            throw new ActionValidationError(
                `El valor para "${paramName}" debe ser un número válido (tipo ${type})`,
            );
        }
    } else if (type === 'address') {
        // Para direcciones Ethereum
        if (typeof value !== 'string') {
            throw new ActionValidationError(
                `El valor para "${paramName}" debe ser un string (tipo address)`,
            );
        }

        // Valores especiales permitidos
        if (value !== 'sender' && !isAddress(value)) {
            throw new ActionValidationError(
                `El valor para "${paramName}" debe ser una dirección válida o "sender"`,
            );
        }
    } else if (type === 'bool') {
        // Para booleanos
        if (typeof value !== 'boolean') {
            throw new ActionValidationError(
                `El valor para "${paramName}" debe ser un booleano (tipo bool)`,
            );
        }
    } else if (type === 'string') {
        // Para strings
        if (typeof value !== 'string') {
            throw new ActionValidationError(
                `El valor para "${paramName}" debe ser un string (tipo string)`,
            );
        }
    } else if (type.startsWith('bytes')) {
        // Para bytes
        if (typeof value !== 'string') {
            throw new ActionValidationError(
                `El valor para "${paramName}" debe ser un string (tipo ${type})`,
            );
        }

        // Si es bytes fijo, validar longitud
        if (type !== 'bytes' && type.startsWith('bytes')) {
            const size = parseInt(type.replace('bytes', ''));
            // Cada byte son 2 caracteres en hex
            if (value.startsWith('0x') && value.length !== 2 + size * 2) {
                throw new ActionValidationError(
                    `El valor para "${paramName}" tiene una longitud incorrecta para ${type}`,
                );
            }
        }
    }

    return true;
}

/**
 * Verifica si un objeto es un parámetro estándar
 */
export function isStandardParameter(param: any): param is StandardParameter {
    return (
        param &&
        typeof param === 'object' &&
        typeof param.type === 'string' &&
        ['text', 'number', 'boolean', 'email', 'url', 'datetime', 'textarea', 'address'].includes(
            param.type,
        )
    );
}

/**
 * Verifica si un objeto es un parámetro de selección
 */
export function isSelectParameter(param: any): param is SelectParameter {
    return (
        param &&
        typeof param === 'object' &&
        param.type === 'select' &&
        Array.isArray(param.options)
    );
}

/**
 * Verifica si un objeto es un parámetro de radio
 */
export function isRadioParameter(param: any): param is RadioParameter {
    return (
        param && typeof param === 'object' && param.type === 'radio' && Array.isArray(param.options)
    );
}

/**
 * Obtiene una función del ABI por su nombre
 */
export function getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction {
    const abiFunction = abi.find(
        (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
    );
    if (!abiFunction) {
        throw new ActionValidationError(`Función "${functionName}" no encontrada en el ABI`);
    }
    return abiFunction;
}

/**
 * Verifica si una función existe en el ABI
 */
export function isValidFunction(abi: Abi, functionName: ContractFunctionName): boolean {
    return abi.some(
        (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
    );
}

/**
 * Obtiene los parámetros de una función del ABI
 */
export function getAbiParameters(action: BlockchainActionMetadata): AbiParameter[] {
    const abiFunction = getAbiFunction(action.abi, action.functionName);
    // Crear una copia profunda de los parámetros del ABI
    return abiFunction.inputs.map(param => ({ ...param }));
}

/**
 * Obtiene el tipo de mutabilidad de una función del ABI
 */
export function getBlockchainActionType(action: BlockchainActionMetadata): AbiStateMutability {
    const abiFunction = getAbiFunction(action.abi, action.functionName);
    return abiFunction.stateMutability;
}

/**
 * Procesa una BlockchainActionMetadataV2 en una BlockchainActionV2 completa
 */
export function processBlockchainAction(action: BlockchainActionMetadata): BlockchainAction {
    // Validar primero
    validateBlockchainActionMetadata(action);

    // Obtener los parámetros del ABI
    const abiParams = getAbiParameters(action);

    // Obtener el tipo de acción blockchain
    const blockchainActionType = getBlockchainActionType(action);

    // Devolver la acción procesada
    return {
        ...action,
        abiParams,
        blockchainActionType,
    };
}

/**
 * Crea metadata validada a partir de un array de acciones
 */
export function createValidatedActions<T extends BlockchainActionMetadata>(
    actions: T[],
): (T | BlockchainAction)[] {
    return actions.map(action => {
        try {
            return processBlockchainAction(action);
        } catch (error) {
            console.error(`Error processing action "${action.label}":`, error);
            return action; // Devolver la acción original en caso de error
        }
    });
}

/**
 * Valida los metadatos básicos de una mini app
 */
export function validateBasicMetadata(metadata: Metadata): boolean {
    if (!metadata.url || typeof metadata.url !== 'string') {
        throw new ActionValidationError("Metadata debe tener un campo 'url' válido");
    }

    if (!metadata.icon || typeof metadata.icon !== 'string') {
        throw new ActionValidationError("Metadata debe tener un campo 'icon' válido");
    }

    if (!metadata.title || typeof metadata.title !== 'string') {
        throw new ActionValidationError("Metadata debe tener un campo 'title' válido");
    }

    if (!metadata.description || typeof metadata.description !== 'string') {
        throw new ActionValidationError("Metadata debe tener un campo 'description' válido");
    }

    if (!Array.isArray(metadata.actions)) {
        throw new ActionValidationError('Metadata debe tener un array de acciones');
    }

    if (metadata.actions.length === 0) {
        throw new ActionValidationError('Metadata debe incluir al menos una acción');
    }

    if (metadata.actions.length > 4) {
        throw new ActionValidationError(
            `Se permiten máximo 4 acciones, se recibieron ${metadata.actions.length}`,
        );
    }

    return true;
}

/**
 * Crea y valida un objeto MetadataV2 completo
 * Esta función centraliza la validación y creación de metadatos usando el validator
 *
 * @param metadata Los metadatos sin procesar
 * @returns Los metadatos procesados y validados
 * @throws ActionValidationError si hay algún error de validación
 */
export function createMetadataV2(metadata: Metadata): ValidatedMetadata {
    try {
        // Validar metadatos básicos
        validateBasicMetadata(metadata);

        // Procesar cada acción con la validación de esta clase
        const processedActions = metadata.actions.map(action => {
            if (isBlockchainActionMetadata(action)) {
                return processBlockchainAction(action);
            } /*else if(isHttpActionMetadata(action)){
                return action;
            }else if(isTransferActionMetadata(action)){ 

            }*/ else {
                throw new ActionValidationError(`Tipo de Action desconocido: ${action}`);
            }
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
        // Mejorar mensajes de error con contexto
        if (error instanceof ActionValidationError) {
            throw error;
        } else if (error instanceof Error) {
            throw new ActionValidationError(`Error al procesar metadata: ${error.message}`);
        } else {
            throw new Error('unknown error');
        }
    }
}
