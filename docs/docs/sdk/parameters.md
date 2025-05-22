---
sidebar_position: 5
---

# Action Parameters

Parameters define the inputs a user provides when executing actions. They control UI generation and validation for each required field.

## Parameter Types

All parameters extend from `BaseParameter`:

```typescript
interface BaseParameter {
  name: string;           // Parameter identifier (must match ABI/API field)
  label: string;          // Label displayed to user
  type: string;           // Input type
  required?: boolean;     // Is this field mandatory?
  description?: string;   // Help text for the user
  fixed?: boolean;        // Is the value fixed (non-editable)?
  value?: any;           // Default or fixed value
}
```

### StandardParameter

For common input types like text, numbers, addresses, and booleans:

```typescript
// Text input
{
  name: 'message',
  label: 'Your Message',
  type: 'text',
  required: true,
  minLength: 5,
  maxLength: 100,
  description: 'Enter your message here'
}

// Number input  
{
  name: 'amount',
  label: 'Amount',
  type: 'number',
  required: true,
  min: 0.01,
  max: 1000
}

// Address input (with validation)
{
  name: 'recipient',
  label: 'Recipient Address', 
  type: 'address',
  required: true,
  pattern: '^0x[a-fA-F0-9]{40}$'
}

// Boolean checkbox
{
  name: 'confirm',
  label: 'I agree to terms',
  type: 'boolean',
  required: true
}

// Email input (with validation)
{
  name: 'email',
  label: 'Email Address',
  type: 'email',
  required: true,
  pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
}

// Large text input
{
  name: 'description',
  label: 'Description',
  type: 'textarea',
  required: false,
  maxLength: 500
}
```

### SelectParameter

For dropdown selections:

```typescript
{
  name: 'token',
  label: 'Select Token',
  type: 'select',
  required: true,
  options: [
    { 
      label: 'USDC', 
      value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 
      description: 'USD Coin' 
    },
    { 
      label: 'USDT', 
      value: '0xdAC17F958D2ee523a2206206994597C13D831ec7', 
      description: 'Tether USD' 
    },
    { 
      label: 'DAI', 
      value: '0x6B175474E89094C44Da98b954EedeAC495271d0F', 
      description: 'Dai Stablecoin' 
    }
  ]
}
```

### RadioParameter

For radio button groups:

```typescript
{
  name: 'priority',
  label: 'Priority Level',
  type: 'radio', 
  required: true,
  options: [
    { 
      label: 'Low', 
      value: 'low', 
      description: 'Standard processing time' 
    },
    { 
      label: 'Medium', 
      value: 'medium', 
      description: 'Faster processing' 
    },
    { 
      label: 'High', 
      value: 'high', 
      description: 'Priority processing' 
    }
  ]
}
```

## Parameter Templates

Use predefined templates for common parameter types:

```typescript
import { PARAM_TEMPLATES, createParameter } from '@sherrylinks/sdk';

// Address parameter
const recipientParam = createParameter(PARAM_TEMPLATES.ADDRESS, {
  name: 'recipient',
  label: 'Destination Address',
  description: 'Where to send the tokens'
});

// Amount parameter
const amountParam = createParameter(PARAM_TEMPLATES.AMOUNT, {
  name: 'transferAmount', 
  label: 'Amount to Send',
  min: 0.01,
  max: 1000
});

// Email parameter
const emailParam = createParameter(PARAM_TEMPLATES.EMAIL, {
  name: 'userEmail',
  label: 'Your Email Address'
});

// Yes/No selection
const confirmParam = createParameter(PARAM_TEMPLATES.YES_NO, {
  name: 'confirmation',
  label: 'Confirm this action?'
});

// Token selection
const tokenParam = createParameter(PARAM_TEMPLATES.TOKEN_SELECT, {
  name: 'selectedToken',
  label: 'Choose Token'
});
```

### Available Templates

