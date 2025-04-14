---
sidebar_position: 3
---

# Blockchain Actions

Blockchain actions are a core concept in Sherry SDK. They represent operations that can be performed on the blockchain, such as calling smart contract functions or transferring tokens.

## Understanding Blockchain Actions

A blockchain action is defined by:

- **Contract address** - The address of the smart contract to interact with
- **ABI** - The Application Binary Interface that defines the contract's functions
- **Function name** - The specific function to call
- **Parameters** - The data to pass to the function
- **Chain information** - The blockchain network to use

## Creating a Blockchain Action

Here's how to create a basic blockchain action:

```typescript
import { BlockchainActionMetadata } from '@sherrylabs/sherry-sdk';

const tokenTransferAction: BlockchainActionMetadata = {
  label: 'Transfer Token',
  description: 'Transfer ERC-20 tokens to another address',
  address: '0x1234567890123456789012345678901234567890', // Token contract address
  abi: [
    {
      name: 'transfer',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    }
  ],
  functionName: 'transfer',
  chains: { source: 'avalanche' },
  params: [
    {
      name: 'to',
      label: 'Recipient Address',
      type: 'address',
      required: true
    },
    {
      name: 'amount',
      label: 'Amount to Send',
      type: 'number',
      required: true
    }
  ]
};
```

## Validating Blockchain Actions

The SDK includes validation tools to ensure your actions are properly formatted:

```typescript
import { BlockchainActionValidator } from '@sherrylabs/sherry-sdk';

// Validate the action
try {
  const validatedAction = BlockchainActionValidator.validateBlockchainAction(tokenTransferAction);
  console.log('Action is valid:', validatedAction);
} catch (error) {
  console.error('Action validation failed:', error.message);
}
```

## Parameter Types

The SDK supports several parameter types:

### Standard Parameters

```typescript
// Text input
const textParam = {
  name: 'message',
  label: 'Message',
  type: 'text',
  required: true
};

// Number input
const numberParam = {
  name: 'amount',
  label: 'Amount',
  type: 'number',
  required: true
};

// Boolean input
const boolParam = {
  name: 'confirmed',
  label: 'Confirm Action',
  type: 'bool',
  required: true
};

// Address input
const addressParam = {
  name: 'recipient',
  label: 'Recipient Address',
  type: 'address',
  required: true
};
```

### Select Parameters

```typescript
const selectParam = {
  name: 'option',
  label: 'Choose an option',
  type: 'select',
  required: true,
  options: [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 }
  ]
};
```

### Radio Parameters

```typescript
const radioParam = {
  name: 'choice',
  label: 'Make a choice',
  type: 'radio',
  required: true,
  options: [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ]
};
```

## Advanced Examples

For more complex use cases, such as token swaps:

```typescript
const swapAction = {
  label: 'Swap Tokens',
  description: 'Swap AVAX for USDC',
  address: ROUTER_ADDRESS,
  abi: routerAbi, // Your router ABI
  functionName: 'swapExactIn',
  chains: { source: 'avalanche' },
  amount: 0.1, // Amount of AVAX to swap
  params: [
    // Router parameters with fixed and dynamic values
    // ...
  ]
};
```

Check the API reference for more details on creating and validating blockchain actions.
