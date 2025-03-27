// src/utils/flowExecutor.ts

import {
    ActionFlow,
    NestedAction,
    NextActionDefinition,
    ActionCondition,
    CompletionAction,
} from '../interface/nestedAction';

/**
 * Contexto de ejecución para un flujo.
 * Almacena el estado, variables y resultados entre acciones.
 */
export interface ActionContext {
    [key: string]: any; // Almacena variables y resultados entre acciones
}

/**
 * Resultado de la ejecución de una acción.
 */
export interface ActionResult {
    actionId: string; // ID de la acción ejecutada
    status: 'success' | 'error' | 'waiting' | 'skipped'; // Estado de la ejecución
    data?: any; // Datos retornados por la acción
    error?: string; // Mensaje de error si status es 'error'
    nextActionId?: string; // ID de la siguiente acción a ejecutar
}

/**
 * Clase para ejecutar flujos de acciones anidadas.
 * Maneja la navegación, ejecución condicional y mantenimiento del contexto.
 */
export class FlowExecutor {
    private context: ActionContext;
    private flow: ActionFlow;
    private currentActionId: string | null;
    private history: ActionResult[];
    private completed: boolean;

    /**
     * Crea un nuevo ejecutor de flujo.
     * @param flow Flujo a ejecutar
     * @param initialContext Contexto inicial opcional
     */
    constructor(flow: ActionFlow, initialContext: ActionContext = {}) {
        this.flow = flow;
        this.context = { ...initialContext };
        this.currentActionId = flow.initialActionId;
        this.history = [];
        this.completed = false;
    }

    /**
     * Obtiene la acción actual en ejecución.
     * @returns La acción actual o null si el flujo ha terminado
     */
    getCurrentAction(): NestedAction | null {
        if (!this.currentActionId) return null;
        return this.flow.actions.find(a => a.id === this.currentActionId) || null;
    }

    /**
     * Obtiene el contexto actual de ejecución.
     * @returns Copia del contexto actual
     */
    getContext(): ActionContext {
        return { ...this.context };
    }

    /**
     * Verifica si el flujo ha sido completado.
     * @returns true si el flujo ha terminado, false en caso contrario
     */
    isCompleted(): boolean {
        return this.completed;
    }

    /**
     * Obtiene el historial de ejecución del flujo.
     * @returns Array de resultados de acciones ejecutadas
     */
    getHistory(): ActionResult[] {
        return [...this.history];
    }

    /**
     * Ejecuta la acción actual y avanza a la siguiente.
     * @param actionData Datos proporcionados para la acción actual
     * @returns Resultado de la ejecución
     */
    async executeCurrentAction(actionData?: any): Promise<ActionResult> {
        if (!this.currentActionId || this.completed) {
            return {
                actionId: 'none',
                status: 'error',
                error: 'No current action or flow already completed',
            };
        }

        const currentAction = this.getCurrentAction();
        if (!currentAction) {
            return {
                actionId: this.currentActionId,
                status: 'error',
                error: `Action '${this.currentActionId}' not found`,
            };
        }

        try {
            // Actualizar el contexto con los datos proporcionados
            if (actionData) {
                this.context = {
                    ...this.context,
                    ...actionData,
                };
            }

            // Ejecutar la acción según su tipo
            let result: ActionResult;

            switch (currentAction.type) {
                case 'blockchain':
                    result = await this.executeBlockchainAction(currentAction, actionData);
                    break;
                case 'transfer':
                    result = await this.executeTransferAction(currentAction, actionData);
                    break;
                case 'http':
                    result = await this.executeHttpAction(currentAction, actionData);
                    break;
                case 'decision':
                    result = this.executeDecisionAction(currentAction, actionData);
                    break;
                case 'completion':
                    result = this.executeCompletionAction(currentAction as CompletionAction);
                    break;
                default:
                    result = {
                        actionId: (currentAction as NestedAction).id,
                        status: 'error',
                        error: `Unknown action type: ${(currentAction as any).type}`,
                    };
            }

            // Actualizar el contexto con el resultado
            this.context.lastResult = result;
            this.context.lastActionId = currentAction.id;

            // Añadir al historial
            this.history.push(result);

            // Determinar la siguiente acción (si hay)
            if (result.status === 'success' && currentAction.type !== 'completion') {
                const nextActionId = this.determineNextAction(currentAction);
                if (nextActionId) {
                    this.currentActionId = nextActionId;
                    result.nextActionId = nextActionId;
                } else {
                    this.completed = true;
                }
            } else if (currentAction.type === 'completion') {
                this.completed = true;
            }

            return result;
        } catch (error) {
            const errorResult: ActionResult = {
                actionId: currentAction.id,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
            };

            // Actualizar el contexto con el error
            this.context.lastResult = errorResult;
            this.context.lastActionId = currentAction.id;
            this.context.lastError = errorResult.error;

            // Añadir al historial
            this.history.push(errorResult);

            return errorResult;
        }
    }

