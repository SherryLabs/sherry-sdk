import { DynamicAction } from '../interface/actions/dynamicAction';
import { ActionValidationError } from '../errors/customErrors';
import { ExecutionResponse } from '../interface/response/executionResponse';
import { buildSdkHeaders, VALID_OPERATIONS } from '../headers/headers';
import { BaseExecutor, ExecutorOptions } from './baseExecutor';

/**
 * Blockchain context information required for dynamic action execution.
 */
export interface BlockchainContext {
    /** The user's wallet address initiating the transaction */
    userAddress: string;
    /** The source blockchain network identifier (e.g., 'avalanche', 'polygon') */
    sourceChain: string;
    /** Optional destination chain for cross-chain operations */
    destinationChain?: string;
}

/**
 * Specialized executor for dynamic blockchain actions.
 *
 * The DynamicActionExecutor handles the execution of dynamic actions, which are
 * blockchain operations defined by mini apps that generate serialized transactions
 * ready for wallet execution. Unlike static actions, dynamic actions can have
 * variable parameters, file uploads, and complex business logic.
 *
 * Key features:
 * - Parameter validation and type checking
 * - File upload support via FormData
 * - Query parameter extraction for GET-like operations
 * - Blockchain context injection
 * - Transaction response validation
 * - Cross-chain operation support
 *
 * This executor communicates with mini apps through the Sherry proxy to ensure
 * security, rate limiting, and proper request formatting.
 *
 * @extends BaseExecutor
 *
 * @example
 * ```typescript
 * const executor = createDynamicExecutor('your-client-key');
 *
 * const action: DynamicAction = {
 *   type: 'dynamic',
 *   label: 'Swap Tokens',
 *   path: '/api/swap',
 *   params: [
 *     { name: 'amount', type: 'string', required: true },
 *     { name: 'tokenIn', type: 'string', required: true },
 *     { name: 'tokenOut', type: 'string', required: true }
 *   ]
 * };
 *
 * const result = await executor.executeForTransaction(
 *   action,
 *   { amount: '100', tokenIn: 'USDC', tokenOut: 'AVAX' },
 *   {
 *     userAddress: '0x742d35Cc6634C0532925a3b8D4ccd306f6F4B26C',
 *     sourceChain: 'avalanche',
 *     baseUrl: 'https://mydefiapp.com'
 *   }
 * );
 * ```
 */
export class DynamicActionExecutor extends BaseExecutor {
    /**
     * Executes a dynamic action and returns the raw transaction data.
     *
     * This is the primary method for executing dynamic actions. It handles the
     * complete flow from parameter validation to transaction generation, including:
     *
     * - Input validation against action parameter definitions
     * - URL construction with query parameters
     * - Request body building (JSON or FormData for file uploads)
     * - Blockchain context injection
     * - Response validation
     *
     * The returned response can be in various formats depending on the mini app,
     * but will always include the basic transaction information needed for execution.
     *
     * @param action - The dynamic action definition to execute
     * @param inputs - User-provided parameter values
     * @param context - Blockchain and execution context including baseUrl
     * @param options - Additional execution options
     *
     * @returns Promise resolving to the raw transaction response from the mini app
     *
     * @throws {ActionValidationError} When action definition is invalid
     * @throws {ActionValidationError} When required parameters are missing
     * @throws {ActionValidationError} When the response format is invalid
     * @throws {Error} When the request fails or times out
     *
     * @example
     * ```typescript
     * // Simple token transfer
     * const transferResponse = await executor.executeForTransaction(
     *   transferAction,
     *   { recipient: '0x123...', amount: '1.5' },
     *   {
     *     userAddress: '0x456...',
     *     sourceChain: 'avalanche',
     *     baseUrl: 'https://app.com'
     *   }
     * );
     *
     * // NFT minting with file upload
     * const mintResponse = await executor.executeForTransaction(
     *   mintAction,
     *   {
     *     name: 'My NFT',
     *     description: 'Cool NFT',
     *     image: fileInput.files[0] // File object
     *   },
     *   {
     *     userAddress: '0x456...',
     *     sourceChain: 'polygon',
     *     baseUrl: 'https://nft.com'
     *   }
     * );
     * ```
     */
    async executeForTransaction(
        action: DynamicAction,
        inputs: Record<string, any>,
        context: BlockchainContext & { baseUrl: string },
        options?: ExecutorOptions,
    ): Promise<any> {
        try {
            this.validateAction(action);
            this.validateContext(context);
            this.validateInputs(action, inputs);

            const fullUrl = this.buildFullUrl(action, inputs, context);
            const finalClientKey = options?.clientKey || this.clientKey;

            const headers = buildSdkHeaders(fullUrl, VALID_OPERATIONS.EXECUTE, finalClientKey);

            if (options?.customHeaders) {
                Object.assign(headers, options.customHeaders);
            }

            const { body, isFormData } = this.buildRequestBody(action, inputs, context);

            if (isFormData) {
                delete headers['Content-Type'];
            }

            const response = await this.makeRequest('/proxy', {
                method: 'POST',
                headers,
                body,
            });

            if (!this.isValidTransactionResponse(response)) {
                throw new ActionValidationError('Invalid response format from action endpoint');
            }

            return response;
        } catch (error) {
            if (error instanceof ActionValidationError) {
                throw error;
            }

            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new ActionValidationError(`Error executing action '${action.label}': ${message}`);
        }
    }

