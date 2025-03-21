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
import { ActionValidationError } from '../errors/customErrors';

/**
 * Validator class for Blockchain Actions
 */
export class BlockchainActionValidator {
    /**
     * Validates a blockchain action and returns it if valid
     */
    static validateBlockchainAction(action: BlockchainActionMetadata): BlockchainAction {
        this.validateBlockchainActionMetadata(action);
        
        // Get the ABI parameters
        const abiParams = this.getAbiParameters(action);
        
        // Get the blockchain action type
        const blockchainActionType = this.getBlockchainActionType(action);

        if(blockchainActionType !== 'payable' && action.amount !== undefined ) { 
            throw new ActionValidationError('La acción no es payable, no se debe proporcionar "amount"');
        }
        
        // Return the processed action with additional info
        return {
            ...action,
            abiParams: [...abiParams], // Create a mutable copy of the readonly array
            blockchainActionType,
        };
    }
    
    /**
     * Validates that an object is a valid BlockchainActionMetadata
     */
    static validateBlockchainActionMetadata(action: any): boolean {
        // Validate basic properties
        if (!action || typeof action !== 'object') {
            throw new ActionValidationError('La acción debe ser un objeto válido');
        }

        if (typeof action.label !== 'string' || !action.label) {
            throw new ActionValidationError('La acción debe tener una etiqueta válida');
        }

        // Validate contract address
        if (!action.address || typeof action.address !== 'string' || !action.address.startsWith('0x')) {
            throw new ActionValidationError(
                'La acción debe tener una dirección de contrato válida (formato 0x...)',
            );
        }

        if (!isAddress(action.address)) {
            throw new ActionValidationError(`Dirección inválida: ${action.address}`);
        }

        // Validate ABI
        if (!Array.isArray(action.abi) || action.abi.length === 0) {
            throw new ActionValidationError('La acción debe tener un ABI válido');
        }

        // Validate function name
        if (typeof action.functionName !== 'string' || !action.functionName) {
            throw new ActionValidationError('La acción debe tener un nombre de función válido');
        }

        // Validate that the function exists in the ABI
        if (!this.isValidFunction(action.abi, action.functionName)) {
            throw new ActionValidationError(
                `La función "${action.functionName}" no existe en el ABI proporcionado`,
            );
        }

        // Validate chains
        if (!this.validateChainContext(action.chains)) {
            throw new ActionValidationError('La acción debe tener una configuración de chains válida');
        }

        // Validate amount if present
        if (action.amount !== undefined && (typeof action.amount !== 'number' || action.amount < 0)) {
            throw new ActionValidationError('Si se proporciona "amount", debe ser un número positivo');
        }

        // Validate parameters if present
        if (action.params !== undefined) {
            this.validateBlockchainParameters(action.params, this.getAbiParameters(action));
        }

        return true;
    }
    
    /**
     * Validates that the chain context is valid
     */
    static validateChainContext(chains: ChainContext): boolean {
        if (!chains || typeof chains !== 'object') {
            return false;
        }

        // Validate source chain
        if (!chains.source || !this.isValidChain(chains.source)) {
            return false;
        }

        // Validate destination chain if present
        if (chains.destination !== undefined && !this.isValidChain(chains.destination)) {
            return false;
        }

        return true;
    }
    
    /**
     * Validates that a chain is valid
     */
    static isValidChain(chain: any): boolean {
        const validChains = ['fuji', 'avalanche', 'alfajores', 'celo', 'monad-testnet', 'ethereum'];
        return typeof chain === 'string' && validChains.includes(chain);
    }
    
