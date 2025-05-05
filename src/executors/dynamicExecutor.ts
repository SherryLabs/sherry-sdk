import { DynamicAction } from '../interface/actions/dynamicAction';
import { ActionValidationError } from '../errors/customErrors';
import { ExecutionResponse } from '../interface/response/executionResponse';
import { Parameter } from '../interface/inputs';

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
            // Validaciones iniciales
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

            // Construir la URL
            let fullUrl = action.path.startsWith('http') ? action.path : this.getFullUrl(action);
            fullUrl = this.appendQueryParams(action, inputs, context, fullUrl);

            // Ejecutar la petición
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'x-sdk-version': '1.0.0',
                    'x-wallet-address': context.userAddress || '',
                    'x-chain-id': action.chains.source,
                },
            });

            // Manejar errores HTTP
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP Error! Status: ${response.status} ${response.statusText}. Details: ${errorText}`,
                );
            }

            // Parsear la respuesta JSON
            let responseData;
            try {
                responseData = await response.json();
            } catch (error) {
                throw new Error(
                    `Invalid JSON response: ${error instanceof Error ? error.message : String(error)}`,
                );
            }

            // Validar y adaptar la respuesta
            if (this.isValidExecutionResponse(responseData)) {
                return responseData as ExecutionResponse;
            }

            const adaptedResponse = this.adaptToExecutionResponse(responseData);
            if (adaptedResponse) {
                return adaptedResponse;
            }

            throw new Error(
                `Invalid response format from endpoint for action '${action.label}'. Expected ExecutionResponse format.`,
            );
        } catch (error) {
            // Convertir cualquier error en ActionValidationError
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
        return urlObj.toString();
    }

    private isValidExecutionResponse(data: any): boolean {
        return (
            data &&
            typeof data === 'object' &&
            typeof data.serializedTransaction === 'string' &&
            data.serializedTransaction.startsWith('0x') &&
            typeof data.chainId === 'string' &&
            data.chainId.length > 0
        );
    }

    private adaptToExecutionResponse(data: any): ExecutionResponse | null {
        // Si no hay datos, no podemos adaptar
        if (!data || typeof data !== 'object') {
            return null;
        }

        // Identificar la transacción serializada
        let serializedTx: string | undefined;
        if (
            typeof data.serializedTransaction === 'string' &&
            data.serializedTransaction.startsWith('0x')
        ) {
            serializedTx = data.serializedTransaction;
        } else if (typeof data.tx === 'string' && data.tx.startsWith('0x')) {
            serializedTx = data.tx;
        } else if (typeof data.transaction === 'string' && data.transaction.startsWith('0x')) {
            serializedTx = data.transaction;
        } else if (
            typeof data.transactionHash === 'string' &&
            data.transactionHash.startsWith('0x')
        ) {
            serializedTx = data.transactionHash;
        }

        // Si no hay transacción válida, no podemos adaptar
        if (!serializedTx) {
            return null;
        }

        // Identificar el chainId
        let chainId: string | undefined;
        if (typeof data.chainId === 'string' && data.chainId) {
            chainId = data.chainId;
        } else if (typeof data.chain === 'string' && data.chain) {
            chainId = data.chain;
        } else if (typeof data.network === 'string' && data.network) {
            chainId = data.network;
        } else if (typeof data.blockchain === 'string' && data.blockchain) {
            chainId = data.blockchain;
        }

        // Si no hay chainId válido, no podemos adaptar
        if (!chainId) {
            return null;
        }

        // Construir respuesta básica
        const response: ExecutionResponse = {
            serializedTransaction: serializedTx,
            chainId: chainId,
        };

        // Añadir ABI si está disponible
        if (Array.isArray(data.abi)) {
            response.abi = data.abi;
        }

        // Añadir params si hay datos disponibles
        if (data.functionName || data.params || (data.decoded && data.decoded.functionName)) {
            response.params = {
                functionName:
                    typeof data.functionName === 'string'
                        ? data.functionName
                        : data.decoded && typeof data.decoded.functionName === 'string'
                          ? data.decoded.functionName
                          : 'unknown',
                args: {},
            };

            // Extraer args
            if (typeof data.params === 'object' && !Array.isArray(data.params)) {
                response.params.args = data.params;
            } else if (data.decoded && data.decoded.params) {
                // Intentar extraer desde decoded.params
                const decodedParams = data.decoded.params;
                if (Array.isArray(decodedParams)) {
                    decodedParams.forEach(param => {
                        if (
                            param &&
                            typeof param === 'object' &&
                            'name' in param &&
                            'value' in param
                        ) {
                            response.params!.args[param.name] = param.value;
                        }
                    });
                }
            }
        }

        return response;
    }
}
