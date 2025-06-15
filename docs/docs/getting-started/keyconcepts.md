# Key Concepts

## Metadata

## What is Metadata?

The metadata is the **backbone of every trigger built using the Sherry SDK**. It's a structured JSON object that defines how your trigger behaves, how it interacts with blockchain smart contracts, and how it is rendered for users.

By carefully crafting the metadata, developers can create triggers tailored to various use cases, from executing token swaps to interacting with complex decentralized protocols.

This is how you define your trigger's content and behavior:

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

2. **icon\***: URL of the trigger's visual representation. <br/>
   Example: "https://mi-image.com"

3. **title\***: The title displayed in the user interface. <br/>
   Example: "sherry.social"

4. **description\***: A short explanation of the trigger's purpose. <br/>
   Example: "Claim your early supporter badge"

5. **baseurl** : solo depende de si usas dynamic actions

6. **actions\***: <br/>
   Puede variar dependiendo de que action se vaya a usar.

# Understanding Actions and Parameters

Actions are the core of triggers, defining what a user can do. Parameters specify the inputs required for those actions.

## Actions

In Sherry, **actions** are the core interactive units that define what a trigger can do.  
Each action represents a specific task the user can trigger—such as sending tokens, calling a smart contract, making an HTTP request, or initiating a multi-step flow.

Actions determine:

- What will be executed (e.g., a transfer, a contract call, an API request)
- What input the user must provide
- On which blockchain(s) the action will take place

Sherry supports different types of actions, each tailored to common Web3 interactions.

### Action Types

#### BlockchainAction

For interacting with smart contracts on various blockchains.

```typescript
import { Metadata } from '@sherrylinks/sdk';

const nftMintAction: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'NFT Minter',
  description: 'Mint awesome NFTs',
  actions: [
    {
      type: 'blockchain',
      label: 'Mint NFT',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      abi: nftAbi,
      functionName: 'safeMint',
      chains: { source: 'avalanche' },
      params: [
        {
          name: 'to',
          label: 'Recipient Address',
          type: 'address',
          required: true,
        },
      ],
    },
  ],
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
  actions: [
    {
      type: 'transfer',
      label: 'Send 0.1 AVAX',
      to: '0x1234567890123456789012345678901234567890',
      amount: 0.1,
      chains: { source: 'avalanche' },
    },
  ],
};
```

#### HttpAction

For making HTTP requests to external APIs.

```typescript
const httpActionExample = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Submit Feedback',
  description: 'Send feedback to our API',
  actions: [
    {
      type: 'http',
      label: 'Submit Feedback',
      path: 'https://api.example.com/feedback',
      params: [
        {
          name: 'message',
          label: 'Your Message',
          type: 'textarea', // Using 'textarea' for multi-line
          required: true,
        },
        {
          name: 'rating',
          label: 'Rating',
          type: 'select',
          required: true,
          options: [
            { label: '1 Star', value: 1 }, // Simplified labels
            { label: '5 Stars', value: 5 },
          ],
        },
      ],
    },
  ],
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
  actions: [
    {
      type: 'dynamic',
      label: 'Smart Swap',
      path: '/api/swap',
      chains: { source: 'avalanche' },
      params: [
        {
          name: 'amount',
          label: 'Amount to Swap',
          type: 'number',
          required: true,
        },
      ],
    },
  ],
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
      params: [
        /* ... */
      ],
      nextActions: [{ actionId: 'execute-swap' }],
    },
    {
      id: 'execute-swap',
      type: 'blockchain',
      label: 'Execute Swap',
      address: '0xDEXAddress',
      abi: dexAbi,
      functionName: 'swap',
      chains: { source: 'avalanche' },
      params: [
        /* ... */
      ],
      nextActions: [{ actionId: 'swap-complete' }],
    },
    {
      id: 'swap-complete',
      type: 'completion',
      label: 'Swap Complete',
      message: 'Your swap was successful!',
      status: 'success',
    },
  ],
};
```

## Parameters

Parameters define the inputs a user provides when executing actions. They control the UI generation and validation for each required field. Each parameter has a `name`, `label`, `type`, and can include other properties like `required`, `description`, `value`, and type-specific validation rules (e.g., `minLength`, `maxSize`).

For detailed information on all parameter types and their properties, see the [Action Parameters API Reference](../api-reference/parameters/parameters.md).

### Parameter Types Overview

Sherry SDK supports a variety of parameter types to build rich user interfaces:

*   **Text-Based:** For single-line text, email, URLs, multi-line text areas.
    *   Example: `type: 'text'`, `type: 'email'`, `type: 'textarea'`
*   **Number-Based:** For numerical inputs, including dates and times.
    *   Example: `type: 'number'`, `type: 'datetime'`
*   **Address:** For blockchain addresses.
    *   Example: `type: 'address'`
*   **Boolean:** For true/false checkboxes.
    *   Example: `type: 'boolean'`
*   **Selection:** For dropdowns (`select`) and radio buttons (`radio`).
    *   Example: `type: 'select'`, `type: 'radio'`
*   **File Uploads:** For general files (`file`) and images (`image`) with specific validations.
    *   Example: `type: 'file'`, `type: 'image'`

Each type comes with specific validation properties. Refer to the [detailed parameter documentation](../api-reference/parameters/parameters.md) for comprehensive examples and all configurable properties.

### Parameter Templates

Use predefined templates for common parameters to ensure consistency and reduce boilerplate.

```typescript
import { PARAM_TEMPLATES, createParameter } from '@sherrylabs/sdk'; // Assuming correct import path

// Address parameter
const recipientParam = createParameter(PARAM_TEMPLATES.ADDRESS, {
  name: 'recipient',
  label: 'Destination Address',
});

// Amount parameter
const amountParam = createParameter(PARAM_TEMPLATES.AMOUNT, {
  name: 'transferAmount',
  label: 'Amount to Send',
  min: 0.01,
});

// Yes/No selection
const confirmParam = createParameter(PARAM_TEMPLATES.YES_NO, {
  name: 'confirmation',
  label: 'Confirm transaction?',
});
```

Available templates include (but are not limited to):

- `ADDRESS`
- `AMOUNT`
- `EMAIL`
- `TEXT`
- `BOOLEAN`
- `YES_NO` (typically a radio or select with Yes/No options)

---

In the following sections, we'll explore each action type in detail and explain how to configure parameters for your specific use cases.

## Validation

Sherry SDK includes built-in validators to ensure your trigger structure is solid before deployment.
