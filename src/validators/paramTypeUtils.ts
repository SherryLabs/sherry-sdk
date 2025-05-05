import { AbiType } from 'abitype';
import { StandardParameter, SelectParameter, RadioParameter, Parameter } from '../interface/inputs';

/**
 * Determines if a parameter is a StandardParameter based on its structure and type.
 */
export function isStandardParameter(param: Parameter): param is StandardParameter {
    if (!param || typeof param !== 'object') return false;

    // Un parámetro es estándar si:
    // 1. No es ni select ni radio explícitamente
    // 2. Tiene nombre y etiqueta
    return (
        'name' in param &&
        typeof param.name === 'string' &&
        'label' in param &&
        typeof param.label === 'string' &&
        param.type !== 'select' &&
        param.type !== 'radio'
    );
}

/**
 * Determines if a parameter is a SelectParameter based on its structure and type.
 */
export function isSelectParameter(param: Parameter): param is SelectParameter {
    if (!param || typeof param !== 'object') return false;

    return (
        'name' in param &&
        typeof param.name === 'string' &&
        'label' in param &&
        typeof param.label === 'string' &&
        param.type === 'select' &&
        'options' in param &&
        Array.isArray((param as any).options)
    );
}

/**
 * Determines if a parameter is a RadioParameter based on its structure and type.
 */
export function isRadioParameter(param: Parameter): param is RadioParameter {
    if (!param || typeof param !== 'object') return false;

    return (
        'name' in param &&
        typeof param.name === 'string' &&
        'label' in param &&
        typeof param.label === 'string' &&
        param.type === 'radio' &&
        'options' in param &&
        Array.isArray((param as any).options)
    );
}

/**
 * Maps ABI types to appropriate UI input types.
 * This is used when a user doesn't specify a type directly.
 */
export function getInputTypeFromAbiType(abiType: AbiType): string {
    if (abiType === 'address') return 'address';
    if (abiType === 'bool') return 'bool';
    if (abiType === 'string') return 'text';
    if (abiType.startsWith('uint') || abiType.startsWith('int')) return 'number';
    if (abiType.startsWith('bytes')) return 'text'; // bytes as hex strings
    if (abiType.endsWith('[]')) return 'text'; // arrays as JSON strings
    return 'text'; // Default fallback to 'text'
}
