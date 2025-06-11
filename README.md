# Sherry SDK

[![npm version](https://img.shields.io/npm/v/@sherrylinks/sdk.svg)](https://www.npmjs.com/package/@sherrylinks/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green)](https://jestjs.io/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue.svg)](https://github.com/SherryLabs/sherry-sdk)

## 🌟 Overview

<<<<<<< HEAD
Sherry SDK is a powerful toolkit for building interactive Web3 mini-apps that can be embedded within social media posts and platforms. The SDK enables developers to create rich, composable blockchain experiences without requiring users to leave their social media feed.
=======
Sherry SDK is a powerful toolkit for building interactive Web3 mini-apps that
can be embedded within social media posts and platforms. The SDK enables
developers to create rich, composable blockchain experiences without requiring
users to leave their social media feed.

> > > > > > > develop

With Sherry, you can transform any post into an interactive dApp that allows
users to swap tokens, vote on proposals, mint NFTs, sign transactions, and much
more - all with built-in validation and a unified experience across chains.

## ✨ Features

<<<<<<< HEAD

- 🔗 **Multi-chain Support**: Build once, deploy across Ethereum, Avalanche, Celo, and more
- 🧩 **Multiple Action Types**:
  - **Transfer Actions**: Native token transfers with customizable UIs
  - **Blockchain Actions**: Smart contract interactions with rich parameter configuration
  - **Dynamic Actions**: Server-side logic with HTTP endpoints
  - **Nested Action Flows**: Interactive multi-step processes with conditional paths
- 📋 **Built-in Validation**: Ensure your mini-apps are valid and well-formed before deployment
- ⚡ **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🔄 **Cross-chain Interactions**: Enable transactions across multiple blockchains
- 📊 **Rich Parameter Types**: Select dropdowns, radio buttons, text inputs, and more
- 💻 **Developer Tools**: Built-in metadata analysis and debugging utilities
- # 📱 **Responsive Design**: Mini-apps that work across all platforms and screen sizes
- 🔗 **Multi-chain Support**: Build once, deploy across Ethereum, Avalanche,
  Celo, and more
- 🧩 **Multiple Action Types**:
  - **Transfer Actions**: Native token transfers with customizable UIs
  - **Blockchain Actions**: Smart contract interactions with rich parameter
    configuration
  - **Dynamic Actions**: Server-side logic with HTTP endpoints
  - **Nested Action Flows**: Interactive multi-step processes with conditional
    paths
- 📋 **Built-in Validation**: Ensure your mini-apps are valid and well-formed
  before deployment
- ⚡ **Type Safety**: Full TypeScript support with comprehensive type
  definitions
- 🔄 **Cross-chain Interactions**: Enable transactions across multiple
  blockchains
- 📊 **Rich Parameter Types**: Select dropdowns, radio buttons, text inputs, and
  more
- 💻 **Developer Tools**: Built-in metadata analysis and debugging utilities
- 📱 **Responsive Design**: Mini-apps that work across all platforms and screen
  sizes
  > > > > > > > develop

## 📦 Installation

Install the SDK via npm or yarn:

```bash
# Using npm
npm install @sherrylinks/sdk

# Using yarn
yarn add @sherrylinks/sdk

# Using pnpm
pnpm add @sherrylinks/sdk
```

## 🚀 Quick Start

### Simple Token Transfer

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

// Create a simple AVAX transfer mini-app
const metadata: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Send AVAX',
  description: 'Quick AVAX transfer to support creators',
  actions: [
    {
      label: 'Send 0.1 AVAX',
      description: 'Transfer 0.1 AVAX to recipient',
      to: '0x1234567890123456789012345678901234567890',
      amount: 0.1,
      chains: { source: 'avalanche' },
    },
  ],
};

// Validate and process metadata
const validatedMetadata = createMetadata(metadata);
```

### Creator Tip with Amount Selection

```typescript
<<<<<<< HEAD
const creatorTipApp: Metadata = {
  url: 'https://creator-tips.example',
  icon: 'https://example.com/tip-icon.png',
  title: 'Support Creator',
  description: 'Show your support with AVAX tips',
=======
import { ActionFlow, createMetadata, Metadata } from '@sherrylinks/sdk';

// Create a flow with multiple steps and decision points
const swapFlow: ActionFlow = {
  type: 'flow',
  label: 'Token Swap',
  initialActionId: 'select-tokens',
>>>>>>> develop
  actions: [
    {
<<<<<<< HEAD
      label: 'Send Tip',
      to: '0xCreatorAddress123',
      chains: { source: 'avalanche' },
      amountConfig: {
        type: 'radio',
        label: 'Select tip amount',
        options: [
          { label: 'Coffee ☕', value: 0.01, description: '0.01 AVAX' },
          { label: 'Lunch 🍕', value: 0.05, description: '0.05 AVAX' },
          { label: 'Dinner 🍽️', value: 0.1, description: '0.1 AVAX' },
        ],
      },
=======
      id: 'select-tokens',
      type: 'http',
      label: 'Select Tokens',
      path: 'https://api.example.com/quote',
      params: [
        // Token selection parameters...
      ],
      nextActions: [{ actionId: 'review-quote' }],
    },

    // Step 2: Review and decide
    {
      id: 'review-quote',
      type: 'decision',
      label: 'Review Quote',
      title: 'Review Your Swap',
      options: [
        { label: 'Confirm', value: 'confirm', nextActionId: 'execute-swap' },
        { label: 'Cancel', value: 'cancel', nextActionId: 'cancelled' },
      ],
    },

    // Step 3: Execute swap
    {
      id: 'execute-swap',
      type: 'blockchain',
      label: 'Swap Tokens',
      address: '0xRouterAddress',
      // ... other blockchain action properties
      nextActions: [
        {
          actionId: 'success',
          conditions: [
            {
              field: 'lastResult.status',
              operator: 'eq',
              value: 'success',
            },
          ],
        },
        {
          actionId: 'failed',
          conditions: [
            {
              field: 'lastResult.status',
              operator: 'eq',
              value: 'error',
            },
          ],
        },
      ],
    },

    // Completion states
    {
      id: 'success',
      type: 'completion',
      label: 'Swap Complete',
      message: 'Your swap was successful!',
      status: 'success',
    },

    {
      id: 'failed',
      type: 'completion',
      label: 'Swap Failed',
      message: 'Your swap failed. Please try again.',
      status: 'error',
    },

    {
      id: 'cancelled',
      type: 'completion',
      label: 'Swap Cancelled',
      message: 'You cancelled the swap.',
      status: 'info',
>>>>>>> develop
    },
  ],
};
```

### Smart Contract Interaction

```typescript
const nftMintApp: Metadata = {
  url: 'https://nft-mint.example',
  icon: 'https://example.com/nft-icon.png',
  title: 'Mint NFT Collection',
  description: 'Mint your unique NFT from our collection',
  actions: [
    {
      type: 'blockchain',
      label: 'Mint NFT',
      address: '0xNFTContractAddress',
      abi: nftContractAbi,
      functionName: 'mint',
      chains: { source: 'avalanche' },
      amount: 0.1, // Mint cost
      params: [
        {
          name: 'to',
          label: 'Recipient Address',
          type: 'address',
          required: true,
          description: 'Address that will receive the NFT',
        },
        {
          name: 'tier',
          label: 'NFT Tier',
          type: 'select',
          required: true,
          options: [
            { label: 'Common 🥉', value: 'common' },
            { label: 'Rare 🥈', value: 'rare' },
            { label: 'Epic 🥇', value: 'epic' },
          ],
        },
      ],
    },
  ],
};
```

### Dynamic Action with Server Logic

```typescript
const dynamicApp: Metadata = {
  url: 'https://dynamic-app.example',
  icon: 'https://example.com/dynamic-icon.png',
  title: 'AI Token Optimizer',
  description: 'Get AI-powered recommendations for optimal token allocation',
  actions: [
    {
      type: 'dynamic',
      label: 'Optimize Portfolio',
      path: '/api/optimize-portfolio',
      chains: { source: 'avalanche' },
      params: [
        {
          name: 'amount',
          label: 'Investment Amount (USDC)',
          type: 'number',
          required: true,
          min: 100,
        },
        {
          name: 'riskTolerance',
          label: 'Risk Level',
          type: 'select',
          required: true,
          options: [
            { label: 'Conservative', value: 'low' },
            { label: 'Moderate', value: 'medium' },
            { label: 'Aggressive', value: 'high' },
          ],
        },
      ],
    },
  ],
};
```

## 🧩 Action Types

# <<<<<<< HEAD

### Blockchain Actions

Interact directly with smart contracts:

- Call any contract function
- Rich parameter configuration
- Support for all Solidity types
- Automatic gas estimation

### Dynamic Actions

Server-side processing with HTTP endpoints:

- Custom business logic
- External API integrations
- Real-time data processing
- Complex calculations and optimizations

### Nested Action Flows

Create multi-step interactive experiences:

- Conditional branching
- Decision points
- Progress tracking
- Completion states

## 🌐 Supported Chains

- **Ethereum Mainnet** (`ethereum`)
- **Avalanche C-Chain** (`avalanche`)
- **Avalanche Fuji Testnet** (`fuji`)
- **Celo Mainnet** (`celo`)
- **Celo Alfajores Testnet** (`alfajores`)

_More chains being added regularly_

## 📚 Live Examples

Check out real working examples across different complexity levels:

[**View All Examples →**](https://docs.sherry.social/docs/getting-started/examples)

## 🔧 Development Tools

### Sherry Debugger

Test and validate your mini-apps during development:

- **[Sherry Debugger](https://app.sherry.social/debugger)** - Interactive
  testing environment
- Real-time validation
- Parameter testing
- JSON and TypeScript input support

### Validation

```typescript
{
  label: 'Approve Token',
  address: '0xContractAddress',
  abi: [...],  // Contract ABI
  functionName: 'approve',
  chains: { source: 'avalanche' },
  params: [
    {
      name: 'spender',
      label: 'Spender Address',
      type: 'address',
      required: true,
      value: '0xSpenderAddress',
      fixed: true  // User cannot change this value
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
      min: 0
    }
  ]
}
```

> > > > > > > develop

### Transfer Actions

Send native tokens with customizable recipient and amount selection:

<<<<<<< HEAD

- Fixed or user-selectable recipients
- Predefined amounts or custom input
- Multiple payment options with descriptions

### Blockchain Actions

Interact directly with smart contracts:

- Call any contract function
- Rich parameter configuration
- Support for all Solidity types
- Automatic gas estimation

### Dynamic Actions

Server-side processing with HTTP endpoints:

- Custom business logic
- External API integrations
- Real-time data processing
- # Complex calculations and optimizations
- **[English Guide](https://docs.sherry.social/docs/guides/guide-en)** -
  Complete Next.js integration tutorial
- **[Spanish Guide](https://docs.sherry.social/docs/guides/guide-es)** - Guía
  completa en español para Next.js

  // Fixed recipient to: '0xRecipientAddress',

- **[Quick Start](https://docs.sherry.social/docs/getting-started/quickstart)** -
  5-minute setup
- **[Your First Mini App](https://docs.sherry.social/docs/getting-started/creatingminiapp)** -
  Step-by-step tutorial
- **[Core Concepts](https://docs.sherry.social/docs/core-concepts)** -
  Understanding the fundamentals

  // Fixed amount amount: 0.1,

  // Or let the user choose amountConfig: { type: 'radio', label: 'Donation
  Amount', options: [ { label: 'Small', value: 0.01 }, { label: 'Medium', value:
  0.05 }, { label: 'Large', value: 0.1 } ] } }

````
### HTTP Actions

- **🎨 NFT Collections** - Let users mint NFTs directly from social posts
- **🔄 Token Swaps** - Enable DeFi trading without leaving social media
- **🗳️ DAO Governance** - Streamline proposal voting and participation
- **💰 Creator Economy** - Direct support and tipping mechanisms
- **🏦 DeFi Integration** - Seamless access to lending, staking, and yield
  farming
- **🎮 Gaming** - In-game transactions and asset management
- **🏪 Commerce** - Crypto payments and NFT marketplace integration

```typescript
{
  label: 'Submit Feedback',
  path: 'https://api.example.com/feedback',
  params: [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true
    },
    {
      name: 'rating',
      label: 'Rating',
      type: 'select',
      required: true,
      options: [
        { label: '⭐', value: 1 },
        { label: '⭐⭐', value: 2 },
        { label: '⭐⭐⭐', value: 3 },
        { label: '⭐⭐⭐⭐', value: 4 },
        { label: '⭐⭐⭐⭐⭐', value: 5 }
      ]
    },
    {
      name: 'comment',
      label: 'Comments',
      type: 'textarea',
      required: false
    }
  ]
}
````

> > > > > > > develop

### Nested Action Flows

Create multi-step interactive experiences:

- Conditional branching
- Decision points
- Progress tracking
- Completion states

## 🌐 Supported Chains

- **Ethereum Mainnet** (`ethereum`)
- **Avalanche C-Chain** (`avalanche`)
- **Avalanche Fuji Testnet** (`fuji`)
- **Celo Mainnet** (`celo`)
- **Celo Alfajores Testnet** (`alfajores`)

_More chains being added regularly_

## 📚 Live Examples

Check out real working examples across different complexity levels:

[**View All Examples →**](https://docs.sherry.social/docs/getting-started/examples)

## 🔧 Development Tools

### Sherry Debugger

Test and validate your mini-apps during development:

- **[Sherry Debugger](https://app.sherry.social/debugger)** - Interactive testing environment
- Real-time validation
- Parameter testing
- JSON and TypeScript input support

### Validation

```typescript
import { validateMetadata } from '@sherrylinks/sdk';

const validationResult = validateMetadata(myMetadata);

if (validationResult.isValid) {
  console.log('✅ Metadata is valid');
} else {
  console.error('❌ Validation errors:', validationResult.errors);
}
```

## 📖 Complete Guides

### Next.js Integration

- **[English Guide](https://docs.sherry.social/docs/guides/guide-en)** - Complete Next.js integration tutorial
- **[Spanish Guide](https://docs.sherry.social/docs/guides/guide-es)** - Guía completa en español para Next.js

### Getting Started

- **[Quick Start](https://docs.sherry.social/docs/getting-started/quickstart)** - 5-minute setup
- **[Your First Mini App](https://docs.sherry.social/docs/getting-started/creatingminiapp)** - Step-by-step tutorial
- **[Core Concepts](https://docs.sherry.social/docs/core-concepts)** - Understanding the fundamentals

## 📊 SDK Stats

- **📦 Bundle Size**: ~50KB gzipped
- **🔧 Dependencies**: Minimal (viem, abitype)
- **🧪 Test Coverage**: >90%
- **📚 TypeScript**: 100% type coverage
- **⚡ Performance**: <100ms validation time

## 🎯 Popular Use Cases

- **🎨 NFT Collections** - Let users mint NFTs directly from social posts
- **🔄 Token Swaps** - Enable DeFi trading without leaving social media
- **🗳️ DAO Governance** - Streamline proposal voting and participation
- **💰 Creator Economy** - Direct support and tipping mechanisms
- **🏦 DeFi Integration** - Seamless access to lending, staking, and yield farming
- **🎮 Gaming** - In-game transactions and asset management
- **🏪 Commerce** - Crypto payments and NFT marketplace integration

## 🔧 Advanced Configuration

### Custom Parameter Templates

```typescript
import { createParameter, PARAM_TEMPLATES } from '@sherrylinks/sdk';

const customEmailParam = createParameter(PARAM_TEMPLATES.EMAIL, {
  name: 'userEmail',
  label: 'Your Email Address',
  required: true,
  description: 'We'll send updates about your transaction',
});
```

## 📖 API Reference

### Core Functions

- `createMetadata(metadata)` - Validates and processes metadata
- `validateMetadata(input)` - Validates metadata with detailed error reporting

### Type Guards

- `isBlockchainActionMetadata(action)` - Type guard for blockchain actions
- `isTransferAction(action)` - Type guard for transfer actions
- `isHttpAction(action)` - Type guard for HTTP actions
- `isActionFlow(obj)` - Type guard for nested action flows

### Helper Utilities

- `createParameter(template, customizations)` - Parameter creation helper
- `PARAM_TEMPLATES` - Library of predefined parameter templates

## 🧪 Development

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Run tests with coverage
yarn test --coverage

# Build the package
yarn build

# Start documentation server
<<<<<<< HEAD
cd docs && yarn start
=======
cd docs && yarn install && yarn start
>>>>>>> develop
```

## 🌍 Community & Support

<<<<<<< HEAD

- **[Documentation](https://docs.sherry.social)** - Complete guides and API reference
- **[Discord](https://discord.gg/69brTf6J)** - Community support and discussions
- # **[GitHub Issues](https://github.com/SherryLabs/sherry-sdk/issues)** - Bug reports and feature requests
- **[Documentation](https://docs.sherry.social)** - Complete guides and API
  reference
- **[Discord](https://discord.gg/69brTf6J)** - Community support and discussions
- **[GitHub Issues](https://github.com/SherryLabs/sherry-sdk/issues)** - Bug
  reports and feature requests
  > > > > > > > develop
- **[Twitter](https://x.com/sherryprotocol)** - Latest updates and announcements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. **Fork the repository.**

2. **Clone your fork and create a new branch from `develop`:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/sherry-sdk.git
   cd sherry-sdk
   git switch -c feature/amazing-feature develop
   ```

3. **Commit your changes:**

   ```bash
   # ...do your work...
   git add .
   git commit -m "feat: Add amazing feature"
   ```

4. **Push to your branch:**

   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request** to the `develop` branch.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for
details.

## 🔗 Links

<<<<<<< HEAD

- **[Sherry Platform](https://sherry.social)** - Live platform and mini-app gallery
- **[Documentation](https://docs.sherry.social)** - Complete developer documentation
- **[GitHub Repository](https://github.com/SherryLabs/sherry-sdk)** - Source code and issues
- # **[npm Package](https://www.npmjs.com/package/@sherrylinks/sdk)** - Package registry
- **[Sherry Platform](https://sherry.social)** - Live platform and mini-app
  gallery
- **[Documentation](https://docs.sherry.social)** - Complete developer
  documentation
- **[GitHub Repository](https://github.com/SherryLabs/sherry-sdk)** - Source
  code and issues
- **[npm Package](https://www.npmjs.com/package/@sherrylinks/sdk)** - Package
  registry
  > > > > > > > develop
