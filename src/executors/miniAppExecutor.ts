import { BaseExecutor, ExecutorOptions } from './baseExecutor';
import { buildSdkHeaders } from '../headers/headers';

/**
 * General-purpose executor for interacting with any mini app endpoints.
 * 
 * The MiniAppExecutor provides a flexible interface for making arbitrary
 * HTTP requests to mini app endpoints through the Sherry proxy. Unlike the
 * specialized DynamicActionExecutor, this executor can be used for:
 * 
 * - Custom API endpoints that don't follow action patterns
 * - Metadata fetching from any mini app
 * - Health checks and status endpoints
 * - Configuration or settings retrieval
 * - Any GET/POST operation to mini app endpoints
 * 
 * This executor is ideal when you need to interact with mini apps that have
 * custom endpoints beyond the standard action execution pattern, or when
 * building developer tools that need to inspect mini app capabilities.
 * 
 * @extends BaseExecutor
 * 
 * @example
 * ```typescript
 * const executor = new MiniAppExecutor('your-client-key');
 * 
 * // Get metadata
 * const metadata = await executor.getMetadata('https://myapp.com');
 * 
 * // Custom GET request
 * const status = await executor.request('https://myapp.com', '/health');
 * 
 * // Custom POST request
 * const result = await executor.request('https://myapp.com', '/api/custom', {
 *   method: 'POST',
 *   body: { setting: 'value' }
 * });
 * ```
 */
export class MiniAppExecutor extends BaseExecutor {
    /**
     * Makes a generic HTTP request to any mini app endpoint.
     * 
     * This method provides maximum flexibility for interacting with mini apps.
     * It can handle both GET and POST requests, with automatic content-type
     * detection and proper header management.
     * 
     * Features:
     * - Automatic Content-Type detection (JSON vs FormData)
     * - Proper SDK header injection for proxy routing
     * - Custom header support
     * - Timeout configuration
     * - Error handling and validation
     * 
     * The request automatically routes through the Sherry proxy server, ensuring
     * security, rate limiting, and proper request validation.
     * 
     * @param baseUrl - The base URL of the target mini app
     * @param path - The endpoint path to request
     * @param options - Request configuration options
     * 
     * @returns Promise resolving to the response from the mini app
     * 
     * @throws {ActionValidationError} When URL parameters are invalid
     * @throws {Error} When the request fails or times out
     * 
     * @example
     * ```typescript
     * const executor = new MiniAppExecutor('client-key');
     * 
     * // Simple GET request
     * const data = await executor.request('https://api.example.com', '/data');
     * 
     * // POST with JSON body
     * const result = await executor.request('https://api.example.com', '/submit', {
     *   method: 'POST',
     *   body: { key: 'value', number: 42 },
     *   timeout: 15000
     * });
     * 
     * // POST with FormData (file upload)
     * const formData = new FormData();
     * formData.append('file', fileInput.files[0]);
     * formData.append('description', 'My file');
     * 
     * const uploadResult = await executor.request('https://api.example.com', '/upload', {
     *   method: 'POST',
     *   body: formData
     * });
     * 
     * // GET with custom headers and timeout
     * const customResult = await executor.request('https://api.example.com', '/custom', {
     *   customHeaders: {
     *     'X-Custom-Header': 'special-value'
     *   },
     *   timeout: 5000
     * });
     * ```
     */
    async request(
        baseUrl: string,
        path: string,
        options?: ExecutorOptions & {
            /** HTTP method to use. Defaults to 'GET' */
            method?: 'GET' | 'POST';
            /** Request body. Can be any JSON-serializable object or FormData */
            body?: any;
        }
    ): Promise<any> {
        const targetUrl = this.buildTargetUrl(baseUrl, path);
        const finalClientKey = options?.clientKey || this.clientKey;
        const method = options?.method || 'GET';

        // Use appropriate operation type for headers
        const headers = buildSdkHeaders(
            targetUrl, 
            method === 'POST' ? 'execute' : 'metadata', 
            finalClientKey
        );

        if (options?.customHeaders) {
            Object.assign(headers, options.customHeaders);
        }

        let body: string | FormData | undefined;
        if (method === 'POST' && options?.body) {
            if (options.body instanceof FormData) {
                body = options.body;
                // Let browser set Content-Type with boundary for FormData
                delete headers['Content-Type'];
            } else {
                // Serialize objects to JSON
                body = JSON.stringify(options.body);
                headers['Content-Type'] = 'application/json';
            }
        }

        return this.makeRequest('/proxy', {
            method,
            headers,
            body,
            timeout: options?.timeout || 30000,
        });
    }
}
