# Key Concepts

## 📦 Metadata

## What is Metadata?

The metadata is the **backbone of every mini-app built using the Sherry SDK**. It’s a structured JSON object that defines how your mini-app behaves, how it interacts with blockchain smart contracts, and how it is rendered for users.

By carefully crafting the metadata, developers can create mini-apps tailored to various use cases, from executing token swaps to interacting with complex decentralized protocols.

This is how you define your mini-app's content and behavior:

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

interface Metadata {
  url: string;
  icon: string;
  title: string;
  description: string;
  actions: Action[];
  baseUrl?: string;
}
```

1. **url\***: The url that will be shown.<br/>
   Example: "https://sherry.social/links"

2. **icon\***: URL of the mini-app's visual representation. <br/>
   Example: "https://mi-image.com"

3. **title\***: The title displayed in the user interface. <br/>
   Example: "sherry.social"

4. **description\***: A short explanation of the mini-app's purpose. <br/>
   Example: "Claim your early supporter badge"

5. **baseurl** : solo depende de si usas dynamic actions

6. **actions\***: <br/>
   Puede variar dependiendo de que action se vaya a usar.

# Understanding Actions and Parameters

## ⚙️ Actions

In Sherry, **actions** are the core interactive units that define what a mini-app can do.  
Each action represents a specific task the user can trigger—such as sending tokens, calling a smart contract, making an HTTP request, or initiating a multi-step flow.

Actions determine:
- What will be executed (e.g., a transfer, a contract call, an API request)
- What input the user must provide
- On which blockchain(s) the action will take place

Sherry supports different types of actions, each tailored to common Web3 interactions.

### ⚙️ Action Types

#### BlockchainAction

For interacting with smart contracts on various blockchains.

```typescript
import { Metadata } from '@sherrylinks/sdk';

const nftMintAction: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'NFT Minter',
  description: 'Mint awesome NFTs',
  actions: [{
    type: 'blockchain',
    label: 'Mint NFT',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    abi: nftAbi,
    functionName: 'safeMint',
    chains: { source: 'avalanche' },
    params: [{
      name: 'to',
      label: 'Recipient Address',
      type: 'address',
      required: true
    }]
  }]
};
```

#### TransferAction

For sending native tokens between addresses.

```typescript
const transferAction: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png', 
  title: 'Send AVAX',
  description: 'Quick AVAX transfer',
  actions: [{
    type: 'transfer',
    label: 'Send 0.1 AVAX',
    to: '0x1234567890123456789012345678901234567890',
    amount: 0.1,
    chains: { source: 'avalanche' }
  }]
};
```

#### HttpAction

For making HTTP requests to external APIs.

```typescript
const httpAction: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Submit Feedback',
  description: 'Send feedback to our API',
  actions: [{
    type: 'http',
    label: 'Submit Feedback',
    path: 'https://api.example.com/feedback',
    params: [{
      name: 'message',
      label: 'Your Message',
      type: 'textarea',
      required: true
    }, {
      name: 'rating',
      label: 'Rating',
      type: 'select',
      required: true,
      options: [
        { label: '⭐', value: 1 },
        { label: '⭐⭐⭐⭐⭐', value: 5 }
      ]
    }]
  }]
};
```

#### DynamicAction

For flexible actions where logic is computed server-side.

```typescript
const dynamicAction: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Dynamic Swap',
  description: 'Smart token swapping',
  baseUrl: 'https://myapp.example',
  actions: [{
    type: 'dynamic',
    label: 'Smart Swap',
    path: '/api/swap',
    chains: { source: 'avalanche' },
    params: [{
      name: 'amount',
      label: 'Amount to Swap',
      type: 'number',
      required: true
    }]
  }]
};
```

#### ActionFlow

For multi-step processes with conditional logic.

```typescript
import { ActionFlow } from '@sherrylinks/sdk';

const swapFlow: ActionFlow = {
  type: 'flow',
  label: 'Token Swap Flow',
  initialActionId: 'approve-tokens',
  actions: [
    {
      id: 'approve-tokens',
      type: 'blockchain',
      label: 'Approve Tokens',
      address: '0xTokenAddress',
      abi: erc20Abi,
      functionName: 'approve',
      chains: { source: 'avalanche' },
      params: [/* ... */],
      nextActions: [{ actionId: 'execute-swap' }]
    },
    {
      id: 'execute-swap', 
      type: 'blockchain',
      label: 'Execute Swap',
      address: '0xDEXAddress',
      abi: dexAbi,
      functionName: 'swap',
      chains: { source: 'avalanche' },
      params: [/* ... */],
      nextActions: [{ actionId: 'swap-complete' }]
    },
    {
      id: 'swap-complete',
      type: 'completion',
      label: 'Swap Complete',
      message: 'Your swap was successful!',
      status: 'success'
    }
  ]
};
```

## ⚙️ Parameters

Parameters define the inputs a user provides when executing actions. They control the UI generation and validation for each required field.

### Parameter Types

All parameters extend from `BaseParameter`:

```typescript
interface BaseParameter {
  name: string;           // Parameter identifier
  label: string;          // UI label  
  type: string;           // Input type
  required?: boolean;     // Is mandatory?
  description?: string;   // Help text
  fixed?: boolean;        // Is non-editable?
  value?: any;           // Default/fixed value
}
```

#### StandardParameter

For common input types (text, numbers, addresses, booleans):

```typescript
// Text input
{
  name: 'message',
  label: 'Your Message',
  type: 'text',
  required: true,
  minLength: 5,
  maxLength: 100
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

// Address input
{
  name: 'recipient',
  label: 'Recipient Address', 
  type: 'address',
  required: true
}

// Boolean input
{
  name: 'confirm',
  label: 'I agree to terms',
  type: 'boolean',
  required: true
}
```

#### SelectParameter

For dropdown selections:

```typescript
{
  name: 'token',
  label: 'Select Token',
  type: 'select',
  required: true,
  options: [
    { label: 'USDC', value: '0xUSDCAddress', description: 'USD Coin' },
    { label: 'USDT', value: '0xUSDTAddress', description: 'Tether USD' }
  ]
}
```

#### RadioParameter

For radio button selections:

```typescript
{
  name: 'priority',
  label: 'Priority Level',
  type: 'radio', 
  required: true,
  options: [
    { label: 'Low', value: 'low', description: 'Standard processing' },
    { label: 'High', value: 'high', description: 'Priority processing' }
  ]
}
```

### Parameter Templates

Use predefined templates for common parameters:

```typescript
import { PARAM_TEMPLATES, createParameter } from '@sherrylinks/sdk';

// Address parameter
const recipientParam = createParameter(PARAM_TEMPLATES.ADDRESS, {
  name: 'recipient',
  label: 'Destination Address'
});

// Amount parameter
const amountParam = createParameter(PARAM_TEMPLATES.AMOUNT, {
  name: 'transferAmount', 
  label: 'Amount to Send',
  min: 0.01
});

// Yes/No selection
const confirmParam = createParameter(PARAM_TEMPLATES.YES_NO, {
  name: 'confirmation',
  label: 'Confirm transaction?'
});
```

Available templates include:
- `ADDRESS` - Ethereum address input
- `AMOUNT` - Numeric amount for transfers
- `EMAIL` - Email address input
- `TEXT` - Basic text input
- `BOOLEAN` - Boolean checkbox
- `YES_NO` - Yes/No radio selection
- `TOKEN_SELECT` - Common token dropdown

---

In the following sections, we'll explore each action type in detail and explain how to configure parameters for your specific use cases.

## ✅ Validation

Sherry SDK includes built-in validators to ensure your mini-app structure is solid before deployment.
