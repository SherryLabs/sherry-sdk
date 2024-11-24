# Sherry SDK

Welcome to the [Sherry SDK!](https://www.npmjs.com/package/@sherrylinks/sdk) This SDK allows you to create mini-apps that interact with any function of any smart contract.

## Features

- **Smart Contract Interaction**: Easily interact with any function of any smart contract.
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

```typescript
import { Metadata, BlockchainActionMetadata } from '@sherrylinks/sdk';
```

```typescript
export type ActionType = "action" | "external-link";

export interface Metadata {
  type: ActionType;
  icon: string;
  title: string;
  description: string;
  actions: BlockchainActionMetadata[] | BlockchainAction[];
}

export interface ValidatedMetadata extends Omit<Metadata, 'actions'> {
  actions: BlockchainAction[];
}
```

## Example of Metadata Definition

```typescript
const metadata: Metadata = {
  type: "action",
  icon: "icon",
  title: "title",
  description: "description",
  actions: [
    {
      label: "Test Action",
      contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
      contractABI: exampleAbi,
      functionName: "safeTransferFrom",
      chainId: "ethereum"
    }
  ]
};

const validatedMetadata: ValidatedMetadata = createMetadata(metadata);
console.log(validatedMetadata);
```

## Functions

Several functions are available for the correct validation of the Metadata. You are free to define the metadata but remember that it will be validated, so in order to ensure the correct functioning of the mini-apps, the **`createMetadata`** function has been made available to obtain the validated Metadata as a result.

### createMetadata

Creates the validated metadata for a mini app.

```typescript
import { createMetadata } from '@sherrylinks/sdk';

const validatedMetadata = createMetadata(metadata);
console.log(validatedMetadata);
```

### getParameters

Gets the parameters of a function in the ABI.

```typescript
import { getParameters } from '@sherrylinks/sdk';

const parameters = getParameters(actionMetadata);
console.log(parameters);
```

### getAbiFunction

Gets a function from the ABI by its name.

```typescript
import { getAbiFunction } from '@sherrylinks/sdk';

const abiFunction = getAbiFunction(exampleAbi, "balanceOf");
console.log(abiFunction);
```

### isValidFunction

Checks if a function exists in the ABI.

```typescript
import { isValidFunction } from '@sherrylinks/sdk';

const isValid = isValidFunction(exampleAbi, "balanceOf");
console.log(isValid);

```

### validateActionParameters

Validates the parameters of an action.

```typescript
import { validateActionParameters } from '@sherrylinks/sdk';

const isValid = validateActionParameters(action);
console.log(isValid);
```

### getBlockchainActionType

Gets the state mutability of a function in the ABI.

```typescript
import { getBlockchainActionType } from '@sherrylinks/sdk';

const actionType = getBlockchainActionType(actionMetadata);
console.log(actionType);
```

## Documentation

For detailed documentation and API reference, please visit our official documentation.

## Contributing

We welcome contributions! Please read our contributing guidelines to get started.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact

If you have any questions or need further assistance, feel free to reach out to our support team at our [discord channel](https://discord.gg/sherry).

Need more information? Visit our [docs](https://docs.sherry.social).

Happy coding with Sherry SDK!




