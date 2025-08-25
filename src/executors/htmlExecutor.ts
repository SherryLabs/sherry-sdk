import { BaseExecutor } from './baseExecutor';
import { HTMLAction, ContextData, ContextSharing } from '../interface/actions/htmlAction';
import { ActionValidationError } from '../errors/customErrors';

/**
 * Context provider interface - should be implemented by the host application
 */
export interface ContextProvider {
    getUserAddress(): Promise<string | null>;
    getChainId(): Promise<number | null>;
    getBalance(): Promise<string | null>;
    getNetworkName(): Promise<string | null>;
    getEnsName(): Promise<string | null>;
}

/**
 * HTML Action Executor
 *
 * Handles the execution and rendering of HTML actions, including embedded content
 * with optional context sharing capabilities.
 */
export class HTMLActionExecutor extends BaseExecutor {
    private contextProvider?: ContextProvider;
    private activeIframes: Map<HTMLIFrameElement, ContextSharing> = new Map();

    constructor(clientKey?: string, proxyUrl?: string, contextProvider?: ContextProvider) {
        super(clientKey, proxyUrl);
        this.contextProvider = contextProvider;
        this.setupGlobalMessageListener();
    }

    /**
     * Execute an HTML action by creating and configuring an iframe
     */
    async executeAction(action: HTMLAction, container: HTMLElement): Promise<HTMLIFrameElement> {
        this.validateAction(action);

        const iframe = this.createIframe(action);
        const finalUrl = await this.buildFinalUrl(action);

        iframe.src = finalUrl;
        container.appendChild(iframe);

        // Setup context sharing if enabled
        if (action.contextSharing?.enabled) {
            this.setupContextBridge(iframe, action.contextSharing);
        }

        return iframe;
    }

    /**
     * Cleanup an iframe and remove its context bridge
     */
    cleanup(iframe: HTMLIFrameElement): void {
        if (this.activeIframes.has(iframe)) {
            this.activeIframes.delete(iframe);
        }
        if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
    }

    /**
     * Cleanup all active iframes
     */
    cleanupAll(): void {
        for (const iframe of this.activeIframes.keys()) {
            this.cleanup(iframe);
        }
    }

    /**
     * Validate the HTML action configuration
     */
    private validateAction(action: HTMLAction): void {
        if (!action.url) {
            throw new ActionValidationError('HTML action must have a valid URL');
        }

        if (action.contextSharing?.enabled) {
            if (!this.contextProvider) {
                throw new ActionValidationError('Context provider is required for context sharing');
            }

            if (!action.contextSharing.allowedOrigins?.length) {
                throw new ActionValidationError(
                    'Allowed origins must be specified for context sharing',
                );
            }
        }
    }

    /**
     * Create and configure the iframe element
     */
    private createIframe(action: HTMLAction): HTMLIFrameElement {
        const iframe = document.createElement('iframe');

        // Basic configuration
        iframe.style.border = 'none';
        iframe.style.width = action.width ? `${action.width}px` : '100%';
        iframe.style.height = action.height ? `${action.height}px` : '400px';

        // Fullscreen support
        if (action.fullscreen) {
            iframe.allowFullscreen = true;
            iframe.style.position = 'fixed';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.zIndex = '9999';
        }

        // Security configuration
        const sandboxPermissions = ['allow-scripts', 'allow-same-origin'];

        if (action.contextSharing?.enabled) {
            // Add permissions needed for postMessage communication
            sandboxPermissions.push('allow-forms');
        }

        iframe.sandbox = sandboxPermissions.join(' ');

        return iframe;
    }

    /**
     * Build the final URL with context parameters if auto-injection is enabled
     */
    private async buildFinalUrl(action: HTMLAction): Promise<string> {
        let finalUrl = action.url;

        if (
            action.contextSharing?.enabled &&
            action.contextSharing.autoInject &&
            this.contextProvider
        ) {
            const urlParams = new URLSearchParams();

            for (const dataType of action.contextSharing.provides) {
                const value = await this.getContextValue(dataType);
                if (value !== null) {
                    urlParams.set(dataType, value);
                }
            }

            if (urlParams.toString()) {
                const separator = finalUrl.includes('?') ? '&' : '?';
                finalUrl += separator + urlParams.toString();
            }
        }

        return finalUrl;
    }

    /**
     * Setup context bridge for an iframe
     */
    private setupContextBridge(iframe: HTMLIFrameElement, contextConfig: ContextSharing): void {
        this.activeIframes.set(iframe, contextConfig);
    }

