import { DynamicAction } from '../interface/actions/dynamicAction';
import { ValidatedAction } from '../interface';
import { ActionValidationError } from '../utils';
import { ExecutionResponse } from '../interface/response/executionResponse';
import { StandardParameter, Parameter } from '../interface/inputs';

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
            action.params.forEach((param: Parameter) => {
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
        // Verificar si podemos adaptar los datos
        if (data.transaction || data.tx || data.serializedTransaction) {
            // Extraer la transacción serializada
            const txData =
                data.transaction || data.transactionHash || data.tx || data.serializedTransaction;
            // Ensure it's a hex string
            const serializedTx = txData.startsWith('0x') ? txData : `0x${txData}`;

            // Extraer el ID de cadena
            const chainId = data.chain || data.chainId || data.network || data.blockchain;

            // Crear la respuesta adaptada con todos los campos requeridos
            const response: ExecutionResponse = {
                // Campos básicos obligatorios
                serializedTransaction: serializedTx,
                chainId: chainId,

                // Meta obligatorio (con valores predeterminados si no existen)
                meta: {
                    title: data.title || data.meta?.title || `Transaction on ${chainId}`,
                },
                abi: data.abi || data.abi || [], // ABI opcional
                // rawTransaction obligatorio (con al menos 'to')
                rawTransaction: {
                    to: data.to || data.rawTransaction?.to || data.receiver || '0x',
                    value: data.value || data.rawTransaction?.value || data.amount || '0x0',
                    data: data.data || data.rawTransaction?.data || data.calldata || '0x',
                },
            };

            // Campos opcionales
            if (data.decoded || data.functionName || (data.params && Array.isArray(data.params))) {
                response.decoded = {
                    functionName: data.functionName || data.decoded?.functionName || 'unknown',
                    params: data.params || data.decoded?.params || [],
                };
            }

            return response;
        }

        return null;
    }
}
