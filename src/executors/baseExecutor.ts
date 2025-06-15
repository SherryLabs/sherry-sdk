import { ActionValidationError } from '../errors/customErrors';
import { buildSdkHeaders, VALID_OPERATIONS, ValidOperation } from '../headers/headers';

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
    /** Custom proxy URL for CORS or development environments */
    proxyUrl?: string;
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
    protected clientKey?: string;
    protected proxyBaseUrl: string;
    protected defaultTimeout: number;
    protected isBrowser: boolean;

    /**
     * Creates a new BaseExecutor instance.
     *
     * @param clientKey - Optional client key for authentication.
     *                   If not provided, requests will be made anonymously
     *                   with reduced rate limits.
     * @param proxyUrl - Optional custom proxy URL for CORS or development environments.
     *                  Defaults to the official Sherry proxy.
     */
    constructor(clientKey?: string, proxyUrl?: string) {
        this.clientKey = clientKey;
        this.isBrowser = typeof window !== 'undefined';
        this.proxyBaseUrl =
            proxyUrl || process.env.SHERRY_PROXY_URL || 'https://proxy.sherry.social';
        this.defaultTimeout = 30000;

        // Warn about CORS issues in browser environments
        if (this.isBrowser && this.proxyBaseUrl.includes('proxy.sherry.social')) {
            console.warn(
                'Sherry SDK: Running in browser environment. You may encounter CORS issues. ' +
                    'Consider using a CORS proxy or server-side implementation for production.',
            );
        }
    }

    /**
     * Fetches metadata from any mini app endpoint.
     *
     * This method is universal and works with all types of mini apps,
     * not just those with dynamic actions. It's the recommended way
     * to discover what actions and capabilities a mini app provides.
     *
     * @param targetUrl - The complete URL of the mini app's metadata endpoint
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
     * // Get metadata from app
     * const metadata = await executor.getMetadata('https://myapp.com/metadata');
     *
     * // Get metadata with custom options
     * const customMeta = await executor.getMetadata(
     *   'https://myapp.com/api/v1/metadata',
     *   { timeout: 5000, clientKey: 'custom-key' }
     * );
     * ```
     */
    async getMetadata(targetUrl: string, options?: ExecutorOptions): Promise<any> {
        const finalClientKey = options?.clientKey || this.clientKey;
        const finalProxyUrl = options?.proxyUrl || this.proxyBaseUrl;

        const headers = buildSdkHeaders(targetUrl, VALID_OPERATIONS.FETCH, finalClientKey);

        if (options?.customHeaders) {
            Object.assign(headers, options.customHeaders);
        }

        const requestEndpoint = `/proxy?url=${encodeURIComponent(targetUrl)}`;

        return this.makeRequest(
            requestEndpoint,
            {
                method: 'GET',
                headers,
            },
            finalProxyUrl,
        );
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

        if (path.startsWith('https')) {
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
     * @param customProxyUrl - Optional custom proxy URL for CORS or development environments
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
        },
        customProxyUrl?: string,
    ): Promise<any> {
        const timeout = this.defaultTimeout;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const proxyUrl = customProxyUrl || this.proxyBaseUrl;

        try {
            const finalHeaders = { ...options.headers };

            // Auto-detect and set Content-Type for JSON requests
            if (options.body && typeof options.body === 'string' && !finalHeaders['Content-Type']) {
                finalHeaders['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${proxyUrl}${endpoint}`, {
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
                throw new Error(`Request timeout after ${timeout}ms`);
            }

            // Enhanced CORS error messaging
            if (error instanceof TypeError && error.message.includes('fetch')) {
                if (this.isBrowser) {
                    throw new Error(
                        'CORS error: Cannot access proxy from browser. ' +
                            'Use a CORS proxy, implement server-side calls, or configure your proxy to allow CORS. ' +
                            `Original error: ${error.message}`,
                    );
                }
            }

            throw error;
        }
    }
}
