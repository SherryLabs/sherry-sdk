import {
    Chain as ChainViem,
    avalanche,
    avalancheFuji,
    celo,
    celoAlfajores,
    mainnet,
    sepolia,
    mantle,
    mantleSepoliaTestnet,
    base,
    baseSepolia,
} from 'viem/chains';

// Custom chain definition for Soshi L1 Testnet (not available in viem)
const soshiL1Testnet: ChainViem = {
    id: 3278,
    name: 'Soshi L1 Testnet',
    nativeCurrency: {
        name: 'Soshi',
        symbol: 'SOSHI',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://subnets.avax.network/soshi/testnet/rpc'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Soshi Explorer',
            url: 'https://subnets.avax.network/soshi/testnet',
        },
    },
    testnet: true,
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 0,
        },
    },
};

export const VALID_CHAIN_IDS = [
    mainnet.id, // Ethereum Mainnet
    sepolia.id, // Sepolia Testnet
    avalanche.id, // Avalanche C-Chain
    avalancheFuji.id, // Avalanche Fuji Testnet
    celo.id, // Celo Mainnet
    celoAlfajores.id, // Celo Alfajores Testnet
    mantle.id, // Mantle Mainnet
    mantleSepoliaTestnet.id, // Mantle Sepolia Testnet
    base.id, // Base Mainnet
    baseSepolia.id, // Base Sepolia Testnet
    soshiL1Testnet.id, // Soshi L1 Testnet
];

export type ChainId = (typeof VALID_CHAIN_IDS)[number];

export const CHAIN_INFO: Record<ChainId, ChainViem> = {
    1: mainnet,
    11155111: sepolia,
    43114: avalanche,
    43113: avalancheFuji,
    42220: celo,
    44787: celoAlfajores,
    5000: mantle, // Mantle Mainnet
    5003: mantleSepoliaTestnet, // Mantle Sepolia Testnet
    8453: base, // Base Mainnet
    84532: baseSepolia, // Base Sepolia Testnet
    3278: soshiL1Testnet, // Soshi L1 Testnet
};

// Chain name mappings for validation (supports both modern and legacy names)
export const CHAIN_NAME_TO_ID: Record<string, ChainId> = {
    // Main names
    Ethereum: 1,
    'Ethereum Mainnet': 1,
    Sepolia: 11155111,
    'Sepolia Testnet': 11155111,
    Avalanche: 43114,
    'Avalanche C-Chain': 43114,
    'Avalanche Fuji': 43113,
    'Avalanche Fuji Testnet': 43113,
    Celo: 42220,
    'Celo Mainnet': 42220,
    'Celo Alfajores': 44787,
    'Celo Alfajores Testnet': 44787,
    Mantle: 5000,
    'Mantle Mainnet': 5000,
    'Mantle Sepolia Testnet': 5003,
    MantleSepoliaTestnet: 5003,
    Base: 8453,
    'Base Mainnet': 8453,
    'Base Sepolia Testnet': 84532,
    baseSepolia: 84532,
    'Soshi L1 Testnet': 3278,
    Soshi: 3278,
    // Legacy names (lowercase) - deprecated, use chain IDs instead
    ethereum: 1,
    sepolia: 11155111,
    avalanche: 43114,
    fuji: 43113,
    celo: 42220,
    alfajores: 44787,
};

export const CHAIN_ID_TO_NAME: Record<ChainId, string> = {
    1: 'Ethereum',
    11155111: 'Sepolia',
    43114: 'Avalanche',
    43113: 'Avalanche Fuji',
    42220: 'Celo',
    44787: 'Celo Alfajores',
    5000: 'Mantle',
    5003: 'Mantle Sepolia Testnet',
    8453: 'Base',
    84532: 'Base Sepolia Testnet',
    3278: 'Soshi L1 Testnet',
};

// Deprecated: Legacy chain names - use chain IDs instead
export const LEGACY_CHAIN_NAMES = [
    'fuji',
    'avalanche',
    'alfajores',
    'celo',
    'ethereum',
    'sepolia',
    'mantle',
    'mantleSepoliaTestnet',
    'base',
    'baseSepolia',
] as const;

