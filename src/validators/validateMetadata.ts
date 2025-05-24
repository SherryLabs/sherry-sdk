import { Metadata } from '../interface/metadata';

/**
 * Result of metadata validation process.
 * 
 * Provides comprehensive information about the validation outcome,
 * including whether the metadata is valid, what type it represents,
 * the validated data, and any errors encountered during validation.
 * 
 * @interface MetadataValidationResult
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Successful validation
 * const result: MetadataValidationResult = {
 *   isValid: true,
 *   type: 'Metadata',
 *   data: validatedMetadataObject,
 *   errors: []
 * };
 * 
 * // Failed validation
 * const result: MetadataValidationResult = {
 *   isValid: false,
 *   type: 'Error',
 *   errors: ['URL is required', 'Title is required'],
 *   error: 'URL is required; Title is required'
 * };
 * ```
 */
export interface MetadataValidationResult {
    /**
     * Indicates whether the metadata passed all validation checks.
     * 
     * @type {boolean}
     * @required
     * 
     * @example
     * ```typescript
     * isValid: true  // All validations passed
     * isValid: false // One or more validations failed
     * ```
     */
    isValid: boolean;

    /**
     * Type classification of the validated metadata.
     * 
     * Determines what kind of metadata object this represents:
     * - 'Metadata': Raw metadata that needs processing
     * - 'ValidatedMetadata': Metadata with processed actions (has blockchainActionType)
     * - 'Error': Validation failed, object is invalid
     * 
     * @type {'Metadata' | 'ValidatedMetadata' | 'Error'}
     * @required
     * 
     * @example
     * ```typescript
     * type: 'Metadata'          // Raw metadata
     * type: 'ValidatedMetadata' // All actions have blockchainActionType
     * type: 'Error'             // Validation failed
     * ```
     */
    type: 'Metadata' | 'ValidatedMetadata' | 'Error';

    /**
     * The validated metadata object if validation succeeded.
     * 
     * Only present when isValid is true. Contains the metadata object
     * that passed all validation checks.
     * 
     * @type {Metadata}
     * @optional
     * 
     * @example
     * ```typescript
     * data: {
     *   url: 'https://example.com',
     *   title: 'My App',
     *   icon: 'https://example.com/icon.png',
     *   description: 'App description',
     *   actions: [...]
     * }
     * ```
     */
    data?: Metadata;

    /**
     * Array of validation error messages.
     * 
     * Contains detailed error messages for each validation failure.
     * Empty array when validation succeeds.
     * 
     * @type {string[]}
     * @required
     * 
     * @example
     * ```typescript
     * errors: [
     *   'URL is required',
     *   'Action 0: Address is required',
     *   'Action 1: ABI must be an array'
     * ]
     * ```
     */
    errors: string[];

    /**
     * Concatenated error message for convenience.
     * 
     * Contains all error messages joined with semicolons.
     * Only present when there are validation errors.
     * 
     * @type {string}
     * @optional
     * 
     * @example
     * ```typescript
     * error: 'URL is required; Action 0: Address is required'
     * ```
     */
    error?: string;
}

/**
 * Validates if an object complies with the required structure for Metadata.
 * 
 * Performs comprehensive validation of metadata objects including:
 * - Required field presence validation
 * - Action structure validation
 * - ABI format validation
 * - Chain configuration validation
 * - Type classification (Metadata vs ValidatedMetadata)
 * 
 * @param {any} metadata - Object to validate
 * @returns {MetadataValidationResult} Validation result with validity indicator and errors found
 * 
 * @example
 * ```typescript
 * const metadata = {
 *   url: 'https://example.com',
 *   title: 'My App',
 *   icon: 'https://example.com/icon.png',
 *   description: 'Description',
 *   actions: [...]
 * };
 * 
 * const result = validateMetadata(metadata);
 * if (result.isValid) {
 *   console.log(`Valid ${result.type}:`, result.data);
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 * 
 * @throws {never} This function never throws, always returns a result object
 * 
 * @since 1.0.0
 * @version 1.0.0
 */
export function validateMetadata(metadata: any): MetadataValidationResult {
    const errors: string[] = [];

    // Validar campos obligatorios básicos
    if (!metadata) {
        return {
            isValid: false,
            type: 'Error',
            errors: ['Metadata is undefined or null'],
            error: 'Metadata is undefined or null',
        };
    }

    // Validar campos de primer nivel
    if (!metadata.url) errors.push('URL is required');
    if (!metadata.title) errors.push('Title is required');
    if (!metadata.icon) errors.push('Icon is required');
    if (!metadata.description) errors.push('Description is required');

    // Validar acciones
    if (!metadata.actions || !Array.isArray(metadata.actions) || metadata.actions.length === 0) {
        errors.push('At least one action is required');
    } else {
        // Validar cada acción
        metadata.actions.forEach((action: any, index: number) => {
            // Validar campos obligatorios de las acciones
            if (!action.label) errors.push(`Action ${index}: Label is required`);
            if (!action.address) errors.push(`Action ${index}: Address is required`);

            // Validar ABI si existe
            if (action.abi) {
                if (!Array.isArray(action.abi)) {
                    errors.push(`Action ${index}: ABI must be an array`);
                } else if (action.abi.length === 0) {
                    errors.push(`Action ${index}: ABI array cannot be empty`);
                }
            } else {
                errors.push(`Action ${index}: ABI is required`);
            }

            // Validar nombre de función si existe
            if (!action.functionName) {
                errors.push(`Action ${index}: Function name is required`);
            }

            // Validar chains
            if (action.chains) {
                if (!action.chains.source) errors.push(`Action ${index}: Source chain is required`);
            }
        });
    }

    const isValid = errors.length === 0;

    // Determinar el tipo basado en la validación
    let type: 'Metadata' | 'ValidatedMetadata' | 'Error';
    if (!isValid) {
        type = 'Error';
    } else {
        // Determinar si es Metadata normal o ValidatedMetadata
        // Se considera ValidatedMetadata si todas las acciones tienen blockchainActionType
        const allActionsHaveBlockchainActionType = metadata.actions?.every(
            (action: any) => action.blockchainActionType,
        );
        type = allActionsHaveBlockchainActionType ? 'ValidatedMetadata' : 'Metadata';
    }

    return {
        isValid,
        type,
        data: isValid ? metadata : undefined,
        errors,
        error: errors.length > 0 ? errors.join('; ') : undefined,
    };
}
