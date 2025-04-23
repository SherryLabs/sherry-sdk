---
sidebar_position: 1
title: Introduction
---

# Sherry SDK Introduction

[![npm version](https://img.shields.io/npm/v/@sherrylinks/sdk.svg)](https://www.npmjs.com/package/@sherrylinks/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green)](https://jestjs.io/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue.svg)](https://github.com/SherryLabs/sherry-sdk)

## 🌟 Overview

Sherry SDK is a powerful toolkit for building interactive Web3 **mini-apps** that can be embedded directly within social media posts. The SDK enables developers to create rich, composable blockchain experiences without requiring users to leave their social media feed.

With Sherry, you can transform any post into an interactive dApp that allows users to swap tokens, vote on proposals, mint NFTs, sign transactions, transfer assets, interact with APIs, and much more—all with built-in validation and a unified experience across multiple blockchains.

## ✨ Key Features

-   🔗 **Multi-chain Support**: Build once, deploy across Ethereum, Avalanche, Celo, Monad, and more. (See [Supported Chains](./advanced/supported-chains.md))
-   🧩 **Multiple Action Types**:
    -   **Blockchain Actions**: Call smart contract functions with rich parameter configuration. ([Details](./action-types/blockchain-actions.md))
    -   **Transfer Actions**: Enable native token or ERC20 transfers with customizable UIs. ([Details](./action-types/transfer-actions.md))
    -   **HTTP Actions**: Make API calls and form submissions. ([Details](./action-types/http-actions.md))
    -   **Action Flows**: Create interactive multi-step processes with conditional paths using `decision` and `completion` steps. ([Details](./action-types/action-flows.md))
-   📋 **Built-in Validation**: Ensures your mini-app metadata is valid and well-formed before use via `createMetadata` or `validateMetadata`.
-   ⚡ **Type Safety**: Full TypeScript support with comprehensive type definitions for enhanced developer experience.
-   🔄 **Cross-chain Interactions**: Design experiences that potentially span multiple blockchains (validation primarily focuses on source/destination chain compatibility).
-   📊 **Parameter Configuration**: Define user inputs with various types (`text`, `number`, `address`, `select`, `radio`, `textarea`, etc.) and validation rules (`required`, `min`, `max`, `pattern`, etc.). ([Details](./parameters.md))
-   🛠️ **Developer Tools**: Includes type guards (`isBlockchainActionMetadata`, `isTransferAction`, etc.) and potentially helper functions or templates (like `PARAM_TEMPLATES` mentioned in README).

## 🚀 Who is this SDK for?

This SDK is aimed at developers who:

-   Want to integrate blockchain functionalities into social platforms or web contexts.
-   Seek to create interactive Web3 experiences without users leaving their current environment.
-   Need to build multi-step workflows with conditional logic.
-   Value a tool with integrated validation and strong typing.

## 📚 Next Steps

-   Proceed to the [Installation](./getting-started/installation.md) guide to start using Sherry SDK in your project.
-   Learn how to [Create Your First Mini-App](./sdk/creating-miniapps.md).
-   Explore the different [Action Types](./sdk/action-types/blockchain-actions.md).