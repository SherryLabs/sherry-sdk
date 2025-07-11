# Sherry SDK

[![npm version](https://img.shields.io/npm/v/@sherrylinks/sdk.svg)](https://www.npmjs.com/package/@sherrylinks/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green)](https://jestjs.io/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue.svg)](https://github.com/SherryLabs/sherry-sdk)

## 🌟 Overview

Sherry SDK is a powerful toolkit for building interactive Web3 mini-apps that
can be embedded within social media posts and platforms. The SDK enables
developers to create rich, composable blockchain experiences without requiring
users to leave their social media feed.

With Sherry, you can transform any post into an interactive dApp that allows
users to swap tokens, vote on proposals, mint NFTs, sign transactions, and much
more - all with built-in validation and a unified experience across chains.

## ✨ Features

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

## 📦 Installation

Install the SDK via npm or yarn:

```bash
# Using npm
npm install @sherrylinks/sdk

# Using yarn
yarn add @sherrylinks/sdk
```

## 🚀 Quick Start

### Basic Mini-App

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

// Create a simple token transfer metadata
const metadata: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Send AVAX',
  description: 'Quick AVAX transfer',
  actions: [
    {
      label: 'Send 0.1 AVAX',
      description: 'Transfer 0.1 AVAX to recipient',
      to: '0x1234567890123456789012345678901234567890',
      amount: 0.1,
      chains: { source: 43114 },
    },
  ],
};

// Validate and process metadata
const validatedMetadata = createMetadata(metadata);
```

### Nested Action Flow

```typescript
import { ActionFlow, createMetadata, Metadata } from '@sherrylinks/sdk';

// Create a flow with multiple steps and decision points
const swapFlow: ActionFlow = {
  type: 'flow',
  label: 'Token Swap',
  initialActionId: 'select-tokens',
  actions: [
    // Step 1: Select tokens and amount
    {
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
    },
  ],
};

// Add to metadata
const flowMetadata: Metadata = {
  url: 'https://swap.example',
  icon: 'https://example.com/swap-icon.png',
  title: 'Advanced Token Swap',
  description: 'Swap tokens with our guided flow',
  actions: [swapFlow],
};

// Validate and process
const validatedFlow = createMetadata(flowMetadata);
```

## 🧩 Action Types

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
  chains: { source: 43114 },
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

### Transfer Actions

Send native tokens or assets:

- **[English Guide](https://docs.sherry.social/docs/guides/guide-en)** -
  Complete Next.js integration tutorial
- **[Spanish Guide](https://docs.sherry.social/docs/guides/guide-es)** - Guía
  completa en español para Next.js

  // Fixed recipient to: '0xRecipientAddress',

- **[Quick Start](https://docs.sherry.social/docs/getting-started/quickstart)** -
  5-minute setup
- **[Your First Trigger](https://docs.sherry.social/docs/getting-started/creatingminiapp)** -
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

### Nested Action Flows

Create interactive, multi-step experiences with conditional paths:

```typescript
{
  type: 'flow',
  label: 'DAO Voting',
  initialActionId: 'select-proposal',
  actions: [
    // Each step in the flow...
    {
      id: 'select-proposal',
      type: 'http',
      label: 'Select Proposal',
      // ... properties for this step
      nextActions: [
        { actionId: 'next-step' }
      ]
    },
    // Decision points with multiple paths
    {
      id: 'vote-decision',
      type: 'decision',
      label: 'Cast Vote',
      title: 'How do you vote?',
      options: [
        { label: 'Yes', value: true, nextActionId: 'submit-yes-vote' },
        { label: 'No', value: false, nextActionId: 'submit-no-vote' }
      ]
    },
    // Steps with conditional branching
    {
      id: 'submit-vote',
      type: 'blockchain',
      // ... properties
      nextActions: [
        {
          actionId: 'success-path',
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'success' }]
        },
        {
          actionId: 'error-path',
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'error' }]
        }
      ]
    },
    // Completion states
    {
      id: 'completion',
      type: 'completion',
      label: 'Vote Submitted',
      message: 'Your vote has been recorded!',
      status: 'success'
    }
  ]
}
```

## 🔧 Advanced Usage

### Template Helpers

The SDK provides template helpers for common parameter types:

```typescript
import { createParameter, PARAM_TEMPLATES } from '@sherrylinks/sdk';

// Create a parameter using a template
const emailParam = createParameter(PARAM_TEMPLATES.EMAIL, {
  name: 'email',
  label: 'Your Email',
  required: true,
});

// Create a select parameter with custom options
const tokenParam = createParameter(PARAM_TEMPLATES.TOKEN_SELECT, {
  name: 'token',
  label: 'Select Token',
  // Override default options
  options: [
    { label: 'USDC', value: 'usdc' },
    { label: 'DAI', value: 'dai' },
  ],
});
```

## 🌐 Supported Chains

- Ethereum Mainnet (`ethereum`)
- Avalanche C-Chain (`avalanche`)
- Celo Mainnet (`celo`)
- Avalanche Fuji Testnet (`fuji`)
- Celo Alfajores Testnet (`alfajores`)

## 📚 Examples

The SDK includes several example mini-apps to help you get started:

### Single Action Examples

- Token Swap mini-app
- NFT Marketplace mini-app
- DAO Voting mini-app
- Fundraising mini-app
- Cross-chain Bridge mini-app

### Flow Examples

- User Onboarding Flow
- DeFi Token Swap Flow
- DAO Governance Flow

Check the `src/examples` directory for complete implementations.

## 🔍 Validation

The SDK provides extensive validation to ensure your mini-apps work correctly:

```typescript
import { validateMetadata } from '@sherrylinks/sdk';

// Validate metadata
const validationResult = validateMetadata(myMetadata);

if (validationResult.isValid) {
  // Ready to use!
  console.log('Metadata is valid:', validationResult.type);
} else {
  // Handle validation errors
  console.error('Validation errors:', validationResult.errors);
}
```

## 📖 API Reference

### Core Functions

- `createMetadata(metadata)`: Validates and processes metadata.
- `validateMetadata(input)`: Validates metadata and returns detailed results.

### Type Guards

- `isBlockchainActionMetadata(action)`: Type guard for blockchain actions.
- `isTransferAction(action)`: Type guard for transfer actions.
- `isHttpAction(action)`: Type guard for HTTP actions.
- `isActionFlow(obj)`: Type guard for nested action flows.

### Helper Functions

- `createParameter(template, customizations)`: Helper for parameter creation.
- `PARAM_TEMPLATES`: Library of predefined parameter templates.

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
cd docs && yarn install && yarn start
```

## Browser Usage

- **[Documentation](https://docs.sherry.social)** - Complete guides and API
  reference
- **[Discord](https://discord.gg/69brTf6J)** - Community support and discussions
- **[GitHub Issues](https://github.com/SherryLabs/sherry-sdk/issues)** - Bug
  reports and feature requests
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

- **[Sherry Platform](https://sherry.social)** - Live platform and mini-app
  gallery
- **[Documentation](https://docs.sherry.social)** - Complete developer
  documentation
- **[GitHub Repository](https://github.com/SherryLabs/sherry-sdk)** - Source
  code and issues
- **[npm Package](https://www.npmjs.com/package/@sherrylinks/sdk)** - Package
  registry
