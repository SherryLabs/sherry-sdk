---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/core-concepts/chains.md
sidebar_position: 6
---

# Multi-Chain Support

The Sherry SDK is built from the ground up to support multiple blockchain networks. Whether you're building for a single chain or creating cross-chain experiences, the SDK provides seamless integration across all supported networks.

## Chain Configuration

Every action in the Sherry SDK must specify which blockchain(s) it operates on using the `chains` property. This ensures transactions are sent to the correct network and enables cross-chain functionality.

### ChainContext Interface

```typescript
interface ChainContext {
  source: number; // Primary blockchain chain ID for the action
  destination?: number; // Target chain ID for cross-chain operations
}

// Supported chain IDs
const supportedChains = {
  43114: 'Avalanche C-Chain Mainnet',
  43113: 'Avalanche Fuji Testnet', 
  42220: 'Celo Mainnet',
  44787: 'Celo Alfajores Testnet',
  1: 'Ethereum Mainnet',
  11155111: 'Ethereum Sepolia Testnet'
};

type SupportedChainId = 43114 | 43113 | 42220 | 44787 | 1 | 11155111;
```

### Flexible Chain Specification

You must specify chains using numeric chain IDs:

```typescript
// Using chain IDs
chains: {
  source: 43114; // Avalanche C-Chain Mainnet
}

// For cross-chain operations
chains: {
  source: 43114, // Avalanche
  destination: 42220 // Celo
}
```

## Supported Networks

### Mainnets

**Avalanche C-Chain (Chain ID: `43114`)**

- Native token: AVAX
- High throughput, low fees
- EVM-compatible with robust DeFi ecosystem
- Ideal for: DeFi applications, NFT marketplaces, gaming

**Celo (Chain ID: `42220`)**

- Native token: CELO
- Mobile-first blockchain focused on financial inclusion
- Carbon-negative network with strong sustainability focus
- Ideal for: Payment apps, mobile DeFi, social impact projects

**Ethereum (Chain ID: `1`)**

- Native token: ETH
- The original smart contract platform
- Largest DeFi and NFT ecosystem
- Ideal for: DeFi protocols, NFT collections, DAO governance

### Testnets

**Fuji (Chain ID: `43113`)**

- Avalanche's primary testnet
- Perfect mirror of mainnet functionality
- Free AVAX from faucets for testing

**Alfajores (Chain ID: `44787`)**

- Celo's testnet environment
- Full feature parity with Celo mainnet
- Free tokens available for development

**Sepolia (Chain ID: `11155111`)**

- Ethereum's recommended testnet
- Proof-of-stake consensus matching mainnet
- Reliable and well-maintained testing environment

## Implementation Examples

### Single-Chain Operations

Most mini-apps operate on a single blockchain. Here are examples for each supported network:

#### Avalanche NFT Mint

```typescript
const nftMintAction = {
  type: 'blockchain',
  label: 'Mint NFT on Avalanche',
  address: '0x742d35Cc6734C0532925a3b8D4ccd306f6F4B26C',
  abi: nftAbi,
  functionName: 'mint',
  chains: { source: 43114 }, // Avalanche C-Chain
  amount: 0.1, // 0.1 AVAX mint fee
  params: [
    {
      name: 'to',
      label: 'Recipient Address',
      type: 'address',
      required: true,
    },
  ],
};
```

#### Celo Mobile Payment

```typescript
const paymentAction = {
  type: 'transfer',
  label: 'Send CELO Payment',
  chains: { source: 42220 }, // Celo Mainnet
  amountConfig: {
    type: 'select',
    options: [
      { label: '$1 USD', value: 0.5 }, // Approximate CELO amount
      { label: '$5 USD', value: 2.5 },
      { label: '$10 USD', value: 5.0 },
    ],
  },
  recipient: {
    type: 'select',
    options: [
      { label: 'Coffee Shop', value: '0x...' },
      { label: 'Local Store', value: '0x...' },
    ],
  },
};
```

#### Ethereum DeFi Interaction

```typescript
const defiAction = {
  type: 'blockchain',
  label: 'Stake ETH',
  address: '0xStakingContractAddress',
  abi: stakingAbi,
  functionName: 'stake',
  chains: { source: 1 }, // Ethereum Mainnet
  params: [
    {
      name: 'amount',
      label: 'Amount to Stake (ETH)',
      type: 'number',
      required: true,
      min: 0.01,
      max: 100,
    },
  ],
};
```

### Cross-Chain Operations

Cross-chain actions enable powerful interoperability between different networks:

#### Asset Bridge

