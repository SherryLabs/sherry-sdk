---
sidebar_position: 1
---

# Sherry SDK Introduction

Welcome to the Sherry SDK documentation! This Software Development Kit (SDK) provides all the tools you need to build powerful decentralized social applications.

## What is Sherry SDK?

Sherry SDK is a comprehensive toolkit designed to simplify blockchain integration for social applications. It provides a set of APIs, utilities, and validators to interact with blockchain networks, manage transactions, and handle blockchain actions.

## Key Features

- **Blockchain Integration** - Easily connect your app to multiple blockchain networks
- **Transaction Management** - Handle transactions with built-in validation and error handling
- **Action Validators** - Ensure blockchain actions are properly formatted and valid
- **Cross-Chain Support** - Build apps that work across multiple blockchain ecosystems
- **Type Safety** - Built with TypeScript for robust type checking

## Getting Started

Install the SDK in your project:

```bash
npm install @sherrylabs/sherry-sdk
# or
yarn add @sherrylabs/sherry-sdk
```

Basic usage:

```typescript
import { SherryClient } from '@sherrylabs/sherry-sdk';

// Initialize the SDK
const client = new SherryClient({
  chainId: 43114, // Avalanche C-Chain
  apiKey: 'YOUR_API_KEY'
});

// Use the SDK functionality
const balance = await client.getBalance('0x1234...');
```

Continue reading the documentation to learn how to use all the features of the Sherry SDK!
