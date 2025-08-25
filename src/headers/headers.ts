// ====== REFACTORIZACIÓN: headers/headers.ts ======

// ====== SDK TO PROXY HEADERS ======
export const SDK_TO_PROXY_HEADERS = {
    CLIENT_KEY: 'X-Sherry-Client-Key',
    TARGET_URL: 'X-Sherry-Target-URL',
    OPERATION: 'X-Sherry-Operation',
    MINI_APP_ID: 'X-Sherry-Mini-App-ID', // For HTTP actions
    USER_ADDRESS: 'X-Sherry-User-Address', // For HTTP actions
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
    USER_AGENT: 'Sherry-SDK/1.0.0',
} as const;

// ====== VALID OPERATIONS ======
export const VALID_OPERATIONS = {
    EXECUTE: 'execute',
    FETCH: 'fetch',
    HTTP_ACTION: 'http-action', // New operation for HTTP actions via proxy
} as const;

export type ValidOperation = (typeof VALID_OPERATIONS)[keyof typeof VALID_OPERATIONS];

// ====== UTILITIES ======

/**
 * ✅ REFACTORIZADO: Headers que el SDK envía al proxy usando constantes
 */
export function buildSdkHeaders(
    targetUrl: string,
    operation: ValidOperation,
    clientKey?: string,
): Record<string, string> {
    const headers: Record<string, string> = {
        // Usando las constantes en lugar de strings hardcodeados
        [SDK_TO_PROXY_HEADERS.TARGET_URL]: targetUrl,
        [SDK_TO_PROXY_HEADERS.OPERATION]: operation,
        [SDK_TO_PROXY_HEADERS.CONTENT_TYPE]: SHERRY_VALUES.CONTENT_TYPE_JSON,
        [SDK_TO_PROXY_HEADERS.USER_AGENT]: SHERRY_VALUES.USER_AGENT,
    };

    // Add client key if provided
    if (clientKey) {
        headers[SDK_TO_PROXY_HEADERS.CLIENT_KEY] = clientKey;
    }

    return headers;
}

/**
 * ✅ NUEVA: Headers específicos para HTTP Actions con miniAppId
 */
export function buildHttpActionHeaders(
    miniAppId: string,
    clientKey?: string,
    userAddress?: string,
): Record<string, string> {
    const headers: Record<string, string> = {
        [SDK_TO_PROXY_HEADERS.OPERATION]: VALID_OPERATIONS.HTTP_ACTION,
        [SDK_TO_PROXY_HEADERS.MINI_APP_ID]: miniAppId,
        [SDK_TO_PROXY_HEADERS.CONTENT_TYPE]: SHERRY_VALUES.CONTENT_TYPE_JSON,
        [SDK_TO_PROXY_HEADERS.USER_AGENT]: SHERRY_VALUES.USER_AGENT,
    };

    // Add client key if provided
    if (clientKey) {
        headers[SDK_TO_PROXY_HEADERS.CLIENT_KEY] = clientKey;
    }

    // Add user address if provided (for audit/rate limiting)
    if (userAddress) {
        headers[SDK_TO_PROXY_HEADERS.USER_ADDRESS] = userAddress;
    }

    return headers;
}

/**
 * ✅ NUEVA: Valida que una operación sea válida
 */
export function isValidOperation(operation: string): operation is ValidOperation {
    return Object.values(VALID_OPERATIONS).includes(operation as ValidOperation);
}

/**
 * ✅ NUEVA: Extrae headers del SDK de un request
 */
export function extractSdkHeaders(headers: Headers | Record<string, string>) {
    const getHeader = (name: string) =>
        headers instanceof Headers ? headers.get(name) : headers[name];

    return {
        targetUrl: getHeader(SDK_TO_PROXY_HEADERS.TARGET_URL),
        operation: getHeader(SDK_TO_PROXY_HEADERS.OPERATION) as ValidOperation | null,
        clientKey: getHeader(SDK_TO_PROXY_HEADERS.CLIENT_KEY),
        contentType: getHeader(SDK_TO_PROXY_HEADERS.CONTENT_TYPE),
        userAgent: getHeader(SDK_TO_PROXY_HEADERS.USER_AGENT),
    };
}

export function validateSdkHeaders(headers: Headers | Record<string, string>): {
    isValid: boolean;
    errors: string[];
} {
    const extracted = extractSdkHeaders(headers);
    const errors: string[] = [];

    if (!extracted.targetUrl) {
        errors.push(`Missing ${SDK_TO_PROXY_HEADERS.TARGET_URL} header`);
    }

    if (!extracted.operation) {
        errors.push(`Missing ${SDK_TO_PROXY_HEADERS.OPERATION} header`);
    } else if (!isValidOperation(extracted.operation)) {
        errors.push(
            `Invalid operation. Valid operations: ${Object.values(VALID_OPERATIONS).join(', ')}`,
        );
    }

    try {
        if (extracted.targetUrl) {
            new URL(extracted.targetUrl);
        }
    } catch {
        errors.push('Invalid target URL format');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Headers que el proxy envía al desarrollador
 */
export function buildProxyHeaders(options: {
    operation: ValidOperation;
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
    if (options.operation === VALID_OPERATIONS.EXECUTE) {
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
 * Valida que un request viene del proxy Sherry
 */
export function validateProxyRequest(headers: Headers | Record<string, string>): boolean {
    const getHeader = (name: string) =>
        headers instanceof Headers ? headers.get(name) : headers[name];

    return getHeader(PROXY_TO_DEV_HEADERS.PROXY_MARKER) === SHERRY_VALUES.PROXY_MARKER;
}

/**
 * Extrae contexto blockchain de headers
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
