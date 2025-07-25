# Sherry SDK

[![npm version](https://img.shields.io/npm/v/@sherrylinks/sdk.svg)](https://www.npmjs.com/package/@sherrylinks/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6%2B-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green)](https://jestjs.io/)

A powerful TypeScript SDK for building interactive Web3 mini-apps that can be embedded within social media posts and platforms. Transform any post into an interactive dApp that allows users to swap tokens, vote on proposals, mint NFTs, and more - all without leaving their social media feed.

## Features

- **Multi-chain Support**: Ethereum, Avalanche, Celo, Base, and more
- **Action Types**:
  - Transfer actions for token transfers
  - Blockchain actions for smart contract interactions
  - Dynamic actions for server-side logic
  - Nested action flows for multi-step processes
- **Built-in Validation**: Comprehensive type checking and security validation
- **TypeScript First**: Full type safety with comprehensive definitions
- **Cross-chain Support**: Enable transactions across multiple blockchains
- **Rich Parameters**: Select dropdowns, radio buttons, text inputs, and file uploads
- **Developer Tools**: Built-in debugging and validation utilities

## Installation

```bash
npm install @sherrylinks/sdk viem
# or
yarn add @sherrylinks/sdk viem
```

**Note**: `viem` is a peer dependency and must be installed separately.

## Quick Start

### Basic Transfer Action

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

const metadata: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Send AVAX',
  description: 'Quick AVAX transfer',
  actions: [
    {
      type: 'transfer',
      label: 'Send 0.1 AVAX',
      description: 'Transfer 0.1 AVAX to recipient',
      to: '0x1234567890123456789012345678901234567890',
      amount: 0.1,
      chains: { source: 43114 },
    },
  ],
};

const validatedMetadata = createMetadata(metadata);
```

### Blockchain Action

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

const metadata: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Approve USDC',
  description: 'Approve USDC spending',
  actions: [
    {
      type: 'blockchain',
      label: 'Approve USDC',
      description: 'Approve contract to spend USDC',
      address: '0xA0b86a33E6417C8D7648D5b1D6fF0F6dB6c15b2a',
      abi: [
        /* contract ABI */
      ],
      functionName: 'approve',
      chains: { source: 1 },
      params: [
        {
          name: 'spender',
          type: 'address',
          value: '0xSpenderAddress',
          fixed: true,
        },
        {
          name: 'amount',
          type: 'number',
          label: 'Amount',
          required: true,
        },
      ],
    },
  ],
};

const validatedMetadata = createMetadata(metadata);
```

## Action Types

### Transfer Actions

Send native tokens with customizable parameters:

- Fixed or user-configurable amounts
- Support for all major chains
- Built-in validation

### Blockchain Actions

Direct smart contract interactions:

- Call any contract function
- Rich parameter configuration
- Support for all Solidity types
- Automatic ABI validation

### HTTP Actions

Server-side processing with REST endpoints:

- Custom business logic
- Form submissions
- External API integrations
- Rich parameter types (select, radio, textarea, file upload)

### Dynamic Actions

Advanced server-side processing:

- Complex calculations
- Real-time data processing
- External service integrations

### Action Flows

Multi-step interactive experiences:

- Conditional branching
- Decision points
- Progress tracking
- Completion states

## Supported Chains

- **Ethereum Mainnet**
- **Ethereum Sepolia** (testnet)
- **Avalanche C-Chain**
- **Avalanche Fuji** (testnet)
- **Celo Mainnet**
- **Celo Alfajores** (testnet)
- **Base Mainnet**
- **Base Sepolia** (testnet)
- **Mantle Mainnet**
- **Mantle Sepolia** (testnet)

## Validation

The SDK provides comprehensive validation:

```typescript
import { validateMetadata } from '@sherrylinks/sdk';

const result = validateMetadata(metadata);

if (result.isValid) {
  console.log('Metadata is valid:', result.type);
} else {
  console.error('Validation errors:', result.errors);
}
```

## Template Helpers

The SDK provides template helpers for common parameter types:

```typescript
import { createParameter, PARAM_TEMPLATES } from '@sherrylinks/sdk';

const emailParam = createParameter(PARAM_TEMPLATES.EMAIL, {
  name: 'email',
  label: 'Your Email',
  required: true,
});

const tokenParam = createParameter(PARAM_TEMPLATES.TOKEN_SELECT, {
  name: 'token',
  label: 'Select Token',
  options: [
    { label: 'USDC', value: 'usdc' },
    { label: 'DAI', value: 'dai' },
  ],
});
```

## API Reference

### Core Functions

- `createMetadata(metadata)` - Validates and processes metadata
- `validateMetadata(input)` - Validates metadata and returns detailed results

### Type Guards

- `isBlockchainActionMetadata(action)` - Type guard for blockchain actions
- `isTransferAction(action)` - Type guard for transfer actions
- `isHttpAction(action)` - Type guard for HTTP actions
- `isActionFlow(obj)` - Type guard for nested action flows

### Parameter Helpers

- `createParameter(template, customizations)` - Helper for parameter creation
- `PARAM_TEMPLATES` - Library of predefined parameter templates

## Development

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Build the package
yarn build

# Lint code
yarn lint
```

## Examples

The SDK includes comprehensive examples in the `src/examples` directory:

- Basic transfer actions
- Smart contract interactions
- HTTP actions with forms
- Multi-step action flows

## Resources

- **[Documentation](https://docs.sherry.social)** - Complete guides and API reference
- **[Debugger Tool](https://app.sherry.social/debugger)** - Interactive testing environment
- **[Discord](https://discord.gg/69brTf6J)** - Community support
- **[GitHub Issues](https://github.com/SherryLabs/sherry-sdk/issues)** - Bug reports and feature requests

## Contributing

Contributions are welcome! Please submit a Pull Request.

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes
4. Add tests if applicable
5. Open a Pull Request to the `develop` branch

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [Sherry Platform](https://sherry.social) - Live platform and mini-app gallery
- [Documentation](https://docs.sherry.social) - Complete developer documentation
- [npm Package](https://www.npmjs.com/package/@sherrylinks/sdk) - Package registry
