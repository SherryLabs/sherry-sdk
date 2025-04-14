---
sidebar_position: 2
---

# Installation & Setup

Getting started with Sherry SDK is simple. This guide will walk you through the installation process and basic configuration.

## Prerequisites

Before installing the SDK, make sure you have:

- Node.js (v14 or later)
- npm or yarn package manager
- A project where you want to integrate blockchain capabilities

## Installation

Install the Sherry SDK using npm or yarn:

```bash
# Using npm
npm install @sherrylabs/sherry-sdk

# Using yarn
yarn add @sherrylabs/sherry-sdk
```

## Basic Configuration

After installing the SDK, you need to initialize it with your configuration:

```typescript
import { SherryClient } from '@sherrylabs/sherry-sdk';

const sherryClient = new SherryClient({
  chainId: 43114, // Avalanche C-Chain
  apiKey: 'YOUR_API_KEY', // Get this from the Sherry developer portal
  environment: 'production' // or 'development' for testing
});
```

## Environment Variables

For better security, we recommend storing sensitive information like API keys in environment variables:

```typescript
// Using environment variables
const sherryClient = new SherryClient({
  chainId: process.env.CHAIN_ID,
  apiKey: process.env.SHERRY_API_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
});
```

## Next Steps

Now that you have the SDK installed and configured, you can:

- Set up blockchain actions
- Process transactions
- Validate user interactions with smart contracts

Check the next sections to learn more about these features.