```typescript
const bridgeAction = {
  type: 'blockchain',
  label: 'Bridge AVAX to Celo',
  address: '0xBridgeContractAvalanche',
  abi: bridgeAbi,
  functionName: 'initiateTransfer',
  chains: {
    source: 43114, // Transaction happens on Avalanche
    destination: 42220, // Assets arrive on Celo
  },
  params: [
    {
      name: 'amount',
      label: 'Amount to Bridge',
      type: 'number',
      required: true,
      min: 0.1,
    },
    {
      name: 'recipientAddress',
      label: 'Celo Recipient Address',
      type: 'address',
      required: true,
    },
  ],
};
```

#### Cross-Chain Governance

```typescript
const crossChainVote = {
  type: 'blockchain',
  label: 'Vote Across Chains',
  address: '0xGovernanceHub',
  abi: governanceAbi,
  functionName: 'submitCrossChainVote',
  chains: {
    source: 1, // Vote initiated on Ethereum
    destination: 43114, // Vote counted on Avalanche
  },
  params: [
    {
      name: 'proposalId',
      label: 'Proposal ID',
      type: 'number',
      required: true,
    },
    {
      name: 'support',
      label: 'Vote',
      type: 'radio',
      required: true,
      options: [
        { label: 'Yes', value: 1 },
        { label: 'No', value: 0 },
        { label: 'Abstain', value: 2 },
      ],
    },
  ],
};
```

## Development Best Practices

### Chain Selection Guidelines

**Use Testnets for Development**

```typescript
// Development
chains: {
  source: 43113;
} // Test on Fuji first
chains: {
  source: 44787;
} // Test Celo features
chains: {
  source: 11155111;
} // Test Ethereum integration

// Production
chains: {
  source: 43114;
} // Deploy to Avalanche mainnet
```

**Choose Chains Based on Use Case**

- **High-frequency trading, gaming:** Avalanche (fast, cheap)
- **Mobile payments, social impact:** Celo (mobile-optimized)
- **DeFi, established protocols:** Ethereum (largest ecosystem)

### Error Handling

```typescript
// Robust chain configuration with fallbacks
const robustAction = {
  type: 'blockchain',
  label: 'Multi-Chain Compatible Action',
  // Primary chain
  chains: { source: 43114 }, // Avalanche
  // Include chain-specific error handling in your backend
  address: getContractAddress(43114), // Dynamic address selection
  abi: contractAbi,
  functionName: 'execute',
};

function getContractAddress(chainId: number): string {
  const addresses = {
    43114: '0xMainnetContract', // Avalanche
    43113: '0xTestnetContract', // Fuji
    42220: '0xCeloContract', // Celo
    44787: '0xCeloTestContract', // Alfajores
  };
  return addresses[chainId] || addresses[43114];
}
```

### Testing Across Chains

1. **Start with testnets:** Always test on Fuji, Alfajores, or Sepolia first
2. **Use small amounts:** Test with minimal token amounts initially
3. **Verify addresses:** Ensure contract addresses are correct for each chain
4. **Test edge cases:** Handle network congestion and failed transactions
5. **Monitor gas costs:** Different chains have different fee structures

## Migration from Chain Names to Chain IDs

The Sherry SDK has transitioned from using string-based chain names to numeric chain IDs for better standardization and compatibility. This change provides several benefits:

### Benefits of Chain IDs

- **Standardization:** Chain IDs are industry-standard identifiers used across all blockchain tools
- **Compatibility:** Seamless integration with wallets, explorers, and other Web3 tools
- **Precision:** No ambiguity about which network is being referenced
- **Future-proofing:** Easier to add new networks without naming conflicts

### Chain ID Reference Table

| Network | Chain ID | Description |
|---------|----------|-------------|
| Ethereum Mainnet | `1` | The original Ethereum network |
| Ethereum Sepolia | `11155111` | Ethereum's recommended testnet |
| Avalanche C-Chain | `43114` | Avalanche mainnet |
| Avalanche Fuji | `43113` | Avalanche's testnet |
| Celo Mainnet | `42220` | Celo's main network |
| Celo Alfajores | `44787` | Celo's testnet |

### Quick Migration Guide

If you're updating existing code, here are the key changes:

```typescript
// Before (deprecated)
chains: { source: 'avalanche' }

// After (current)
chains: { source: 43114 }
```

```typescript
// Before (deprecated)
chains: { 
  source: 'ethereum',
  destination: 'celo'
}

// After (current)
chains: { 
  source: 1,
  destination: 42220
}
```

## Upcoming Networks

The Sherry SDK is designed to easily add new blockchain networks. Future additions may include:

- **Polygon (137):** High-performance Ethereum scaling solution
- **Arbitrum One (42161):** Optimistic rollup for Ethereum
- **Base (8453):** Coinbase's Ethereum L2 solution
- **Optimism (10):** Another popular Ethereum L2

Stay tuned for announcements about new chain support!