    /**
     * Setup global message listener for all iframes
     */
    private setupGlobalMessageListener(): void {
        window.addEventListener('message', async event => {
            // Find the iframe that sent this message
            const iframe = this.findIframeBySource(event.source as Window);
            if (!iframe) return;

            const contextConfig = this.activeIframes.get(iframe);
            if (!contextConfig) return;

            // Validate origin
            if (!this.isAllowedOrigin(event.origin, contextConfig.allowedOrigins)) {
                console.warn(`Sherry SDK: Message from unauthorized origin: ${event.origin}`);
                return;
            }

            // Handle context requests
            if (event.data?.type === 'SHERRY_REQUEST') {
                await this.handleContextRequest(event, iframe, contextConfig);
            }
        });
    }

    /**
     * Handle context data requests from embedded content
     */
    private async handleContextRequest(
        event: MessageEvent,
        iframe: HTMLIFrameElement,
        contextConfig: ContextSharing,
    ): Promise<void> {
        const requestedData = event.data.data as ContextData;
        const requestId = event.data.requestId;

        // Validate that the requested data is allowed
        if (!contextConfig.provides.includes(requestedData)) {
            this.sendErrorResponse(
                iframe,
                requestId,
                `Data type '${requestedData}' is not allowed`,
            );
            return;
        }

        try {
            const value = await this.getContextValue(requestedData);
            this.sendSuccessResponse(iframe, requestId, requestedData, value);
        } catch (error) {
            this.sendErrorResponse(iframe, requestId, `Failed to get ${requestedData}: ${error}`);
        }
    }

    /**
     * Get context value from the provider
     */
    private async getContextValue(dataType: ContextData): Promise<string | null> {
        if (!this.contextProvider) return null;

        switch (dataType) {
            case 'userAddress':
                return await this.contextProvider.getUserAddress();
            case 'chainId':
                const chainId = await this.contextProvider.getChainId();
                return chainId ? chainId.toString() : null;
            case 'balance':
                return await this.contextProvider.getBalance();
            case 'networkName':
                return await this.contextProvider.getNetworkName();
            case 'ensName':
                return await this.contextProvider.getEnsName();
            default:
                return null;
        }
    }

    /**
     * Send successful response to embedded content
     */
    private sendSuccessResponse(
        iframe: HTMLIFrameElement,
        requestId: string,
        dataType: string,
        value: any,
    ): void {
        if (!iframe.contentWindow) return;

        iframe.contentWindow.postMessage(
            {
                type: 'SHERRY_RESPONSE',
                requestId,
                success: true,
                dataType,
                value,
            },
            '*',
        );
    }

    /**
     * Send error response to embedded content
     */
    private sendErrorResponse(iframe: HTMLIFrameElement, requestId: string, error: string): void {
        if (!iframe.contentWindow) return;

        iframe.contentWindow.postMessage(
            {
                type: 'SHERRY_RESPONSE',
                requestId,
                success: false,
                error,
            },
            '*',
        );
    }

    /**
     * Find iframe by its content window
     */
    private findIframeBySource(source: Window): HTMLIFrameElement | null {
        for (const iframe of this.activeIframes.keys()) {
            if (iframe.contentWindow === source) {
                return iframe;
            }
        }
        return null;
    }

    /**
     * Check if origin is in the allowed list
     */
    private isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
        return allowedOrigins.some(allowed => {
            // Exact match
            if (allowed === origin) return true;

            // Wildcard subdomain match (*.example.com)
            if (allowed.startsWith('*.')) {
                const domain = allowed.slice(2);
                return (
                    origin.endsWith(`.${domain}`) ||
                    origin === `https://${domain}` ||
                    origin === `http://${domain}`
                );
            }

            return false;
        });
    }
}

/**
 * Client-side helper for embedded content to communicate with Sherry
 */
export const SherryContextAPI = {
    /**
     * Request context data from the parent Sherry application
     */
    requestData: (dataType: ContextData): Promise<any> => {
        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36).substring(2, 15);

            const messageHandler = (event: MessageEvent) => {
                if (event.data?.type === 'SHERRY_RESPONSE' && event.data?.requestId === requestId) {
                    window.removeEventListener('message', messageHandler);

                    if (event.data.success) {
                        resolve(event.data.value);
                    } else {
                        reject(new Error(event.data.error));
                    }
                }
            };

            window.addEventListener('message', messageHandler);

            // Send request to parent
            window.parent.postMessage(
                {
                    type: 'SHERRY_REQUEST',
                    requestId,
                    data: dataType,
                },
                '*',
            );

            // Timeout after 5 seconds
            setTimeout(() => {
                window.removeEventListener('message', messageHandler);
                reject(new Error('Request timeout'));
            }, 5000);
        });
    },
};
