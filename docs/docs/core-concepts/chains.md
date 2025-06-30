---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/chains.md
sidebar_position: 6
---

# Multi-Chain Support

The Sherry SDK is built from the ground up to support multiple blockchain networks. Whether you're building for a single chain or creating cross-chain experiences, the SDK provides seamless integration across all supported networks.

## Chain Configuration

Every action in the Sherry SDK must specify which blockchain(s) it operates on using the `chains` property. This ensures transactions are sent to the correct network and enables cross-chain functionality.

### ChainContext Interface

```typescript
interface ChainContext {
  source: Chain | number; // Primary blockchain for the action
  destination?: Chain | number; // Target chain for cross-chain operations
}

// Supported chain identifiers
type Chain = 'avalanche' | 'fuji' | 'celo' | 'alfajores' | 'ethereum' | 'sepolia';

// Or use numeric chain IDs directly
const chainIds = {
  avalanche: 43114, // Avalanche C-Chain Mainnet
  fuji: 43113, // Avalanche Fuji Testnet
  celo: 42220, // Celo Mainnet
  alfajores: 44787, // Celo Alfajores Testnet
  ethereum: 1, // Ethereum Mainnet
  sepolia: 11155111, // Ethereum Sepolia Testnet
};
```

### Flexible Chain Specification

You can specify chains using either string names or numeric chain IDs:

```typescript
// Using chain names (recommended)
chains: {
  source: 'avalanche';
}

// Using chain IDs
chains: {
  source: 43114;
}

// Both approaches are equivalent
```

## Supported Networks

### Mainnets

**Avalanche C-Chain (`avalanche` / `43114`)**

- Native token: AVAX
- High throughput, low fees
- EVM-compatible with robust DeFi ecosystem
- Ideal for: DeFi applications, NFT marketplaces, gaming

**Celo (`celo` / `42220`)**

- Native token: CELO
- Mobile-first blockchain focused on financial inclusion
- Carbon-negative network with strong sustainability focus
- Ideal for: Payment apps, mobile DeFi, social impact projects

**Ethereum (`ethereum` / `1`)**

- Native token: ETH
- The original smart contract platform
- Largest DeFi and NFT ecosystem
- Ideal for: DeFi protocols, NFT collections, DAO governance

### Testnets

**Fuji (`fuji` / `43113`)**

- Avalanche's primary testnet
- Perfect mirror of mainnet functionality
- Free AVAX from faucets for testing

**Alfajores (`alfajores` / `44787`)**

- Celo's testnet environment
- Full feature parity with Celo mainnet
- Free tokens available for development

**Sepolia (`sepolia` / `11155111`)**

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
  chains: { source: 'avalanche' }, // or 43114
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
  chains: { source: 'celo' }, // or 42220
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
  chains: { source: 'ethereum' }, // or 1
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
    source: 'avalanche', // Transaction happens on Avalanche
    destination: 'celo', // Assets arrive on Celo
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
    source: 'ethereum', // Vote initiated on Ethereum
    destination: 'avalanche', // Vote counted on Avalanche
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
  source: 'fuji';
} // Test on Fuji first
chains: {
  source: 'alfajores';
} // Test Celo features
chains: {
  source: 'sepolia';
} // Test Ethereum integration

// Production
chains: {
  source: 'avalanche';
} // Deploy to mainnet
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
  chains: { source: 'avalanche' },
  // Include chain-specific error handling in your backend
  address: getContractAddress('avalanche'), // Dynamic address selection
  abi: contractAbi,
  functionName: 'execute',
};

function getContractAddress(chain: string): string {
  const addresses = {
    avalanche: '0xMainnetContract',
    fuji: '0xTestnetContract',
    celo: '0xCeloContract',
    alfajores: '0xCeloTestContract',
  };
  return addresses[chain] || addresses.avalanche;
}
```

### Testing Across Chains

1. **Start with testnets:** Always test on Fuji, Alfajores, or Sepolia first
2. **Use small amounts:** Test with minimal token amounts initially
3. **Verify addresses:** Ensure contract addresses are correct for each chain
4. **Test edge cases:** Handle network congestion and failed transactions
5. **Monitor gas costs:** Different chains have different fee structures

## Upcoming Networks

The Sherry SDK is designed to easily add new blockchain networks. Future additions may include:

- **Polygon:** High-performance Ethereum scaling solution
- **Arbitrum:** Optimistic rollup for Ethereum
- **Base:** Coinbase's Ethereum L2 solution
- **Optimism:** Another popular Ethereum L2

Stay tuned for announcements about new chain support!
