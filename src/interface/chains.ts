import {
    Chain as ChainViem,
    avalanche,
    avalancheFuji,
    celo,
    celoAlfajores,
    mainnet,
    sepolia,
} from 'viem/chains';

export const VALID_CHAIN_IDS = [
    1, // Ethereum Mainnet
    11155111, // Sepolia Testnet
    43114, // Avalanche C-Chain
    43113, // Avalanche Fuji Testnet
    42220, // Celo Mainnet
    44787, // Celo Alfajores Testnet
];

export type ChainId = (typeof VALID_CHAIN_IDS)[number];

export const CHAIN_INFO: Record<ChainId, ChainViem> = {
    1: mainnet,
    11155111: sepolia,
    43114: avalanche,
    43113: avalancheFuji,
    42220: celo,
    44787: celoAlfajores,
};

export const LEGACY_CHAIN_NAMES = [
    'fuji',
    'avalanche',
    'alfajores',
    'celo',
    'ethereum',
    'sepolia',
] as const;

export type LegacyChainName = (typeof LEGACY_CHAIN_NAMES)[number];

export const LEGACY_TO_CHAIN_ID: Record<LegacyChainName, ChainId> = {
    ethereum: 1,
    sepolia: 11155111,
    avalanche: 43114,
    fuji: 43113,
    celo: 42220,
    alfajores: 44787,
};

export const CHAIN_ID_TO_LEGACY: Record<ChainId, LegacyChainName> = {
    1: 'ethereum',
    11155111: 'sepolia',
    43114: 'avalanche',
    43113: 'fuji',
    42220: 'celo',
    44787: 'alfajores',
};

export interface ChainContext {
    source: ChainId;
    destination?: ChainId;
}

export interface LegacyChainContext {
    source: LegacyChainName;
    destination?: LegacyChainName;
}

/**
 * Utility functions for chain operations
 */
export const chainUtils = {
    /**
     * Check if a chain ID is valid
     */
    isValidChainId(chainId: number): chainId is ChainId {
        return VALID_CHAIN_IDS.includes(chainId as ChainId);
    },

    /**
     * Get chain information by chain ID
     */
    getChainInfo(chainId: ChainId) {
        return CHAIN_INFO[chainId];
    },

    /**
     * Convert legacy chain name to chain ID
     */
    legacyToChainId(legacyName: LegacyChainName): ChainId {
        return LEGACY_TO_CHAIN_ID[legacyName];
    },

    /**
     * Convert chain ID to legacy name
     */
    chainIdToLegacy(chainId: ChainId): LegacyChainName {
        return CHAIN_ID_TO_LEGACY[chainId];
    },

    /**
     * Convert legacy context to modern context
     */
    convertLegacyContext(legacy: LegacyChainContext): ChainContext {
        return {
            source: LEGACY_TO_CHAIN_ID[legacy.source],
            destination: legacy.destination ? LEGACY_TO_CHAIN_ID[legacy.destination] : undefined,
        };
    },

    /**
     * Convert modern context to legacy context
     */
    convertToLegacyContext(modern: ChainContext): LegacyChainContext {
        return {
            source: CHAIN_ID_TO_LEGACY[modern.source],
            destination: modern.destination ? CHAIN_ID_TO_LEGACY[modern.destination] : undefined,
        };
    },

    /**
     * Check if a chain is a testnet
     */
    isTestnet(chainId: ChainId): boolean {
        return CHAIN_INFO[chainId].testnet ?? false;
    },

    /**
     * Get all mainnet chain IDs
     */
    getMainnetChains(): ChainId[] {
        return VALID_CHAIN_IDS.filter(id => !CHAIN_INFO[id].testnet);
    },

    /**
     * Get all testnet chain IDs
     */
    getTestnetChains(): ChainId[] {
        return VALID_CHAIN_IDS.filter(id => CHAIN_INFO[id].testnet);
    },
};