export type LegacyChainName = (typeof LEGACY_CHAIN_NAMES)[number];

export const LEGACY_TO_CHAIN_ID: Record<LegacyChainName, ChainId> = {
    ethereum: 1,
    sepolia: 11155111,
    avalanche: 43114,
    fuji: 43113,
    celo: 42220,
    alfajores: 44787,
    mantle: 5000,
    mantleSepoliaTestnet: 5003,
    base: 8453,
    baseSepolia: 84532,
};

export const CHAIN_ID_TO_LEGACY: Record<ChainId, LegacyChainName> = {
    1: 'ethereum',
    11155111: 'sepolia',
    43114: 'avalanche',
    43113: 'fuji',
    42220: 'celo',
    44787: 'alfajores',
    5000: 'mantle',
    5003: 'mantleSepoliaTestnet',
    8453: 'base',
    84532: 'baseSepolia',
};

export interface ChainContext {
    source: ChainId;
    destination?: ChainId;
}

// Deprecated: Use ChainContext with chain IDs instead
export interface LegacyChainContext {
    source: LegacyChainName;
    destination?: LegacyChainName;
}

/**
 * Check if a chain is supported by name
 * @param chain - The chain name to validate
 * @returns boolean indicating if the chain is supported
 */
export function isChainSupported(chain: string): boolean {
    return chainUtils.isValidChainName(chain);
}

/**
 * Get complete chain information by chain name or chain ID
 * @param identifier - Chain name (string) or chain ID (number)
 * @returns Chain information from viem/chains or undefined if not supported
 */
export function getChainInfo(identifier: string | number): ChainViem | undefined {
    if (typeof identifier === 'string') {
        const chainId = chainUtils.getChainIdByName(identifier);
        return chainId ? CHAIN_INFO[chainId] : undefined;
    } else {
        return chainUtils.isValidChainId(identifier) ? CHAIN_INFO[identifier] : undefined;
    }
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

    /**
     * Validate if a chain name is supported by Sherry
     * @param chainName - The chain name to validate (e.g., "Avalanche Fuji", "Ethereum")
     * @returns boolean indicating if the chain is supported
     */
    isValidChainName(chainName: string): boolean {
        return chainName in CHAIN_NAME_TO_ID;
    },

    /**
     * Get chain ID from chain name
     * @param chainName - The chain name (e.g., "Avalanche Fuji", "Ethereum")
     * @returns ChainId if valid, undefined if not supported
     */
    getChainIdByName(chainName: string): ChainId | undefined {
        return CHAIN_NAME_TO_ID[chainName];
    },

    /**
     * Get chain name from chain ID
     * @param chainId - The chain ID
     * @returns Chain name if valid, undefined if not supported
     */
    getChainNameById(chainId: ChainId): string | undefined {
        return CHAIN_ID_TO_NAME[chainId];
    },

    /**
     * Get all supported chain names
     * @returns Array of all supported chain names
     */
    getSupportedChainNames(): string[] {
        return Object.keys(CHAIN_NAME_TO_ID);
    },

    /**
     * Validate chain by name or ID
     * @param identifier - Chain name (string) or chain ID (number)
     * @returns boolean indicating if the chain is supported
     */
    isChainSupported(identifier: string | number): boolean {
        if (typeof identifier === 'string') {
            return this.isValidChainName(identifier);
        } else {
            return this.isValidChainId(identifier);
        }
    },

    /**
     * Get complete chain information by name or ID
     * @param identifier - Chain name (string) or chain ID (number)
     * @returns Chain information from viem/chains or undefined if not supported
     */
    getCompleteChainInfo(identifier: string | number): ChainViem | undefined {
        if (typeof identifier === 'string') {
            const chainId = this.getChainIdByName(identifier);
            return chainId ? CHAIN_INFO[chainId] : undefined;
        } else {
            return this.isValidChainId(identifier) ? CHAIN_INFO[identifier] : undefined;
        }
    },
};