    /**
     * Determina la siguiente acción basada en las condiciones y el contexto.
     * @param action Acción actual
     * @returns ID de la siguiente acción o null si no hay
     */
    private determineNextAction(action: NestedAction): string | null {
        // Si es una acción de decisión, necesitamos la decisión del usuario
        if (action.type === 'decision') {
            // La decisión del usuario debe proporcionarse en executeCurrentAction
            const userChoice = this.context.userChoice;

            if (!userChoice) {
                return null; // Esperando decisión del usuario
            }

            const selectedOption = action.options.find(opt => opt.value === userChoice);
            if (selectedOption) {
                return selectedOption.nextActionId;
            }
            return null;
        }

        // Para otros tipos de acciones, evaluamos las condiciones de nextActions
        if (!action.nextActions || action.nextActions.length === 0) {
            return null;
        }

        // Buscar la primera acción siguiente que cumpla todas sus condiciones
        for (const nextAction of action.nextActions) {
            if (!nextAction.conditions || this.evaluateConditions(nextAction.conditions)) {
                return nextAction.actionId;
            }
        }

        // Si ninguna acción cumple las condiciones, tomar la primera sin condiciones
        const defaultNext = action.nextActions.find(next => !next.conditions);
        if (defaultNext) {
            return defaultNext.actionId;
        }

        return null;
    }

    /**
     * Evalúa un conjunto de condiciones contra el contexto actual.
     * @param conditions Condiciones a evaluar
     * @returns true si todas las condiciones se cumplen, false en caso contrario
     */
    private evaluateConditions(conditions: ActionCondition[]): boolean {
        return conditions.every(condition => this.evaluateCondition(condition));
    }

    /**
     * Evalúa una condición individual contra el contexto actual.
     * @param condition Condición a evaluar
     * @returns true si la condición se cumple, false en caso contrario
     */
    private evaluateCondition(condition: ActionCondition): boolean {
        const fieldValue = this.getFieldValue(condition.field);
        const conditionValue = condition.value;

        switch (condition.operator) {
            case 'eq':
                return fieldValue === conditionValue;
            case 'ne':
                return fieldValue !== conditionValue;
            case 'gt':
                return fieldValue > conditionValue;
            case 'lt':
                return fieldValue < conditionValue;
            case 'gte':
                return fieldValue >= conditionValue;
            case 'lte':
                return fieldValue <= conditionValue;
            case 'contains':
                if (typeof fieldValue === 'string' && typeof conditionValue === 'string') {
                    return fieldValue.includes(conditionValue);
                }
                if (Array.isArray(fieldValue)) {
                    return fieldValue.includes(conditionValue);
                }
                return false;
            default:
                return false;
        }
    }

    /**
     * Obtiene el valor de un campo del contexto.
     * @param field Campo a obtener (puede ser anidado con notación de punto)
     * @returns Valor del campo o undefined si no existe
     */
    private getFieldValue(field: string): any {
        // Si el campo tiene formato de path (ej: "result.status"), acceder a la propiedad anidada
        const parts = field.split('.');
        let value: any = this.context;

        for (const part of parts) {
            if (value === undefined || value === null) {
                return undefined;
            }
            value = value[part];
        }

        return value;
    }

