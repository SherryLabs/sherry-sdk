import { DynamicAction } from '../interface/actions/dynamicAction';
import { ValidatedAction } from '../interface';
import { ActionValidationError } from '../utils';
import { ExecutionResponse } from '../interface/response/executionResponse';

export class DynamicActionExecutor {
    private baseUrl?: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl;
    }

    async execute(
        action: DynamicAction,
        inputs: Record<string, any>,
        context: Record<string, any>,
    ): Promise<ExecutionResponse> {
        try {
            if (action.type !== 'dynamic') {
                throw new ActionValidationError('Action type must be "dynamic"');
            }
            if (!action.path || typeof action.path !== 'string') {
                throw new ActionValidationError('Dynamic action must have a valid path');
            }

            if (!this.baseUrl && !action.path.startsWith('http')) {
                throw new ActionValidationError(
                    `Dynamic action '${action.label}' has a relative path '${action.path}' but no baseUrl is provided in metadata`,
                );
            }

            let fullUrl = this.getFullUrl(action);
            fullUrl = this.appendQueryParams(action, inputs, context, fullUrl);

            console.log(
                `[DynamicActionExecutor] Executing Action '${action.label}' with URL: ${fullUrl}`,
            );

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'x-sdk-version': '1.0.0',
                    'x-wallet-address': context.userAddress || '',
                    'x-chain-id': action.chains.source,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP Error! Status: ${response.status} ${response.statusText}. Details: ${errorText}`,
                );
            }

            const responseData = await response.json();

            if (this.isValidExecutionResponse(responseData)) {
                return responseData as ExecutionResponse;
            } else {
                const adaptedResponse = this.adaptToExecutionResponse(responseData);
                if (adaptedResponse) {
                    return adaptedResponse;
                }

                throw new ActionValidationError(
                    `Invalid response format from endpoint for action '${action.label}'. Expected ExecutionResponse format.`,
                );
            }
        } catch (error) {
            console.error(
                `[DynamicActionExecutor] Error executing action '${action.label}':`,
                error,
            );
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new ActionValidationError(`Error executing action '${action.label}': ${message}`);
        }
    }

    private getFullUrl(action: DynamicAction): string {
        if (!this.baseUrl) {
            throw new ActionValidationError('Base URL is not provided');
        }

        const baseWithSlash = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
        const pathWithoutSlash = action.path.startsWith('/') ? action.path.slice(1) : action.path;

        return `${baseWithSlash}${pathWithoutSlash}`;
    }

    private appendQueryParams(
        action: DynamicAction,
        inputs: Record<string, any>,
        context: Record<string, any>,
        url: string,
    ): string {
        //const queryParams = new URLSearchParams();
        const urlObj = new URL(url);

        if (action.params) {
            action.params.forEach(param => {
                if (param.fixed || param.value !== undefined) {
                    urlObj.searchParams.append(param.name, String(param.value));
                } else if (inputs[param.name] !== undefined) {
                    urlObj.searchParams.append(param.name, String(inputs[param.name]));
                }
            });
        }

        if (context.userAddress) {
            urlObj.searchParams.append('userAddress', context.userAddress);
        }

        if (action.chains) {
            urlObj.searchParams.append('chain', action.chains.source);

            if (action.chains.destination) {
                urlObj.searchParams.append('destinationChain', action.chains.destination);
            }
        }

        const queryString = urlObj.searchParams.toString();
        if (queryString) {
            return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
        }

        return url;
    }

    private isValidExecutionResponse(data: any): boolean {
        return (
            data &&
            typeof data === 'object' &&
            typeof data.serializedTransaction === 'string' &&
            data.serializedTransaction.startsWith('0x') &&
            typeof data.chain === 'string'
        );
    }

    private adaptToExecutionResponse(data: any): ExecutionResponse | null {
        if (data.transaction || data.tx || data.serializedTransaction) {
            const txData =
                data.transaction || data.transactionHash || data.tx || data.serializedTransaction;
            // Ensure it's a hex string
            const serializedTx = txData.startsWith('0x') ? txData : `0x${txData}`;
            const chainId = data.chain || data.chainId || data.network || data.blockchain;

            return {
                serializedTransaction: serializedTx,
                chainId: chainId,
                status: 'success',
                error: null,
            } as ExecutionResponse;
        }

        return null;
    }
}
