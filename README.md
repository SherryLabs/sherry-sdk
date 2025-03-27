# Sherry SDK

[![npm version](https://img.shields.io/npm/v/@sherrylinks/sdk.svg)](https://www.npmjs.com/package/@sherrylinks/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A powerful SDK for creating and validating metadata for blockchain interactions through Sherry Links.

## Overview

Sherry SDK provides a simple and flexible way to build mini-apps that can interact with multiple blockchains. It supports various types of actions including blockchain contract calls, token transfers, and HTTP requests, all with built-in validation and metadata management.

## Features

- 🔗 Multi-chain support (Avalanche, Celo, Monad, etc.)
- 🧩 Create blockchain mini-apps with minimal code
- 💸 Support for token transfers with configurable options
- 🌐 HTTP action support for API interactions
- ✅ Built-in validation for all metadata types
- 🔄 Cross-chain transaction support
- 📊 Metadata analysis tools

## Installation

Install the SDK via yarn or npm:

```bash
# Using yarn
yarn add @sherrylinks/sdk

# Using npm
npm install @sherrylinks/sdk
```

## Quick Start

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

// Create a simple blockchain interaction metadata
const metadata: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'My First Sherry App',
  description: 'A simple app to demonstrate the SDK',
  actions: [
    {
      label: 'Execute Action',
      address: '0xContractAddress',
      abi: [...],  // Your contract ABI
      functionName: 'myFunction',
      chains: { source: 'avalanche' }
    }
  ]
};

// Validate and process metadata
const validatedMetadata = createMetadata(metadata);
```

## Supported Chains

- Ethereum Mainnet (`ethereum`)
- Avalanche C-Chain (`avalanche`)
- Celo Mainnet (`celo`)
- Avalanche Fuji Testnet (`fuji`)
- Celo Alfajores Testnet (`alfajores`)
- Monad Testnet (`monad-testnet`)

## Action Types

### Blockchain Actions

Interact with smart contract functions:

```typescript
{
  label: 'Call Contract',
  address: '0xContractAddress',
  abi: [...],  // Contract ABI
  functionName: 'myFunction',
  chains: { source: 'avalanche' },
  params: [
    // Optional parameter definitions
  ]
}
```

### Transfer Actions

Send native tokens or assets:

```typescript
{
  label: 'Send Tokens',
  description: 'Transfer tokens to another address',
  to: '0xRecipientAddress',  // Or use recipient selection config
  amount: 0.1,  // Or use amount configuration
  chains: { source: 'avalanche' }
}
```

### HTTP Actions

Make API calls:

```typescript
{
  label: 'Fetch Data',
  endpoint: 'https://api.example.com/data',
  params: [
    {
      name: 'userId',
      label: 'User ID',
      type: 'text',
      required: true
    }
  ]
}
```

## Examples

Multiple examples are available in the SDK:

- Token Swap mini-app
- NFT Marketplace mini-app
- DAO Voting mini-app
- Fundraising mini-app
- Cross-chain Bridge mini-app
- Charity Donation mini-app
- Payment Splitting mini-app

Check the `src/examples` directory for complete implementations.

## API Reference

### Core Functions

- `createMetadata(metadata)`: Validates and processes metadata
- `validateMetadata(input)`: Validates metadata and returns detailed results

### Utility Functions

- `isBlockchainActionMetadata(action)`: Type guard for blockchain actions
- `isTransferAction(action)`: Type guard for transfer actions
- `isHttpAction(action)`: Type guard for HTTP actions
- `createParameter(template, customizations)`: Helper for parameter creation

## Development

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Build the package
yarn build

# Format code
yarn format
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