    /**
     * Validates that blockchain parameters are valid
     */
    static validateBlockchainParameters(
        params: BlockchainParameter[],
        abiParams: readonly AbiParameter[],
    ): boolean {
        if (!Array.isArray(params)) {
            throw new ActionValidationError('Los parámetros deben ser un array');
        }

        // Validate that each parameter has a name that matches the ABI
        const abiParamNames = abiParams.map(p => p.name);

        for (const param of params) {
            // Validate basic properties
            if (typeof param.name !== 'string' || !param.name) {
                throw new ActionValidationError('Cada parámetro debe tener un nombre válido');
            }

            if (typeof param.label !== 'string' || !param.label) {
                throw new ActionValidationError(
                    `El parámetro "${param.name}" debe tener una etiqueta válida`,
                );
            }

            // Verify that the parameter name exists in the ABI
            if (!abiParamNames.includes(param.name)) {
                throw new ActionValidationError(
                    `El parámetro "${param.name}" no existe en el ABI de la función`,
                );
            }

            // Validate according to parameter type
            if (this.isStandardParameter(param)) {
                this.validateStandardParameter(param);
            } else if (this.isSelectParameter(param)) {
                this.validateSelectParameter(param);
            } else if (this.isRadioParameter(param)) {
                this.validateRadioParameter(param);
            } else {
                throw new ActionValidationError(`Tipo de parámetro desconocido para "${param}"`);
            }

            // Validate default value according to the parameter type in the ABI
            if (param.value !== undefined) {
                const abiParam = abiParams.find(p => p.name === param.name);
                if (abiParam) {
                    this.validateParameterValue(param.value, abiParam.type, param.name);
                }
            }
        }

        return true;
    }
    
    /**
     * Validates that a standard parameter is valid
     */
    static validateStandardParameter(param: StandardParameter): boolean {
        // Validate type-specific properties
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

        // Validate that the pattern is a valid regex
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
     * Validates that a selection parameter is valid
     */
    static validateSelectParameter(param: SelectParameter): boolean {
        if (!Array.isArray(param.options) || param.options.length === 0) {
            throw new ActionValidationError(`El parámetro "${param.name}" debe tener opciones válidas`);
        }

        // Validate each option
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

        // Validate that there are no duplicate options
        const values = param.options.map(o => o.value);
        if (new Set(values).size !== values.length) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" tiene opciones con valores duplicados`,
            );
        }

