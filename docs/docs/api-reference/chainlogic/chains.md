---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/chains.md
sidebar_position: 6
---

# Chains

The Sherry SDK is designed to be multi-chain. The `chains` property in `BlockchainAction` and `TransferAction` defines which blockchain(s) the action operates on.

## `ChainContext` Interface

```typescript
// src/interface/chains.ts
export interface ChainContext {
  source: Chain; // Chain where the transaction/action originates
  destination?: Chain; // Destination chain (only for cross-chain actions)
}

export type Chain = (typeof VALID_CHAINS)[number];

export const VALID_CHAINS = [
  'fuji', // Avalanche Fuji Testnet
  'avalanche', // Avalanche C-Chain Mainnet
  'alfajores', // Celo Alfajores Testnet
  'celo', // Celo Mainnet
  'ethereum', // Ethereum Mainnet
  'sepolia', // Ethereum Sepolia Testnet
] as const;
```

- `source`: The blockchain where the transaction will be sent or where the primary contract/asset resides. **Always required.**
- `destination` (Optional): If the action involves interaction between two chains (e.g., a bridge), this property indicates the target chain. If the action occurs entirely on a single chain, `destination` is omitted.

## Supported Chains

The chains currently defined in `VALID_CHAINS` are officially supported by the SDK for validation and potentially for execution (depending on the environment).

- `fuji` - Avalanche Fuji Testnet
- `avalanche` - Avalanche C-Chain Mainnet
- `alfajores` - Celo Alfajores Testnet
- `celo` - Celo Mainnet
- `ethereum` - Ethereum Mainnet
- `sepolia` - Ethereum Sepolia Testnet

## Examples

### Single-Chain Action (Avalanche)

```typescript
const approveAction: BlockchainActionMetadata = {
  // ... other properties ...
  chains: { source: 'avalanche' }, // Action happens only on Avalanche
  // ...
};

const simpleTransfer: TransferAction = {
  // ...
  chains: { source: 'fuji' }, // Transfer within Fuji
  // ...
};
```

### Single-Chain Action (Ethereum)

```typescript
const ethereumAction: BlockchainActionMetadata = {
  // ... other properties ...
  chains: { source: 'ethereum' }, // Action happens only on Ethereum Mainnet
  // ...
};

const sepoliaTransfer: TransferAction = {
  // ...
  chains: { source: 'sepolia' }, // Transfer within Sepolia testnet
  // ...
};
```

### Cross-Chain Action (Bridge from Avalanche to Celo)

```typescript
const bridgeAction: BlockchainActionMetadata = {
  label: 'Bridge AVAX to Celo',
  address: '0xBridgeContractOnAvalanche...',
  abi: bridgeAbi,
  functionName: 'bridgeTokens',
  // Transaction originates on Avalanche, logical destination is Celo
  chains: { source: 'avalanche', destination: 'celo' },
  params: [
    // ... params like token, amount, recipient on Celo, destinationChainId (Celo's ID) ...
  ],
};

const crossChainTransfer: TransferAction = {
  label: 'Send from Ethereum to Avalanche',
  // Transfer starts on Ethereum and goes to Avalanche
  chains: { source: 'ethereum', destination: 'avalanche' },
  // ... to, amount, etc.
};
```

**Note:** Actual support for executing cross-chain actions depends on the implementation of the underlying contract (`BlockchainAction`) or the service handling the `TransferAction`. The SDK provides the structure to define these interactions.
