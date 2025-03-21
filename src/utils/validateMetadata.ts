import { Metadata } from '../interface/metadata';
import { BlockchainAction } from '../interface/blockchainAction';

/**
 * Resultado de la validación de metadata
 */
export interface MetadataValidationResult {
  isValid: boolean;
  type: 'Metadata' | 'ValidatedMetadata' | 'Error';
  data?: Metadata;
  errors: string[];
  error?: string;
}

/**
 * Valida si un objeto cumple con la estructura requerida para Metadata
 * @param metadata - Objeto a validar
 * @returns Resultado de la validación con indicador de validez y errores encontrados
 */
export function validateMetadata(metadata: any): MetadataValidationResult {
  const errors: string[] = [];
  
  // Validar campos obligatorios básicos
  if (!metadata) {
    return { 
      isValid: false, 
      type: 'Error', 
      errors: ['Metadata is undefined or null'],
      error: 'Metadata is undefined or null'
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
        if (!action.chains.destination) errors.push(`Action ${index}: Destination chain is required`);
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
      (action: any) => action.blockchainActionType
    );
    type = allActionsHaveBlockchainActionType ? 'ValidatedMetadata' : 'Metadata';
  }
  
  return {
    isValid,
    type,
    data: isValid ? metadata : undefined,
    errors,
    error: errors.length > 0 ? errors.join('; ') : undefined
  };
}
