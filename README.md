# Sherry SDK

[![npm version](https://img.shields.io/npm/v/@sherrylinks/sdk.svg)](https://www.npmjs.com/package/@sherrylinks/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6%2B-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green)](https://jestjs.io/)

A powerful TypeScript SDK for building interactive Web3 mini-apps that can be embedded within social media posts and platforms. Transform any post into an interactive dApp that allows users to swap tokens, vote on proposals, mint NFTs, and more - all without leaving their social media feed.

> **🆕 Recent Updates**: Enhanced support for the `'sender'` keyword in both Transfer and Blockchain actions, allowing automatic resolution to the user's address at runtime.

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
      to: '0x1234567890123456789012345678901234567890', // or 'sender' to send to user
      amount: 0.1,
      chains: { source: 43114 }, // Avalanche C-Chain
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
          label: 'Spender Address',
          type: 'address',
          value: '0xSpenderAddress',
          fixed: true,
        },
        {
          name: 'amount',
          label: 'Amount to Approve',
          type: 'number',
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
- Support for `'sender'` keyword to auto-resolve to user's address
- Support for all major chains
- Built-in validation

```typescript
{
  type: 'transfer',
  label: 'Send to yourself',
  to: 'sender', // Special keyword - resolves to user's address
  amount: 1.0,
  chains: { source: 43114 }
}
```

### Blockchain Actions

Direct smart contract interactions:

- Call any contract function
- Rich parameter configuration
- Support for all Solidity types including `'sender'` for address parameters
- Automatic ABI validation

```typescript
// Address parameter can use 'sender' keyword
{
  name: 'to',
  label: 'Recipient',
  type: 'address',
  value: 'sender', // Resolves to msg.sender
  fixed: true
}
```

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
- **Soshi L1 Testnet** (custom subnet)

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

// Email parameter template
const emailParam = createParameter(PARAM_TEMPLATES.EMAIL, {
  name: 'email',
  label: 'Your Email',
  required: true,
});

// Token selection with predefined options
const tokenParam = createParameter(PARAM_TEMPLATES.TOKEN_SELECT, {
  name: 'token',
  label: 'Select Token',
  options: [
    { label: 'USDC', value: '0xA0b86a33E6417C8D7648D5b1D6fF0F6dB6c15b2a' },
    { label: 'DAI', value: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  ],
});

// Address parameter that accepts 'sender'
const recipientParam = createParameter(PARAM_TEMPLATES.ADDRESS, {
  name: 'to',
  label: 'Recipient Address',
  value: 'sender', // Special keyword for user's address
  required: true,
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
- `isDynamicAction(action)` - Type guard for dynamic actions

### Parameter Helpers

- `createParameter(template, customizations)` - Helper for parameter creation
- `PARAM_TEMPLATES` - Library of predefined parameter templates

### Types

- `AddressOrSender` - Type for addresses that accept either valid Ethereum addresses or `'sender'` keyword
- `TransferAction` - Enhanced transfer action interface with sender support
- `BlockchainAction` - Smart contract interaction with comprehensive validation

## Development

```bash
# Install dependencies
npm install
# or
yarn install

# Run tests
npm test
# or
yarn test

# Build the package
npm run build:all
# or
yarn build:all

# Lint code
npm run lint
# or
yarn lint
```

## Examples

The SDK includes comprehensive examples in the `src/examples` directory:

- **transfer-miniapps.ts** - Various transfer action patterns
- **example-miniapps.ts** - Smart contract interactions and complex examples
- **mixed-miniapp.ts** - HTTP, Transfer, and Blockchain actions combined
- **nested-actions.ts** - Multi-step action flows
- **dynamic-miniapp.ts** - Server-side dynamic actions

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
