// src/interface/nestedAction.ts

import { BlockchainActionMetadata } from './blockchainAction';
import { TransferAction } from './transferAction';
import { HttpAction } from './httpAction';
import { ChainContext } from './chains';

/**
 * Condición para evaluación de caminos en flujos de acciones.
 * Permite bifurcaciones basadas en resultados de acciones previas.
 */
export interface ActionCondition {
    field: string; // Campo en el contexto a evaluar (ej: "lastResult.status")
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'; // Operador de comparación
    value: string | number | boolean; // Valor a comparar
}

/**
 * Definición de una acción siguiente con condiciones opcionales.
 */
export interface NextActionDefinition {
    actionId: string; // ID de la acción siguiente
    conditions?: ActionCondition[]; // Condiciones opcionales (todas deben cumplirse)
}

/**
 * Base para todas las acciones anidadas.
 * Proporciona identificación única y capacidad de encadenamiento.
 */
export interface NestedActionBase {
    id: string; // Identificador único para la acción
    label: string; // Etiqueta para mostrar
    nextActions?: NextActionDefinition[]; // Posibles acciones siguientes
}

/**
 * Blockchain Action con capacidad de anidación
 */
export interface NestedBlockchainAction
    extends Omit<BlockchainActionMetadata, 'label'>,
        NestedActionBase {
    type: 'blockchain';
}

/**
 * Transfer Action con capacidad de anidación
 */
export interface NestedTransferAction extends Omit<TransferAction, 'label'>, NestedActionBase {
    type: 'transfer';
}

/**
 * HTTP Action con capacidad de anidación
 */
export interface NestedHttpAction extends Omit<HttpAction, 'label'>, NestedActionBase {
    type: 'http';
}

/**
 * Acción de finalización (pantalla final de un flujo)
 */
export interface CompletionAction extends NestedActionBase {
    type: 'completion';
    message: string; // Mensaje de finalización
    status: 'success' | 'error' | 'info'; // Estado de la finalización
}

/**
 * Acción de decisión (el usuario elige un camino)
 */
export interface DecisionAction extends NestedActionBase {
    type: 'decision';
    title: string; // Título de la decisión
    description?: string; // Descripción opcional
    options: {
        // Opciones a mostrar al usuario
        label: string; // Etiqueta de la opción
        value: string; // Valor de la opción
        nextActionId: string; // ID de la siguiente acción
    }[];
}

/**
 * Tipo unión para cualquier tipo de acción anidada
 */
export type NestedAction =
    | NestedBlockchainAction
    | NestedTransferAction
    | NestedHttpAction
    | CompletionAction
    | DecisionAction;

/**
 * Interfaz para un flujo completo de acciones anidadas.
 * Implementa un grafo dirigido de acciones que pueden ejecutarse secuencialmente
 * con bifurcaciones condicionales.
 */
export interface ActionFlow {
    type: 'flow'; // Tipo para identificarlo como un flujo
    label: string; // Etiqueta para mostrar (compatible con otras acciones)
    initialActionId: string; // ID de la acción inicial
    actions: NestedAction[]; // Todas las acciones del flujo
}

// isActionFlow function has been moved to flowValidator.ts
// Import it from there if needed in this file