    /**
     * Executes a dynamic action with strict ExecutionResponse validation.
     *
     * This method is identical to `executeForTransaction` but enforces that
     * the response conforms exactly to the ExecutionResponse interface. Use this
     * method when you need guaranteed response structure for further processing.
     *
     * @param action - The dynamic action definition to execute
     * @param inputs - User-provided parameter values
     * @param context - Blockchain and execution context including baseUrl
     * @param options - Additional execution options
     *
     * @returns Promise resolving to a validated ExecutionResponse
     *
     * @throws {ActionValidationError} When response doesn't match ExecutionResponse format
     *
     * @example
     * ```typescript
     * const response: ExecutionResponse = await executor.execute(
     *   action,
     *   inputs,
     *   {
     *     userAddress: '0x456...',
     *     sourceChain: 'avalanche',
     *     baseUrl: 'https://app.com'
     *   }
     * );
     *
     * // Guaranteed to have these properties
     * console.log(response.serializedTransaction);
     * console.log(response.chainId);
     * if (response.abi) console.log('ABI available');
     * if (response.crossChain) console.log('Cross-chain operation');
     * ```
     */
    async execute(
        action: DynamicAction,
        inputs: Record<string, any>,
        context: BlockchainContext & { baseUrl: string },
        options?: ExecutorOptions,
    ): Promise<ExecutionResponse> {
        const response = await this.executeForTransaction(action, inputs, context, options);

        if (!this.isValidExecutionResponse(response)) {
            throw new ActionValidationError(
                'Invalid ExecutionResponse format from action endpoint',
            );
        }

        return response as ExecutionResponse;
    }

    private buildFullUrl(
        action: DynamicAction,
        inputs: Record<string, any>,
        context: BlockchainContext & { baseUrl: string },
    ): string {
        const baseUrl = this.buildTargetUrl(context.baseUrl, action.path);

        const queryParams = this.buildQueryParams(action, inputs);

        if (queryParams.length > 0) {
            const separator = baseUrl.includes('?') ? '&' : '?';
            return `${baseUrl}${separator}${queryParams}`;
        }

        return baseUrl;
    }

