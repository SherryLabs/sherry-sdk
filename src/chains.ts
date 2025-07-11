// Re-export everything from chains interface
export * from './interface/chains';

// Re-export chains from viem
// Note: viem is now a peerDependency, so users must install it separately
// If viem is not installed, these imports will fail at runtime
export {
    mainnet,
    sepolia,
    avalanche,
    avalancheFuji,
    celo,
    celoAlfajores,
    mantle,
    mantleSepoliaTestnet,
    base,
    baseSepolia,
} from 'viem/chains';

// Export custom chains
export { soshiL1Testnet } from './interface/chains';
