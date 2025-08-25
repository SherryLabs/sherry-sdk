# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Sherry SDK is a TypeScript library for building interactive Web3 mini-apps that can be embedded within social media posts. It provides a comprehensive set of tools for creating blockchain interactions, token transfers, smart contract calls, and multi-step workflows.

## Development Commands

### Building

- `npm run build` - TypeScript compilation only
- `npm run build:esm` - Webpack ESM build for browser
- `npm run build:all` - Complete build (TypeScript + Webpack + browser bundle)
- `npm run prepublishOnly` - Runs full build before publishing

### Testing

- `npm test` - Run all Jest tests
- `npm run test:coverage` - Run tests with coverage report
- Individual test files can be run with `npm test -- <test-file-pattern>`

### Code Quality

- `npm run lint` - Lint code using oxlint
- `npm run format` - Format code using Prettier

### Documentation

- `npm run docs:start` - Start local documentation site (in docs/ directory)
- `npm run docs:build` - Build documentation site

## Architecture Overview

### Core Structure

- **src/interface/** - TypeScript interfaces and type definitions for all action types
- **src/executors/** - Execution engines for different action types (blockchain, dynamic, flow)
- **src/validators/** - Validation logic for metadata, actions, and parameters
- **src/utils/** - Utility functions, primarily `createMetadata` for metadata processing
- **src/templates/** - Parameter templates and helper functions
- **src/examples/** - Reference implementations of different mini-app patterns

### Action Types System

The SDK supports five main action types:

1. **Transfer Actions** - Native token transfers with support for 'sender' keyword
2. **Blockchain Actions** - Smart contract interactions with ABI support
3. **HTTP Actions** - Server-side REST endpoint calls with rich parameters
4. **Dynamic Actions** - Server-side processing with blockchain context
5. **Flow Actions** - Multi-step interactive workflows with branching logic

### Key Architectural Patterns

#### Metadata-Driven Design

All mini-apps are defined through a `Metadata` object that describes the UI, actions, and parameters. The `createMetadata()` function validates and processes this metadata.

#### Validator Pattern

Each action type has a dedicated validator class (e.g., `BlockchainActionValidator`) that handles validation logic and type checking.

#### Executor Pattern

Executors handle the runtime execution of actions, with different executors for different contexts (blockchain, server-side, etc.).

#### Template System

Common parameter patterns are abstracted into reusable templates via `PARAM_TEMPLATES` and `createParameter()` helper functions.

## Key Dependencies

- **viem** (peer dependency) - Ethereum library for blockchain interactions
- **abitype** - ABI type definitions and utilities
- **TypeScript 5.6+** - Strong typing throughout the codebase

## Chain Support

The SDK supports multiple EVM chains including Ethereum, Avalanche, Celo, Base, and Mantle. Chain configurations are centralized in `src/chains.ts`.

## Special Features

### 'sender' Keyword Support

Both Transfer and Blockchain actions support the special `'sender'` keyword in address fields, which resolves to the user's wallet address at runtime.

### File Upload Support

HTTP actions support file upload parameters with validation for file types, sizes, and image dimensions.

### Cross-Chain Operations

Actions can specify source and destination chains for cross-chain workflows.

## Testing Structure

- **Unit tests** - Individual validator and utility function tests
- **Integration tests** - End-to-end metadata creation and validation
- **Example tests** - Validation of example mini-apps to ensure they remain functional

Tests use Jest with TypeScript support. The test setup includes fetch mocking for HTTP-related functionality.

## Build Configuration

The project supports multiple build targets:

- **CommonJS** - For Node.js environments (via TypeScript compiler)
- **ESM** - For modern bundlers and browsers (via Webpack)
- **Browser** - With polyfills for Node.js modules (crypto, stream, buffer)

## Documentation

Full documentation is maintained in the `docs/` directory using Docusaurus, including API reference, guides, and examples. The documentation covers all action types, parameter configurations, and integration patterns.
