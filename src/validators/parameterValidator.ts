import {
    BlockchainParameter,
    StandardParameter,
    SelectParameter,
    RadioParameter,
} from '../interface/blockchainAction';
import { SherryValidationError } from '../errors/customErrors';
import { isAddress } from 'viem';

/**
 * Validator for blockchain parameters
 */
export class ParameterValidator {
    /**
     * Valida los parámetros base.
     */
    static validateBaseParameter(param: BlockchainParameter): void {
        // Verificar campos requeridos
        if (!param.name) {
            throw new SherryValidationError(`Parameter missing required 'name' field`);
        }

        if (!param.label) {
            throw new SherryValidationError(
                `Parameter '${param.name}' missing required 'label' field`,
            );
        }

        // Verificar tipo
        if (!param.type) {
            throw new SherryValidationError(`Parameter '${param}' missing required 'type' field`);
        }
    }

    /**
     * Valida parámetros de selección (select, radio).
     */
    static validateSelectionParameter(param: SelectParameter | RadioParameter): void {
        this.validateBaseParameter(param);

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
    static validateStandardParameter(param: StandardParameter): void {
        // Validate tuple parameters separately
        if (param.type === 'tuple') {
            return; // Tuples are handled differently, allow them to pass validation
        }

        this.validateBaseParameter(param);

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
        if (
            param.type === 'email' &&
            param.value !== undefined &&
            typeof param.value === 'string'
        ) {
            const emailRegex = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,4}$/;
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

        if (
            param.type === 'address' &&
            param.value !== undefined &&
            typeof param.value === 'string'
        ) {
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
    static validateParameter(param: BlockchainParameter): void {
        if (param.type === 'select' || param.type === 'radio') {
            this.validateSelectionParameter(param as SelectParameter | RadioParameter);
        } else {
            this.validateStandardParameter(param as StandardParameter);
        }
    }
}

// Export standalone functions for backward compatibility
export function validateParameter(param: BlockchainParameter): void {
    return ParameterValidator.validateParameter(param);
}