    private buildQueryParams(action: DynamicAction, inputs: Record<string, any>): string {
        const params = new URLSearchParams();

        action.params?.forEach(param => {
            const value = inputs[param.name];

            if (value !== undefined && value !== null) {
                if (param.type !== 'file' && param.type !== 'image') {
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(param.name, String(v)));
                    } else {
                        params.set(param.name, String(value));
                    }
                }
            }
        });

        return params.toString();
    }

    private buildRequestBody(
        action: DynamicAction,
        inputs: Record<string, any>,
        context: BlockchainContext,
    ): { body: string | FormData; isFormData: boolean } {
        const hasFiles = this.hasFileInputs(action.params || [], inputs);

        if (hasFiles) {
            const formData = new FormData();

            action.params?.forEach(param => {
                if (param.type === 'file' || param.type === 'image') {
                    const value = inputs[param.name];
                    if (value) {
                        if (value instanceof File) {
                            formData.append(param.name, value);
                        } else if (value instanceof FileList) {
                            Array.from(value).forEach((file, index) => {
                                formData.append(`${param.name}[${index}]`, file);
                            });
                        } else if (Array.isArray(value)) {
                            value.forEach((file, index) => {
                                if (file instanceof File) {
                                    formData.append(`${param.name}[${index}]`, file);
                                }
                            });
                        }
                    }
                }
            });

            action.params?.forEach(param => {
                if (param.type !== 'file' && param.type !== 'image') {
                    const value = inputs[param.name];
                    if (
                        value !== undefined &&
                        value !== null &&
                        !this.shouldGoInQueryString(param)
                    ) {
                        formData.append(param.name, String(value));
                    }
                }
            });

            formData.append(
                '_sdk_context',
                JSON.stringify({
                    userAddress: context.userAddress,
                    sourceChain: context.sourceChain,
                    destinationChain: context.destinationChain,
                }),
            );

            formData.append('action', action.label);

            return { body: formData, isFormData: true };
        } else {
            const jsonBody = {
                action: action.label,
                params: this.buildJsonParams(action, inputs),
                context: {
                    userAddress: context.userAddress,
                    sourceChain: context.sourceChain,
                    destinationChain: context.destinationChain,
                },
            };

            return { body: JSON.stringify(jsonBody), isFormData: false };
        }
    }

    private buildJsonParams(
        action: DynamicAction,
        inputs: Record<string, any>,
    ): Record<string, any> {
        const params: Record<string, any> = {};

        action.params?.forEach(param => {
            if (
                param.type !== 'file' &&
                param.type !== 'image' &&
                !this.shouldGoInQueryString(param)
            ) {
                const value = inputs[param.name];

                if (value !== undefined && value !== null) {
                    params[param.name] = value;
                } else if (param.value !== undefined) {
                    params[param.name] = param.value;
                }
            }
        });

        return params;
    }

    private shouldGoInQueryString(param: any): boolean {
        return (
            ['string', 'number', 'boolean'].includes(param.type) &&
            !param.sensitive &&
            param.queryParam !== false
        );
    }

    private hasFileInputs(params: any[], inputs: Record<string, any>): boolean {
        return params.some(
            param =>
                (param.type === 'file' || param.type === 'image') &&
                inputs[param.name] !== undefined,
        );
    }

    private validateAction(action: DynamicAction): void {
        if (action.type !== 'dynamic') {
            throw new ActionValidationError('Action type must be "dynamic"');
        }

        if (!action.path) {
            throw new ActionValidationError('Dynamic action must have a path');
        }
    }

    private validateContext(context: BlockchainContext & { baseUrl?: string }): void {
        if (!context.userAddress) {
            throw new ActionValidationError('User address is required');
        }

        if (!context.sourceChain) {
            throw new ActionValidationError('Source chain is required');
        }

        if (!context.baseUrl) {
            throw new ActionValidationError('Base URL is required');
        }
    }

    private validateInputs(action: DynamicAction, inputs: Record<string, any>): void {
        action.params?.forEach(param => {
            const value = inputs[param.name];

            if (param.required && (value === undefined || value === null || value === '')) {
                throw new ActionValidationError(`Required parameter '${param.name}' is missing`);
            }
        });
    }

    private isValidTransactionResponse(data: any): boolean {
        return (
            data &&
            typeof data === 'object' &&
            typeof data.serializedTransaction === 'string' &&
            data.serializedTransaction.length > 0 &&
            typeof data.chainId === 'string' &&
            data.chainId.length > 0 &&
            (data.abi === undefined || Array.isArray(data.abi)) &&
            (data.params === undefined ||
                (typeof data.params === 'object' &&
                    typeof data.params.functionName === 'string' &&
                    typeof data.params.args === 'object')) &&
            (data.crossChain === undefined ||
                (typeof data.crossChain === 'object' &&
                    typeof data.crossChain.destinationChainId === 'string'))
        );
    }

    private isValidExecutionResponse(data: any): boolean {
        return this.isValidTransactionResponse(data);
    }
}

/**
 * Creates a DynamicActionExecutor instance with default configuration.
 *
 * This is the recommended way to create a dynamic action executor for
 * authenticated users. The client key enables higher rate limits and
 * access to premium features.
 *
 * @param clientKey - Optional client key for authentication
 * @returns A new DynamicActionExecutor instance
 *
 * @example
 * ```typescript
 * // Authenticated executor (recommended)
 * const executor = createDynamicExecutor('your-client-key');
 *
 * // Anonymous executor (lower rate limits)
 * const anonExecutor = createDynamicExecutor();
 * ```
 */
export function createDynamicExecutor(clientKey?: string): DynamicActionExecutor {
    return new DynamicActionExecutor(clientKey);
}

/**
 * Creates an anonymous DynamicActionExecutor instance.
 *
 * Anonymous executors have reduced rate limits and may not be able to
 * access all mini apps. Use this for testing or when client keys are
 * not available.
 *
 * @returns A new anonymous DynamicActionExecutor instance
 *
 * @example
 * ```typescript
 * const executor = createAnonymousExecutor();
 *
 * // Limited functionality, good for testing
 * const metadata = await executor.getMetadata('https://demo.app');
 * ```
 */
export function createAnonymousExecutor(): DynamicActionExecutor {
    return new DynamicActionExecutor();
}