    /**
     * Reemplaza placeholders en valores con datos del contexto.
     * @param value Valor que puede contener placeholders
     * @returns Valor con placeholders reemplazados
     */
    private replaceContextValues(value: any): any {
        if (typeof value !== 'string') {
            return value;
        }

        // Reemplazar placeholders con formato {{variable}}
        return value.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const contextValue = this.getFieldValue(key);
            return contextValue !== undefined ? contextValue : match;
        });
    }

    /**
     * Ejecuta una acción de tipo blockchain.
     * @param action Acción blockchain a ejecutar
     * @param actionData Datos adicionales proporcionados
     * @returns Resultado de la ejecución
     */
    private async executeBlockchainAction(
        action: NestedAction,
        actionData?: any,
    ): Promise<ActionResult> {
        if (action.type !== 'blockchain') {
            return {
                actionId: action.id,
                status: 'error',
                error: 'Invalid action type',
            };
        }

        // Procesar parámetros reemplazando placeholders
        // Using params instead of paramsValue since it was removed
        const processedParams = action.params
            ? action.params.map(param => this.replaceContextValues(param))
            : actionData?.params
              ? actionData.params
              : [];

        // En una implementación real, aquí realizarías la llamada a la blockchain
        // Por ahora, simular una respuesta exitosa
        console.log(
            `[Blockchain] Executing ${action.functionName} on ${action.address} with params:`,
            processedParams,
        );

        // Simulación de llamada a la blockchain
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            actionId: action.id,
            status: 'success',
            data: {
                txHash: '0x' + Math.random().toString(16).substring(2, 10),
                params: processedParams,
            },
        };
    }

    /**
     * Ejecuta una acción de tipo transferencia.
     * @param action Acción de transferencia a ejecutar
     * @param actionData Datos adicionales proporcionados
     * @returns Resultado de la ejecución
     */
    private async executeTransferAction(
        action: NestedAction,
        actionData?: any,
    ): Promise<ActionResult> {
        if (action.type !== 'transfer') {
            return {
                actionId: action.id,
                status: 'error',
                error: 'Invalid action type',
            };
        }

        // Procesar dirección reemplazando placeholders
        const to = action.to ? this.replaceContextValues(action.to) : undefined;

        // En una implementación real, aquí realizarías la transferencia
        console.log(
            `[Transfer] Sending ${action.amount} to ${to} on chain ${action.chains.source}`,
        );

        // Simulación de transferencia
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            actionId: action.id,
            status: 'success',
            data: {
                txHash: '0x' + Math.random().toString(16).substring(2, 10),
                to: to,
                amount: action.amount,
            },
        };
    }

    /**
     * Ejecuta una acción de tipo HTTP.
     * @param action Acción HTTP a ejecutar
     * @param actionData Datos proporcionados (típicamente datos de formulario)
     * @returns Resultado de la ejecución
     */
    private async executeHttpAction(action: NestedAction, actionData?: any): Promise<ActionResult> {
        if (action.type !== 'http') {
            return {
                actionId: action.id,
                status: 'error',
                error: 'Invalid action type',
            };
        }

        // En una implementación real, aquí realizarías la petición HTTP con los datos del formulario
        console.log(`[HTTP] Calling ${action.endpoint} with data:`, actionData);

        // Simulación de petición HTTP
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            actionId: action.id,
            status: 'success',
            data: {
                ...actionData,
                responseId: Math.floor(Math.random() * 1000),
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * Ejecuta una acción de tipo decisión.
     * @param action Acción de decisión
     * @param actionData Datos con la elección del usuario
     * @returns Resultado de la ejecución
     */
    private executeDecisionAction(action: NestedAction, actionData?: any): ActionResult {
        if (action.type !== 'decision') {
            return {
                actionId: action.id,
                status: 'error',
                error: 'Invalid action type',
            };
        }

        // Si no hay elección del usuario, devolver waiting
        if (!actionData || !actionData.userChoice) {
            return {
                actionId: action.id,
                status: 'waiting',
                data: {
                    options: action.options.map(opt => ({
                        label: opt.label,
                        value: opt.value,
                    })),
                },
            };
        }

        // Validar que la elección sea válida
        const userChoice = actionData.userChoice;
        const selectedOption = action.options.find(opt => opt.value === userChoice);

        if (!selectedOption) {
            return {
                actionId: action.id,
                status: 'error',
                error: `Invalid choice: ${userChoice}`,
            };
        }

        // Actualizar el contexto con la elección
        this.context.userChoice = userChoice;

        return {
            actionId: action.id,
            status: 'success',
            data: {
                choice: userChoice,
                selectedOption: selectedOption.label,
            },
            nextActionId: selectedOption.nextActionId,
        };
    }

    /**
     * Ejecuta una acción de tipo finalización.
     * @param action Acción de finalización
     * @returns Resultado de la ejecución
     */
    private executeCompletionAction(action: CompletionAction): ActionResult {
        return {
            actionId: action.id,
            status: 'success',
            data: {
                message: action.message,
                status: action.status,
            },
        };
    }
}
