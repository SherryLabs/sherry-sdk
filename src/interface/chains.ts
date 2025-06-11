import type {
    Chain as ChainViem,
    avalanche,
    avalancheFuji,
    celo,
    celoAlfajores,
    mainnet,
    sepolia,
} from 'viem/chains';

export const VALID_CHAINS = [
    'fuji',
    'avalanche',
    'alfajores',
    'celo',
    'ethereum',
    'sepolia',
] as const;

export type Chain = (typeof VALID_CHAINS)[number];

export interface ChainContext {
    source: Chain;
    destination?: Chain; // undefined para single-chain actions
}
