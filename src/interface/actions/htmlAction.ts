import { BaseAction } from './action';

/**
 * Context data types that can be shared with embedded content
 */
export type ContextData = 'userAddress' | 'chainId' | 'balance' | 'networkName' | 'ensName';

/**
 * Configuration for context sharing with embedded content
 */
export interface ContextSharing {
    enabled: boolean;
    provides: ContextData[]; // What data the embed can request
    allowedOrigins: string[]; // Only these domains can request data
    autoInject?: boolean; // Automatically inject context in URL params
}

export interface HTMLAction extends BaseAction {
    type: 'html';
    label: string;
    url: string;
    width?: number;
    height?: number;
    fullscreen?: boolean;
    contextSharing?: ContextSharing;
}