| Template | Type | Description |
|----------|------|-------------|
| `ADDRESS` | address | Ethereum address input with validation |
| `AMOUNT` | number | Numeric amount for transfers |
| `TOKEN_AMOUNT` | number | Token amount with decimal support |
| `INTEGER` | number | Integer-only number input |
| `EMAIL` | email | Email address with validation |
| `TEXT` | text | Basic text input |
| `TEXTAREA` | textarea | Multi-line text input |
| `BOOLEAN` | boolean | Boolean checkbox |
| `YES_NO` | radio | Yes/No radio selection |
| `TOKEN_SELECT` | select | Common token dropdown |
| `CHAIN_SELECT` | select | Blockchain selection |

## Helper Functions

### Creating Select Parameters

```typescript
import { createSelectParam, createSelectOptions } from '@sherrylinks/sdk';

// Simple select parameter
const prioritySelect = createSelectParam(
  'priority',
  'Priority Level',
  [
    { label: 'Low', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'High', value: 3 }
  ],
  true, // required
  'Select the priority for this action'
);

// Using helper for options
const tokenOptions = [
  { label: 'ETH', value: 'eth', description: 'Ethereum' },
  { label: 'AVAX', value: 'avax', description: 'Avalanche' }
];

const tokenSelect = createSelectParam(
  'token',
  'Select Token',
  createSelectOptions(tokenOptions),
  true,
  'Choose the token to use'
);
```

### Creating Radio Parameters

```typescript
import { createRadioParam } from '@sherrylinks/sdk';

const confirmRadio = createRadioParam(
  'confirm',
  'Confirm Action',
  [
    { label: 'Yes, proceed', value: true },
    { label: 'No, cancel', value: false }
  ],
  true,
  'Please confirm your choice'
);
```

## Validation Properties

### Text-Based Parameters

```typescript
{
  name: 'username',
  label: 'Username',
  type: 'text',
  minLength: 3,        // Minimum character length
  maxLength: 20,       // Maximum character length
  pattern: '^[a-zA-Z0-9_]+$',  // Regex pattern
  required: true
}
```

### Number-Based Parameters

```typescript
{
  name: 'price',
  label: 'Price',
  type: 'number',
  min: 0.01,          // Minimum value
  max: 10000,         // Maximum value
  required: true
}
```

### Address Parameters

```typescript
{
  name: 'wallet',
  label: 'Wallet Address',
  type: 'address',
  pattern: '^0x[a-fA-F0-9]{40}$',  // Custom validation pattern
  required: true
}
```

## Fixed vs Dynamic Values

### Fixed Parameters

Use `fixed: true` for values that users shouldn't change:

```typescript
{
  name: 'contractAddress',
  label: 'Contract',
  type: 'address',
  value: '0x1234567890123456789012345678901234567890',
  fixed: true,  // User cannot edit this
  required: true
}
```

### Default Values

Provide defaults that users can modify:

```typescript
{
  name: 'slippage',
  label: 'Slippage Tolerance',
  type: 'number',
  value: 0.5,  // Default 0.5%
  min: 0.1,
  max: 5.0,
  required: true
}
```

## Special Values

Some parameters accept special values:

```typescript
// 'sender' resolves to the current user's address
{
  name: 'recipient',
  label: 'Send To',
  type: 'address',
  value: 'sender',  // Special value
  required: true
}
```

## ABI Type Compatibility

For `BlockchainAction` parameters, the SDK automatically validates compatibility between parameter types and ABI types:

| ABI Type | Compatible Parameter Types |
|----------|---------------------------|
| `address` | `address` |
| `bool` | `boolean`, `bool` |
| `string` | `text`, `email`, `url`, `textarea`, `string` |
| `uint256`, `int256` | `number`, `uint256`, `int256` |
| `bytes`, `bytes32` | `text`, `bytes`, `bytes32` |
| `address[]` | `text` (as JSON array) |

## Best Practices

### 1. Parameter Order

For `BlockchainAction`, parameters **must** be in the same order as the ABI function inputs:

```typescript
// ABI function: transfer(address to, uint256 amount)
params: [
  // First parameter: 'to' address
  {
    name: 'to',
    label: 'Recipient',
    type: 'address',
    required: true
  },
  // Second parameter: 'amount' 
  {
    name: 'amount',
    label: 'Amount',
    type: 'uint256',
    required: true
  }
]
```

