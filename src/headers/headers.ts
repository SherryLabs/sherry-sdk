/**
 * Simplified headers for the Sherry SDK
 * Optimized version that eliminates unnecessary complexity
 */

// ====== SDK TO PROXY HEADERS ======
export const SDK_TO_PROXY_HEADERS = {
    CLIENT_KEY: 'X-Sherry-Client-Key',
    TARGET_URL: 'X-Sherry-Target-URL',
    OPERATION: 'X-Sherry-Operation', // 'metadata' | 'execute'
    CONTENT_TYPE: 'Content-Type',
    USER_AGENT: 'User-Agent',
} as const;

// ====== PROXY TO DEVELOPER HEADERS ======
export const PROXY_TO_DEV_HEADERS = {
    // Identification
    PROXY_MARKER: 'X-Sherry-Proxy',
    PROXY_VERSION: 'X-Sherry-Version',

    // Blockchain context (only for POST /execute)
    CHAIN_ID: 'X-Chain-ID',
    DESTINATION_CHAIN: 'X-Destination-Chain',
    WALLET_ADDRESS: 'X-Wallet-Address',
    TIMESTAMP: 'X-Timestamp',

    // Standard
    CONTENT_TYPE: 'Content-Type',
} as const;

// ====== CONSTANT VALUES ======
export const SHERRY_VALUES = {
    PROXY_MARKER: 'true',
    PROXY_VERSION: '1.0.0',
    SDK_VERSION: '1.0.0',
    SDK_NAME: 'sherry-sdk',
    CONTENT_TYPE_JSON: 'application/json',
} as const;

// ====== CORS FOR DEVELOPERS ======
export const DEVELOPER_CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://proxy.sherry.social',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': [
        'Content-Type',
        'X-Sherry-Proxy',
        'X-Sherry-Version',
        'X-Chain-ID',
        'X-Destination-Chain',
        'X-Wallet-Address',
        'X-Timestamp',
    ].join(', '),
    'Access-Control-Max-Age': '86400',
} as const;

// ====== UTILITIES ======

/**
 * Headers that the SDK sends to the proxy
 */
export function buildSdkHeaders(
    targetUrl: string,
    operation: 'execute' | 'metadata',
    clientKey?: string,
): Record<string, string> {
    const headers: Record<string, string> = {
        // SDK headers that the proxy expects
        'X-Sherry-Target-URL': targetUrl,
        'X-Sherry-Operation': operation,
        'Content-Type': 'application/json',
        'User-Agent': 'Sherry-SDK/1.0.0',
    };

    // Add client key if provided
    if (clientKey) {
        headers['X-Sherry-Client-Key'] = clientKey;
    }

    return headers;
}

/**
 * Headers that the proxy sends to the developer
 */
export function buildProxyHeaders(options: {
    operation: 'metadata' | 'execute';
    chainId?: string;
    destinationChain?: string;
    walletAddress?: string;
}): Record<string, string> {
    const headers: Record<string, string> = {
        [PROXY_TO_DEV_HEADERS.PROXY_MARKER]: SHERRY_VALUES.PROXY_MARKER,
        [PROXY_TO_DEV_HEADERS.PROXY_VERSION]: SHERRY_VALUES.PROXY_VERSION,
        [PROXY_TO_DEV_HEADERS.CONTENT_TYPE]: SHERRY_VALUES.CONTENT_TYPE_JSON,
        [PROXY_TO_DEV_HEADERS.TIMESTAMP]: Date.now().toString(),
    };

    // Only add blockchain context for execution operations
    if (options.operation === 'execute') {
        if (options.chainId) {
            headers[PROXY_TO_DEV_HEADERS.CHAIN_ID] = options.chainId;
        }
        if (options.destinationChain) {
            headers[PROXY_TO_DEV_HEADERS.DESTINATION_CHAIN] = options.destinationChain;
        }
        if (options.walletAddress) {
            headers[PROXY_TO_DEV_HEADERS.WALLET_ADDRESS] = options.walletAddress;
        }
    }

    return headers;
}

/**
 * Validates that a request comes from the Sherry proxy
 */
export function validateProxyRequest(headers: Headers | Record<string, string>): boolean {
    const getHeader = (name: string) =>
        headers instanceof Headers ? headers.get(name) : headers[name];

    return getHeader(PROXY_TO_DEV_HEADERS.PROXY_MARKER) === SHERRY_VALUES.PROXY_MARKER;
}

/**
 * Extracts blockchain context from headers
 */
export function extractBlockchainContext(headers: Headers | Record<string, string>) {
    const getHeader = (name: string) =>
        headers instanceof Headers ? headers.get(name) : headers[name];

    return {
        chainId: getHeader(PROXY_TO_DEV_HEADERS.CHAIN_ID) || undefined,
        destinationChain: getHeader(PROXY_TO_DEV_HEADERS.DESTINATION_CHAIN) || undefined,
        walletAddress: getHeader(PROXY_TO_DEV_HEADERS.WALLET_ADDRESS) || undefined,
        timestamp: getHeader(PROXY_TO_DEV_HEADERS.TIMESTAMP) || undefined,
    };
}

/**
 * Middleware for developers that validates requests from the proxy
 */
export function createDeveloperMiddleware() {
    return (req: any, res: any, next: any) => {
        // Apply CORS
        Object.entries(DEVELOPER_CORS_HEADERS).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        // Handle OPTIONS
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Validate that it comes from the proxy
        if (!validateProxyRequest(req.headers)) {
            return res.status(403).json({
                error: 'Only Sherry proxy requests allowed',
            });
        }

        // Add context to request
        req.sherryContext = extractBlockchainContext(req.headers);

        next();
    };
}
