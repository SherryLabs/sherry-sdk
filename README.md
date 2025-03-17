# Sherry SDK

Welcome to the [Sherry SDK!](https://www.npmjs.com/package/@sherrylinks/sdk) This SDK allows you to create mini-apps that interact with any function of any smart contract.

## Features

- **Smart Contract Interaction**: Easily interact with any function of any smart contract.
- **Transfer Actions**: Simplified interface for token transfers.
- **HTTP Actions**: Create forms and API integrations with HTTP endpoints.
- **Cross-chain Support**: Define actions that work across multiple blockchains.
- **Mini-App Creation**: Build mini-apps quickly and efficiently.
- **Flexible and Extensible**: Designed to be flexible and easily extensible to meet your needs.

## Installation

To install the Sherry SDK, use the following command:

npm:

```bash
npm install @sherrylinks/sdk
```

yarn

```bash
yarn add @sherrylinks/sdk
```

## Usage

Here is a basic example of how to use the Sherry SDK:

## ABI Definition

```typescript
const exampleAbi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'safeTransferFrom',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;
```

## Core Interfaces

```typescript
import {
  Metadata,
  ValidatedMetadata,
  BlockchainAction,
  TransferAction,
  HttpAction,
} from '@sherrylinks/sdk';
```

### Metadata Interface

```typescript
export interface Metadata {
  url: string;
  icon: string;
  title: string;
  description: string;
  actions: (BlockchainActionMetadata | TransferAction | HttpAction)[];
}

export interface ValidatedMetadata extends Omit<Metadata, 'actions'> {
  actions: (BlockchainAction | TransferAction | HttpAction)[];
}
```

## Examples

### Blockchain Action Example

```typescript
const metadata: Metadata = {
  url: 'https://myapp.com',
  icon: 'https://example.com/icon.png',
  title: 'Contract Interaction Example',
  description: 'Interact with a smart contract',
  actions: [
    {
      label: 'Check Balance',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      abi: exampleAbi,
      functionName: 'balanceOf',
      paramsValue: ['0x1234567890abcdef1234567890abcdef12345678'],
      chains: { source: 'fuji' },
    },
  ],
};
```

### Transfer Action Example

```typescript
const transferMetadata: Metadata = {
  url: 'https://myapp.com',
  icon: 'https://example.com/icon.png',
  title: 'Transfer Example',
  description: 'Transfer tokens to a recipient',
  actions: [
    {
      label: 'Send 0.1 AVAX',
      to: '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24',
      amount: 0.1,
      chains: { source: 'avalanche' },
    },
  ],
};
```

### HTTP Action Example

```typescript
const httpMetadata: Metadata = {
  url: 'https://myapp.com',
  icon: 'https://example.com/icon.png',
  title: 'Form Example',
  description: 'Submit data to an API',
  actions: [
    {
      label: 'Subscribe to Newsletter',
      endpoint: 'https://api.example.com/subscribe',
      params: [
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
        },
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: false,
        },
      ],
    },
  ],
};
```

### Cross-chain Action Example

```typescript
const crossChainMetadata: Metadata = {
  url: 'https://myapp.com',
  icon: 'https://example.com/icon.png',
  title: 'Cross-chain Example',
  description: 'Cross-chain operation',
  actions: [
    {
      label: 'Bridge AVAX to Celo',
      to: '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24',
      amount: 0.1,
      chains: { source: 'fuji', destination: 'alfajores' },
    },
  ],
};
```

## Core Functions

### createMetadata

Creates the validated metadata for a mini app.

```typescript
import { createMetadata } from '@sherrylinks/sdk';

const validatedMetadata = createMetadata(metadata);
console.log(validatedMetadata);
```

### helperValidateMetadata

Validates a JSON string to check if it conforms to the Metadata or ValidatedMetadata structure.

```typescript
import { helperValidateMetadata } from '@sherrylinks/sdk';

const jsonString = JSON.stringify(metadata);
const validation = helperValidateMetadata(jsonString);

if (validation.isValid) {
  console.log(`Valid ${validation.type}:`, validation.data);
} else {
  console.error('Invalid metadata');
}
```

### ABI Helper Functions

```typescript
import {
  getParameters,
  getAbiFunction,
  isValidFunction,
  validateActionParameters,
  getBlockchainActionType,
} from '@sherrylinks/sdk';

const parameters = getParameters(actionMetadata);
const abiFunction = getAbiFunction(exampleAbi, 'balanceOf');
const isValid = isValidFunction(exampleAbi, 'balanceOf');
const isParametersValid = validateActionParameters(action);
const actionType = getBlockchainActionType(actionMetadata);
```

### Type Guards

```typescript
import {
  isBlockchainAction,
  isBlockchainActionMetadata,
  isTransferAction,
  isMetadata,
  isValidatedMetadata,
} from '@sherrylinks/sdk';

if (isBlockchainActionMetadata(action)) {
  // Action is a BlockchainActionMetadata
}

if (isTransferAction(action)) {
  // Action is a TransferAction
}
```

## Supported Chains

The SDK currently supports the following chains:

- `"fuji"` - Avalanche Fuji Testnet
- `"avalanche"` - Avalanche Mainnet
- `"alfajores"` - Celo Alfajores Testnet
- `"celo"` - Celo Mainnet
- `"monad-testnet"` - Monad Testnet

## Documentation

For detailed documentation and API reference, please visit our official documentation.

## Contributing

We welcome contributions! Please read our contributing guidelines to get started.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact

If you have any questions or need further assistance, feel free to reach out to our support team at our [discord channel](https://discord.gg/AHP9Dfmz).

Need more information? Visit our [docs](https://docs.sherry.social).

Happy coding with Sherry SDK!
