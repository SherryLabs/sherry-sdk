import { ActionValidationError } from '../errors/customErrors';
import { buildSdkHeaders } from '../headers/headers';

/**
 * Configuration options for executor operations.
 */
export interface ExecutorOptions {
    /** Client key for authentication. Overrides the executor's default client key. */
    clientKey?: string;
    /** Request timeout in milliseconds. Default varies by operation type. */
    timeout?: number;
    /** Additional custom headers to include in the request. */
    customHeaders?: Record<string, string>;
}

/**
 * Base executor class that provides common functionality for all executor types.
 * 
 * This abstract class handles:
 * - Communication with the Sherry proxy server
 * - HTTP request/response management
 * - URL building and validation
 * - Error handling and timeout management
 * - Metadata fetching for any mini app
 * 
 * All concrete executor implementations should extend this class to inherit
 * the core networking and communication functionality.
 * 
 * @example
 * ```typescript
 * class CustomExecutor extends BaseExecutor {
 *   async customOperation(url: string) {
 *     return this.makeRequest('/proxy', {
 *       method: 'GET',
 *       headers: buildSdkHeaders(url, 'metadata'),
 *       timeout: 10000
 *     });
 *   }
 * }
 * ```
 */
export abstract class BaseExecutor {
    /** The Sherry proxy server URL used for all requests */
    protected proxyUrl: string = 'https://proxy.sherry.social';
    
    /** Optional client key for authenticated requests */
    protected clientKey?: string;

    /**
     * Creates a new BaseExecutor instance.
     * 
     * @param clientKey - Optional client key for authentication. 
     *                   If not provided, requests will be made anonymously 
     *                   with reduced rate limits.
     */
    constructor(clientKey?: string) {
        this.clientKey = clientKey;
    }

    /**
     * Fetches metadata from any mini app endpoint.
     * 
     * This method is universal and works with all types of mini apps,
     * not just those with dynamic actions. It's the recommended way
     * to discover what actions and capabilities a mini app provides.
     * 
     * @param baseUrl - The base URL of the mini app (e.g., 'https://myapp.com')
     * @param path - The metadata endpoint path. Defaults to '/metadata'
     * @param options - Additional options for the request
     * 
     * @returns Promise resolving to the mini app's metadata object
     * 
     * @throws {ActionValidationError} When URL parameters are invalid
     * @throws {Error} When the request fails or times out
     * 
     * @example
     * ```typescript
     * const executor = new MiniAppExecutor('your-client-key');
     * 
     * // Get metadata from default endpoint
     * const metadata = await executor.getMetadata('https://myapp.com');
     * 
     * // Get metadata from custom endpoint
     * const customMeta = await executor.getMetadata(
     *   'https://myapp.com', 
     *   '/api/v1/metadata',
     *   { timeout: 5000 }
     * );
     * ```
     */
    async getMetadata(
        baseUrl: string,
        path: string = '/metadata',
        options?: ExecutorOptions,
    ): Promise<any> {
        const targetUrl = this.buildTargetUrl(baseUrl, path);
        const finalClientKey = options?.clientKey || this.clientKey;

        const headers = buildSdkHeaders(targetUrl, 'metadata', finalClientKey);

        if (options?.customHeaders) {
            Object.assign(headers, options.customHeaders);
        }

        return this.makeRequest('/proxy', {
            method: 'GET',
            headers,
            timeout: options?.timeout || 10000,
        });
    }

    /**
     * Builds a complete target URL from base URL and path components.
     * 
     * This method handles various URL formats:
     * - Relative paths: '/metadata' -> 'https://base.com/metadata'
     * - Absolute URLs: 'https://other.com/api' -> 'https://other.com/api'
     * - Normalizes trailing slashes and path separators
     * 
     * @param baseUrl - The base URL of the target service
     * @param path - The path to append to the base URL
     * 
     * @returns The complete, normalized target URL
     * 
     * @throws {ActionValidationError} When baseUrl or path are missing
     * 
     * @protected
     */
    protected buildTargetUrl(baseUrl?: string, path?: string): string {
        if (!baseUrl || !path) {
            throw new ActionValidationError('baseUrl and path are required');
        }

        if (path.startsWith('http')) {
            return path;
        }

        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        return `${cleanBaseUrl}${cleanPath}`;
    }

    /**
     * Makes an HTTP request through the Sherry proxy server.
     * 
     * This method handles:
     * - Request timeout management with AbortController
     * - Content-Type header detection and setting
     * - Response parsing and validation
     * - Comprehensive error handling
     * - JSON response parsing with error recovery
     * 
     * @param endpoint - The proxy endpoint to call (usually '/proxy')
     * @param options - Request configuration options
     * 
     * @returns Promise resolving to the parsed JSON response
     * 
     * @throws {Error} When the request times out
     * @throws {Error} When the response is not OK (4xx, 5xx status codes)
     * @throws {Error} When the response is empty or invalid JSON
     * 
     * @protected
     */
    protected async makeRequest(
        endpoint: string,
        options: {
            method: string;
            headers: Record<string, string>;
            body?: string | FormData;
            timeout: number;
        },
    ): Promise<any> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout);

        try {
            const finalHeaders = { ...options.headers };
            
            // Auto-detect and set Content-Type for JSON requests
            if (options.body && typeof options.body === 'string' && !finalHeaders['Content-Type']) {
                finalHeaders['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${this.proxyUrl}${endpoint}`, {
                method: options.method,
                headers: finalHeaders,
                body: options.body,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Could not read error');
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const responseText = await response.text();
            if (!responseText?.trim()) {
                throw new Error('Empty response from proxy');
            }

            return JSON.parse(responseText);
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${options.timeout}ms`);
            }

            throw error;
        }
    }
}