        return true;
    }
    
    /**
     * Validates that a radio parameter is valid
     */
    static validateRadioParameter(param: RadioParameter): boolean {
        // Verify that options exist and are an array
        if (!Array.isArray(param.options)) {
            throw new ActionValidationError(
                `El parámetro radio "${param.name}" debe tener un array de opciones`,
            );
        }

        // Verify that there are at least two options (a radio button typically needs multiple options)
        if (param.options.length < 2) {
            throw new ActionValidationError(
                `El parámetro radio "${param.name}" debe tener al menos 2 opciones`,
            );
        }

        // Validate each option individually
        for (const option of param.options) {
            // Validate label
            if (typeof option.label !== 'string' || !option.label.trim()) {
                throw new ActionValidationError(
                    `El parámetro "${param.name}" tiene una opción con etiqueta vacía o inválida`,
                );
            }

            // Validate value
            if (option.value === undefined || option.value === null) {
                throw new ActionValidationError(
                    `El parámetro "${param.name}" tiene una opción sin valor definido`,
                );
            }

            // Verify that the value type is compatible (string, number, or boolean)
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

        // Validate that there are no duplicate options (by value)
        const values = param.options.map(o => o.value);
        if (new Set(values).size !== values.length) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" tiene opciones con valores duplicados`,
            );
        }

        // Validate that there are no duplicate labels
        const labels = param.options.map(o => o.label);
        if (new Set(labels).size !== labels.length) {
            throw new ActionValidationError(
                `El parámetro "${param.name}" tiene opciones con etiquetas duplicadas`,
            );
        }

        // Validate that the default value (if it exists) is one of the valid options
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
     * Validates that a value is compatible with a Solidity type
     */
    static validateParameterValue(value: any, type: string, paramName: string): boolean {
        // Null values are valid (for optional parameters)
        if (value === null || value === undefined) {
            return true;
        }

        // Validate according to Solidity type
        if (type.startsWith('uint') || type.startsWith('int')) {
            // For numeric types
            if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'bigint') {
                throw new ActionValidationError(
                    `El valor para "${paramName}" debe ser un número (tipo ${type})`,
                );
            }

            // If it's a string, it must be a number
            if (typeof value === 'string' && !/^-?\d+$/.test(value)) {
                throw new ActionValidationError(
                    `El valor para "${paramName}" debe ser un número válido (tipo ${type})`,
                );
            }
        } else if (type === 'address') {
            // For Ethereum addresses
            if (typeof value !== 'string') {
                throw new ActionValidationError(
                    `El valor para "${paramName}" debe ser un string (tipo address)`,
                );
            }

            // Special allowed values
            if (value !== 'sender' && !isAddress(value)) {
                throw new ActionValidationError(
                    `El valor para "${paramName}" debe ser una dirección válida o "sender"`,
                );
            }
        } else if (type === 'bool') {
            // For booleans
            if (typeof value !== 'boolean') {
                throw new ActionValidationError(
                    `El valor para "${paramName}" debe ser un booleano (tipo bool)`,
                );
            }
        } else if (type === 'string') {
            // For strings
            if (typeof value !== 'string') {
                throw new ActionValidationError(
                    `El valor para "${paramName}" debe ser un string (tipo string)`,
                );
            }
        } else if (type.startsWith('bytes')) {
            // For bytes
            if (typeof value !== 'string') {
                throw new ActionValidationError(
                    `El valor para "${paramName}" debe ser un string (tipo ${type})`,
                );
            }

            // If it's fixed bytes, validate length
            if (type !== 'bytes' && type.startsWith('bytes')) {
                const size = parseInt(type.replace('bytes', ''));
                // Each byte is 2 characters in hex
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
     * Checks if an object is a standard parameter
     */
    static isStandardParameter(param: any): param is StandardParameter {
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
     * Checks if an object is a selection parameter
     */
    static isSelectParameter(param: any): param is SelectParameter {
        return (
            param &&
            typeof param === 'object' &&
            param.type === 'select' &&
            Array.isArray(param.options)
        );
    }

    /**
     * Checks if an object is a radio parameter
     */
    static isRadioParameter(param: any): param is RadioParameter {
        return (
            param && typeof param === 'object' && param.type === 'radio' && Array.isArray(param.options)
        );
    }

    /**
     * Gets a function from the ABI by its name
     */
    static getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction {
        const abiFunction = abi.find(
            (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
        );
        if (!abiFunction) {
            throw new ActionValidationError(`Función "${functionName}" no encontrada en el ABI`);
        }
        return abiFunction;
    }

    /**
     * Checks if a function exists in the ABI
     */
    static isValidFunction(abi: Abi, functionName: ContractFunctionName): boolean {
        return abi.some(
            (item): item is AbiFunction => item.type === 'function' && item.name === functionName,
        );
    }
    
    /**
     * Gets the parameters of a function from the ABI
     */
    static getAbiParameters(action: BlockchainActionMetadata): readonly AbiParameter[] {
        const abiFunction = this.getAbiFunction(action.abi, action.functionName);
        return abiFunction.inputs;
    }
    
    /**
     * Gets the state mutability type of a function from the ABI
     */
    static getBlockchainActionType(action: BlockchainActionMetadata): AbiStateMutability {
        const abiFunction = this.getAbiFunction(action.abi, action.functionName);
        return abiFunction.stateMutability;
    }
    
    /**
     * Checks if an object is a valid BlockchainActionMetadata
     */
    static isBlockchainActionMetadata(obj: any): obj is BlockchainActionMetadata {
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
     * Checks if an object is a BlockchainAction
     */
    static isBlockchainAction(obj: any): obj is BlockchainAction {
        return (
            this.isBlockchainActionMetadata(obj) &&
            'blockchainActionType' in obj &&
            Array.isArray((obj as any).abiParams)
        );
    }
}