### 2. User-Friendly Labels

Use clear, descriptive labels:

```typescript
// Good
{
  name: 'spender',
  label: 'Contract to Approve',
  description: 'The contract that will spend your tokens'
}

// Avoid
{
  name: 'spender',
  label: 'Spender'  // Too technical
}
```

### 3. Provide Helpful Descriptions

```typescript
{
  name: 'slippage',
  label: 'Slippage Tolerance',
  type: 'number',
  description: 'Maximum price difference you\'re willing to accept (0.5% recommended)',
  value: 0.5,
  min: 0.1,
  max: 5.0
}
```

### 4. Use Templates When Possible

```typescript
// Use templates for consistency
createParameter(PARAM_TEMPLATES.ADDRESS, {
  name: 'recipient',
  label: 'Send To'
});

// Instead of manually defining
{
  name: 'recipient',
  label: 'Send To',
  type: 'address',
  required: true,
  pattern: '^0x[a-fA-F0-9]{40}
}
```

### 5. Validate User Input

```typescript
{
  name: 'tokenAmount',
  label: 'Token Amount',
  type: 'number',
  required: true,
  min: 0.000001,      // Minimum viable amount
  max: 1000000,       // Reasonable maximum
  description: 'Amount must be between 0.000001 and 1,000,000'
}
```

### 6. Group Related Options

For select/radio parameters, organize options logically:

```typescript
{
  name: 'network',
  label: 'Network',
  type: 'select',
  required: true,
  options: [
    // Mainnets first
    { label: 'Ethereum Mainnet', value: 'ethereum' },
    { label: 'Avalanche C-Chain', value: 'avalanche' },
    { label: 'Celo Mainnet', value: 'celo' },
    // Then testnets
    { label: 'Avalanche Fuji (Testnet)', value: 'fuji' },
    { label: 'Celo Alfajores (Testnet)', value: 'alfajores' }
  ]
}
```

## Parameter Examples by Use Case

### Token Transfer

```typescript
const transferParams = [
  createParameter(PARAM_TEMPLATES.ADDRESS, {
    name: 'to',
    label: 'Recipient Address'
  }),
  createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
    name: 'amount',
    label: 'Amount to Send',
    min: 0.000001
  })
];
```

### NFT Minting

```typescript
const mintParams = [
  createParameter(PARAM_TEMPLATES.ADDRESS, {
    name: 'to',
    label: 'Mint To Address',
    value: 'sender'  // Default to current user
  }),
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'select',
    required: true,
    options: [
      { label: '1 NFT', value: 1 },
      { label: '3 NFTs', value: 3 },
      { label: '5 NFTs', value: 5 }
    ]
  }
];
```

### DAO Voting

```typescript
const voteParams = [
  createParameter(PARAM_TEMPLATES.INTEGER, {
    name: 'proposalId',
    label: 'Proposal ID'
  }),
  {
    name: 'support',
    label: 'Your Vote',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes - Support this proposal', value: true },
      { label: 'No - Oppose this proposal', value: false }
    ]
  }
];
```

### API Form

```typescript
const formParams = [
  createParameter(PARAM_TEMPLATES.EMAIL, {
    name: 'email',
    label: 'Email Address'
  }),
  {
    name: 'feedback',
    label: 'Your Feedback',
    type: 'textarea',
    required: true,
    maxLength: 1000,
    description: 'Tell us what you think'
  },
  {
    name: 'rating',
    label: 'Rating',
    type: 'select',
    required: true,
    options: [
      { label: '⭐ Poor', value: 1 },
      { label: '⭐⭐ Fair', value: 2 },
      { label: '⭐⭐⭐ Good', value: 3 },
      { label: '⭐⭐⭐⭐ Very Good', value: 4 },
      { label: '⭐⭐⭐⭐⭐ Excellent', value: 5 }
    ]
  }
];
```

---

For more examples and advanced parameter configurations, see the [Action Types](./action-types/blockchain-actions.md) documentation.