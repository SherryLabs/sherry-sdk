# Sherry SDK

[![npm version](https://img.shields.io/npm/v/@sherrylinks/sdk.svg)](https://www.npmjs.com/package/@sherrylinks/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green)](https://jestjs.io/)

## 🌟 Overview

Sherry SDK is a powerful toolkit for building interactive Web3 mini-apps that can be embedded within social media posts. The SDK enables developers to create rich, composable blockchain experiences without requiring users to leave their social media feed.

With Sherry, you can transform any post into an interactive dApp that allows users to swap tokens, vote on proposals, mint NFTs, sign transactions, and much more - all with built-in validation and a unified experience across chains.

## ✨ Features

- 🔗 **Multi-chain Support**: Build once, deploy across Ethereum, Avalanche, Celo, Monad, and more
- 🧩 **Multiple Action Types**:
  - **Blockchain Actions**: Call smart contract functions with rich parameter configuration
  - **Transfer Actions**: Enable token transfers with customizable UIs
  - **HTTP Actions**: Make API calls and form submissions
  - **Nested Action Flows**: Create interactive multi-step processes with conditional paths
- 📋 **Built-in Validation**: Ensure your mini-apps are valid and well-formed before deployment
- ⚡ **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🔄 **Cross-chain Interactions**: Enable transactions across multiple blockchains
- 📊 **Metadata Templates**: Ready-to-use templates for common Web3 use cases

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
      chains: { source: 'avalanche' }
    }
  ]
};

// Validate and process metadata
const validatedMetadata = createMetadata(metadata);
```

### Nested Action Flow

```typescript
import { createMetadata, Metadata, ActionFlow } from '@sherrylinks/sdk';

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
      endpoint: 'https://api.example.com/quote',
      params: [
        // Token selection parameters...
      ],
      nextActions: [
        { actionId: 'review-quote' }
      ]
    },
    
    // Step 2: Review and decide
    {
      id: 'review-quote',
      type: 'decision',
      label: 'Review Quote',
      title: 'Review Your Swap',
      options: [
        { label: 'Confirm', value: 'confirm', nextActionId: 'execute-swap' },
        { label: 'Cancel', value: 'cancel', nextActionId: 'cancelled' }
      ]
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
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'success' }]
        },
        {
          actionId: 'failed',
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'error' }]
        }
      ]
    },
    
    // Completion states
    {
      id: 'success',
      type: 'completion',
      label: 'Swap Complete',
      message: 'Your swap was successful!',
      status: 'success'
    },
    
    {
      id: 'failed',
      type: 'completion',
      label: 'Swap Failed',
      message: 'Your swap failed. Please try again.',
      status: 'error'
    },
    
    {
      id: 'cancelled',
      type: 'completion',
      label: 'Swap Cancelled',
      message: 'You cancelled the swap.',
      status: 'info'
    }
  ]
};

// Add to metadata
const flowMetadata: Metadata = {
  url: 'https://swap.example',
  icon: 'https://example.com/swap-icon.png',
  title: 'Advanced Token Swap',
  description: 'Swap tokens with our guided flow',
  actions: [swapFlow]
};

// Validate and process
const validatedFlow = createMetadata(flowMetadata);
```

## 🧩 Action Types

### Blockchain Actions

Interact with smart contract functions:

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

### Transfer Actions

Send native tokens or assets:

```typescript
{
  label: 'Donate',
  description: 'Support our project',
  chains: { source: 'ethereum' },
  
  // Fixed recipient
  to: '0xRecipientAddress',
  
  // Or let the user choose
  recipient: {
    inputType: 'select',
    label: 'Select Charity',
    options: [
      { label: 'Education Fund', value: '0xAddress1' },
      { label: 'Climate Action', value: '0xAddress2' }
    ]
  },
  
  // Fixed amount
  amount: 0.1,
  
  // Or let the user choose
  amountConfig: {
    inputType: 'radio',
    label: 'Donation Amount',
    options: [
      { label: 'Small', value: 0.01 },
      { label: 'Medium', value: 0.05 },
      { label: 'Large', value: 0.1 }
    ]
  }
}
```

### HTTP Actions

Make API calls and form submissions:

```typescript
{
  label: 'Submit Feedback',
  endpoint: 'https://api.example.com/feedback',
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
```

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

### Flow Execution

The SDK includes a `FlowExecutor` to run and manage nested action flows:

```typescript
import { FlowExecutor } from '@sherrylinks/sdk';

// Create executor with the flow
const executor = new FlowExecutor(myFlow);

// Execute the current step
const result = await executor.executeCurrentAction();

// For decision steps, provide user choice
const decisionResult = await executor.executeCurrentAction({
  userChoice: selectedValue
});

// Continue until completion
while (!executor.isCompleted()) {
  // Get current step
  const currentStep = executor.getCurrentAction();
  
  // Execute with appropriate data
  const stepResult = await executor.executeCurrentAction(stepData);
  
  // Check result and handle accordingly
  if (stepResult.status === 'waiting') {
    // Request user input
    // ...
  }
}

// Get execution history
const history = executor.getHistory();
```

### Template Helpers

The SDK provides template helpers for common parameter types:

```typescript
import { createParameter, PARAM_TEMPLATES } from '@sherrylinks/sdk';

// Create a parameter using a template
const emailParam = createParameter(PARAM_TEMPLATES.EMAIL, {
  name: 'email',
  label: 'Your Email',
  required: true
});

// Create a select parameter with custom options
const tokenParam = createParameter(PARAM_TEMPLATES.TOKEN_SELECT, {
  name: 'token',
  label: 'Select Token',
  // Override default options
  options: [
    { label: 'USDC', value: 'usdc' },
    { label: 'DAI', value: 'dai' }
  ]
});
```

## 🌐 Supported Chains

- Ethereum Mainnet (`ethereum`)
- Avalanche C-Chain (`avalanche`)
- Celo Mainnet (`celo`)
- Avalanche Fuji Testnet (`fuji`)
- Celo Alfajores Testnet (`alfajores`)
- Monad Testnet (`monad-testnet`)

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

- `createMetadata(metadata)`: Validates and processes metadata
- `validateMetadata(input)`: Validates metadata and returns detailed results
- `FlowValidator.validateFlow(flow)`: Validates a nested action flow
- `FlowExecutor`: Class for executing and managing action flows

### Type Guards

- `isBlockchainActionMetadata(action)`: Type guard for blockchain actions
- `isTransferAction(action)`: Type guard for transfer actions
- `isHttpAction(action)`: Type guard for HTTP actions
- `isActionFlow(obj)`: Type guard for nested action flows

### Helper Functions

- `createParameter(template, customizations)`: Helper for parameter creation
- `PARAM_TEMPLATES`: Library of predefined parameter templates

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

# Generate documentation
yarn docs
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Project Website](https://sherry.social)
- [Documentation](https://docs.sherry.social)
- [GitHub Repository](https://github.com/sherrylinks/sdk)