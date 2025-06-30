---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/intro.md
sidebar_position: 1
---

# Sherry SDK Introduction

Welcome to the Sherry SDK, the most comprehensive toolkit for building interactive Web3 experiences that embed directly into social media posts. Transform static content into dynamic blockchain applications that users can interact with seamlessly, without ever leaving their social feed.

## What is the Sherry SDK?

The Sherry SDK is a TypeScript-first framework that bridges the gap between traditional social media and Web3 functionality. It enables developers to create "mini-apps" - interactive widgets that can execute blockchain transactions, call smart contracts, process payments, and much more, all from within a social media post.

### Core Philosophy

- **Zero Context Switch:** Users interact with Web3 without leaving their social platform
- **Developer-First:** TypeScript support, comprehensive validation, and intuitive APIs
- **Multi-Chain Ready:** Built-in support for multiple blockchains from day one
- **Social-Native:** Designed specifically for social media integration

## What Can You Build?

The Sherry SDK supports a wide range of Web3 interactions through different action types:

### Blockchain Interactions

- **Smart Contract Calls:** Execute any contract function with custom parameters
- **Token Operations:** Approve, transfer, swap, stake tokens across protocols
- **NFT Management:** Mint, trade, transfer NFTs with metadata support
- **DAO Participation:** Vote on proposals, create governance actions
- **DeFi Operations:** Lending, borrowing, yield farming, liquidity provision

### Payment & Transfers

- **Native Token Transfers:** Send ETH, AVAX, CELO with interactive amount selection
- **Multi-Recipient Payments:** Split payments, team distributions, donations
- **Cross-Chain Transfers:** Bridge assets between supported networks
- **Subscription Payments:** Recurring payments and membership management

### Data & API Integration

- **Form Collection:** Gather user data with validation and processing
- **External APIs:** Integrate with any REST API or webhook
- **Data Analytics:** Track user interactions and engagement metrics
- **Email & Notifications:** Connect with email services and notification systems

### Complex Workflows

- **Multi-Step Processes:** Guide users through complex operations
- **Conditional Logic:** Dynamic flows based on user choices or data
- **Error Handling:** Graceful recovery and alternative paths
- **Progress Tracking:** Visual feedback for long-running operations

## Key Concepts & Architecture

### Metadata Structure

The foundation of every mini-app is its metadata object, which defines:

```typescript
interface Metadata {
  url: string; // Your project's main website
  icon: string; // Public URL to your app icon (200x200px recommended)
  title: string; // Descriptive name shown to users
  description: string; // Clear explanation of functionality
  baseUrl?: string; // API server URL (auto-detected in most cases)
  actions: Action[]; // Array of interactive actions
}
```

### Action Types

Each action type serves specific use cases:

- **`blockchain`:** Direct smart contract interactions with ABI support
- **`transfer`:** Native token transfers with built-in UI components
- **`dynamic`:** Server-side computed actions for complex business logic
- **`http`:** Direct API calls for data collection and processing
- **`flow`:** Multi-step workflows with conditional navigation

### Parameter System

Define user inputs with rich validation and UI components:

```typescript
interface Parameter {
  name: string; // Parameter identifier
  label: string; // User-friendly label
  type: ParameterType; // Input type (text, number, address, select, etc.)
  required?: boolean; // Whether input is mandatory
  description?: string; // Help text for users
  validation?: object; // Custom validation rules
}
```

### Chain Support

Built-in support for multiple networks:

- **Mainnets:** Avalanche, Celo, Ethereum
- **Testnets:** Fuji, Alfajores, Sepolia
- **Cross-Chain:** Automatic bridge detection and routing

## Developer Experience

### TypeScript-First Design

- Full type safety across all APIs
- IntelliSense support in all major editors
- Compile-time error detection
- Comprehensive type definitions

### Built-in Validation

- Runtime metadata validation with detailed error messages
- ABI compatibility checking for smart contract interactions
- Parameter type validation and sanitization
- Chain compatibility verification

### Development Tools

- Real-time debugging with detailed logging
- Interactive metadata preview
- Local development server support
- Comprehensive testing utilities

## Quick Start

### Installation

Install the Sherry SDK using your preferred package manager:

```bash
# Using npm
npm install @sherrylinks/sdk viem wagmi

# Using yarn
yarn add @sherrylinks/sdk viem wagmi

# Using pnpm
pnpm add @sherrylinks/sdk viem wagmi
```

### Your First Mini-App

Create a simple token transfer mini-app in just a few lines:

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

const metadata: Metadata = {
  url: 'https://myapp.com',
  icon: 'https://myapp.com/icon.png',
  title: 'Simple Tip Jar',
  description: 'Send tips to content creators',
  actions: [
    {
      type: 'transfer',
      label: 'Send Tip',
      chains: { source: 43114 }, // Avalanche
      to: '0x742d35Cc6734C0532925a3b8D4ccd306f6F4B26C',
      amountConfig: {
        type: 'radio',
        options: [
          { label: 'Coffee', value: 0.01 },
          { label: 'Lunch', value: 0.05 },
          { label: 'Dinner', value: 0.1 },
        ],
      },
    },
  ],
};

// Validate and export
export default createMetadata(metadata);
```

### Testing Your Mini-App

Use the Sherry debugger to test your mini-app during development:

1. Deploy your mini-app to a public URL (Vercel, Netlify, etc.)
2. Visit [app.sherry.social/debugger](https://app.sherry.social/debugger)
3. Enter your API endpoint URL
4. Test all functionality before going live

## Architecture Overview

### How Mini-Apps Work

1. **Discovery:** Platforms fetch your metadata via GET request
2. **Rendering:** Your metadata is rendered as an interactive UI
3. **Execution:** User interactions trigger POST requests to your server
4. **Processing:** Your server processes the request and returns a blockchain transaction
5. **Completion:** User signs and submits the transaction

### Integration Points

- **Social Platforms:** Twitter, Discord, Telegram, and more
- **Wallet Support:** MetaMask, WalletConnect, Coinbase Wallet
- **Blockchain Networks:** Multi-chain support with automatic routing
- **Backend Services:** Any HTTP-compatible server or serverless function

## Learning Path

### Beginner (Start Here)

1. **[Quick Start Guide](../getting-started/quickstart.md)** - Get running in 5 minutes
2. **[Creating Mini-Apps](./creating-miniapps.md)** - Step-by-step tutorial
3. **[Transfer Actions](../api-reference/action-types/transfer-actions.md)** - Simple payment flows

### Intermediate

1. **[Blockchain Actions](../api-reference/action-types/blockchain-actions.md)** - Smart contract interactions
2. **[Parameter Configuration](../api-reference/parameters/parameters.md)** - Advanced input handling
3. **[Multi-Chain Support](../core-concepts/chains.md)** - Cross-chain functionality

### Advanced

1. **[Dynamic Actions](../api-reference/action-types/dynamic-actions.mdx)** - Server-side logic
2. **[Action Flows](../api-reference/action-types/nested-action-flows.md)** - Multi-step workflows
3. **[Complete Tutorial](../guides/guide-en.mdx)** - Full Next.js implementation

## Community & Support

- **[GitHub](https://github.com/SherryLabs/sherry-sdk)** - Source code and issue tracking
- **[Discord](https://discord.gg/sherry)** - Community chat and support
- **[Examples](../getting-started/examples.md)** - Production-ready code samples
- **[Documentation](../intro.mdx)** - Complete API reference

Ready to build your first mini-app? Start with our [Quick Start Guide](../getting-started/quickstart.md) or jump into the [Complete Tutorial](../guides/guide-en.mdx).
