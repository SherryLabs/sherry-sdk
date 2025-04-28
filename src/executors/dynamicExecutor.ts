import { DynamicAction } from '../interface/actions/dynamicAction';
import { ValidatedAction } from '../interface';
import { ActionValidationError } from '../utils';
import { ExecutionResponse } from '../interface/response/executionResponse';

export class DynamicActionExecutor {
    async resolve(
        action: DynamicAction,
        context?: Record<string, any>,
    ): Promise<ExecutionResponse> {
        if (action.type !== 'dynamic') {
            throw new ActionValidationError('Invalid action type for dynamic action');
        }

        const payload = action.params || {};

        try {
            const response = await fetch(action.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Http Error! status : ${response.status} ${response.statusText}`);
            }

            const resolvedData: unknown = await response.json(); // Get raw data first
            console.log(`[DynamicActionExecutor] Received resolved data for '${action.label}'`);

            if (this.isValidBlockchainResponse(resolvedData)) {
                return resolvedData as ExecutionResponse; // Cast to BlockchainResponse
            } else {
                throw new ActionValidationError('Invalid response structure from dynamic action');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(
                `[DynamicActionExecutor] Error resolving action '${action.label}': ${message}`,
            );
            throw new ActionValidationError(`Error resolving action '${action.label}': ${message}`);
        }
    }

    /**
     * Simple type guard to check if the received data matches BlockchainResponse structure.
     * TODO: We're gonna have to add more checks as needed for robustness.
     */
    private isValidBlockchainResponse(data: any): data is ExecutionResponse {
        return (
            data &&
            typeof data === 'object' &&
            typeof data.serializedTransaction === 'string' &&
            data.serializedTransaction.startsWith('0x') && // Basic check for hex string
            typeof data.chainId === 'string' && // Or number, depending on your standard
            (data.meta === undefined || (typeof data.meta === 'object' && data.meta !== null))
        );
    }
}
