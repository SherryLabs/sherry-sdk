---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/intro.md
sidebar_position: 1
---

# Sherry SDK Introduction

Welcome to the Sherry SDK documentation. This SDK allows you to build interactive Web3 mini-apps that can be embedded directly into social media posts, transforming static content into dynamic experiences.

## What Can You Build?

With the Sherry SDK, you can create "actions" that users can execute from a post:

-   **Interact with Smart Contracts:** Call functions, approve tokens, vote in DAOs, mint NFTs.
-   **Transfer Assets:** Send native tokens or ERC20s to specific or user-selected addresses.
-   **Make HTTP Requests:** Send form data to external APIs.
-   **Create Complex Flows:** Guide users through multi-step processes with conditional logic.

## Key Concepts

-   **Metadata:** The main object defining your mini-app (URL, icon, title, description) and the actions it contains.
-   **Actions:** The interactive units users can execute. There are several types:
    -   `BlockchainAction`: For interacting with contracts.
    -   `TransferAction`: For sending tokens.
    -   `HttpAction`: For API calls.
    -   `ActionFlow`: For multi-step flows.
-   **Parameters:** Define the inputs a user must provide for an action (addresses, amounts, text, selections, etc.).
-   **Validation:** The SDK validates your `Metadata` to ensure it's correctly formed before use.

## Installation

```bash
# Using npm
npm install @sherrylinks/sdk

# Using yarn
yarn add @sherrylinks/sdk
```

## Next Steps

-   Learn how to [Create Your First Mini-App](./creating-miniapps.md).
-   Explore the different [Action Types](./action-types/blockchain-actions.md).
-   Dive deeper into [Parameter Configuration](./parameters.md).