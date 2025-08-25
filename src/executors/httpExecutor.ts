import { BaseExecutor } from './baseExecutor';
import { HttpAction, HttpParameter } from '../interface/actions/httpAction';
import { ActionValidationError } from '../errors/customErrors';
import { buildHttpActionHeaders } from '../headers/headers';
import {
    ActionParameterValidator,
    SecureRequestBuilder,
    ActionErrorHandler,
    UUIDValidator,
    type RequestMetadata,
} from '../utils/actionUtils';

/**
 * Response from HTTP action execution
 */
export interface HttpActionResponse {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: {
        executionTime: number;
        requestId: string;
        timestamp: number;
    };
}

/**
 * Secure HTTP Action Request structure sent to proxy
 */
export interface SecureHttpRequest {
    // Metadata
    miniAppId: string;
    timestamp: number;
    nonce: string;
    userAddress?: string;

    // User parameters (will be encrypted)
    params: Record<string, any>;

    // Request metadata
    method?: string;
    clientVersion?: string;

    // Signature (calculated by proxy client)
    signature?: string;
}

/**
 * HTTP Action Executor
 *
 * Handles the execution of HTTP actions by communicating with the Sherry proxy server.
 * The proxy server validates mini-app IDs, encrypts payloads, and forwards requests
 * to registered integrator endpoints securely.
 */
export class HttpActionExecutor extends BaseExecutor {
    private readonly PROXY_HTTP_ENDPOINT = '/proxy/http';

    constructor(clientKey?: string, proxyUrl?: string) {
        super(clientKey, proxyUrl);
    }

    /**
     * Execute an HTTP action through the secure proxy
     *
     * @param action - The HTTP action to execute
     * @param userParams - User-provided parameters for the action
     * @param userAddress - Optional user wallet address for audit/rate limiting
     * @returns Promise resolving to the action response
     */
    async executeAction(
        action: HttpAction,
        userParams: Record<string, any>,
        userAddress?: string,
    ): Promise<HttpActionResponse> {
        try {
            // 1. Validate action structure
            this.validateAction(action);

            // 2. Validate and sanitize user parameters
            const sanitizedParams = this.validateAndSanitizeParams(action.params || [], userParams);

            // 3. Build secure request
            const secureRequest = this.buildSecureRequest(action, sanitizedParams, userAddress);

            // 4. Execute request through proxy
            const startTime = Date.now();
            const response = await this.makeRequest(this.PROXY_HTTP_ENDPOINT, {
                method: 'POST',
                headers: this.buildHeaders(action.miniAppId, userAddress),
                body: JSON.stringify(secureRequest),
            });
            const executionTime = Date.now() - startTime;

            // 5. Process and return response
            return this.processResponse(response, secureRequest.nonce, executionTime);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Validate the HTTP action structure
     */
    private validateAction(action: HttpAction): void {
        if (!action.miniAppId) {
            throw new ActionValidationError('HTTP action must have a valid miniAppId');
        }

        if (!action.label) {
            throw new ActionValidationError('HTTP action must have a label');
        }

        // Use shared UUID validation
        UUIDValidator.validateUUID(action.miniAppId, 'miniAppId');
    }

    /**
     * Validate and sanitize user-provided parameters against action schema
     */
    private validateAndSanitizeParams(
        paramSchema: HttpParameter[],
        userParams: Record<string, any>,
    ): Record<string, any> {
        // Use shared validation logic
        return ActionParameterValidator.validateAndSanitizeParams(paramSchema, userParams);
    }

    /**
     * Build the secure request structure
     */
    private buildSecureRequest(
        action: HttpAction,
        sanitizedParams: Record<string, any>,
        userAddress?: string,
    ): SecureHttpRequest {
        const metadata = SecureRequestBuilder.generateRequestMetadata();

        return {
            miniAppId: action.miniAppId,
            timestamp: metadata.timestamp,
            nonce: metadata.nonce,
            userAddress,
            params: sanitizedParams,
            method: action.method || 'POST',
            clientVersion: metadata.clientVersion,
        };
    }

    /**
     * Build request headers for HTTP actions
     */
    private buildHeaders(miniAppId: string, userAddress?: string): Record<string, string> {
        // Use shared header builder for HTTP actions
        return buildHttpActionHeaders(miniAppId, this.clientKey, userAddress);
    }

    /**
     * Process the response from the proxy
     */
    private processResponse(
        response: any,
        requestNonce: string,
        executionTime: number,
    ): HttpActionResponse {
        return {
            success: true,
            data: response.data || response,
            metadata: {
                executionTime,
                requestId: requestNonce,
                timestamp: Date.now(),
            },
        };
    }

    /**
     * Handle execution errors
     */
    private handleError(error: any): HttpActionResponse {
        console.error('HTTP Action execution failed:', error);

        // Use shared error handling, but adapt to HttpActionResponse format
        const standardError = ActionErrorHandler.createErrorResponse(error);

        return {
            success: standardError.success,
            error: standardError.error,
            metadata: standardError.metadata,
        };
    }
}
