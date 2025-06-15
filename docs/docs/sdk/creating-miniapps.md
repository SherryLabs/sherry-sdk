---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/creating-miniapps.md
sidebar_position: 2
---

# Creating Triggers

The heart of a Sherry trigger is the `Metadata` object. This object defines how your trigger looks and what it does.

## The `Metadata` Interface

```typescript
// src/interface/metadata.ts
export interface Metadata {
  url: string; // Unique identifying URL for your trigger
  icon: string; // URL of the icon to display
  title: string; // Main title of the trigger
  description: string; // Short description
  actions: Action[]; // Array of actions the trigger can perform
}
```

- `url`: Must be a unique URL that identifies your application. Using a URL under your control is recommended.
- `icon`: A URL to an image (preferably PNG or SVG) representing your trigger.
- `title`: A concise and descriptive title.
- `description`: A brief explanation of what the trigger does.
- `actions`: An array containing one or more action definitions. These can be `BlockchainActionMetadata`, `TransferAction`, `HttpAction`, or `ActionFlow`.

## Basic Example

Here's a simple example of `Metadata` for a trigger that allows sending 0.1 AVAX to a fixed address:

```typescript
import { Metadata, TransferAction } from '@sherrylinks/sdk';

const simpleTransferApp: Metadata = {
  url: 'https://transfer.myapp.example/simple-avax',
  icon: 'https://myapp.example/icons/avax-transfer.png',
  title: 'Send 0.1 AVAX',
  description: 'Quickly send 0.1 AVAX to the project treasury.',
  actions: [
    {
      label: 'Send 0.1 AVAX', // Button/action label
      description: 'Transfer 0.1 AVAX to the treasury.', // Contextual help
      to: '0xTreasuryAddress...', // Fixed destination address
      amount: 0.1, // Fixed amount
      chains: { source: 'avalanche' }, // Source chain
    } as TransferAction, // Type assertion is good practice
  ],
};
```

## Validation

Before using your `Metadata`, it's crucial to validate it to ensure it meets the expected format and that the actions are well-defined. You can use the `createMetadata` or `validateMetadata` functions.

```typescript
import { createMetadata, validateMetadata } from '@sherrylinks/sdk';

try {
  // Option 1: createMetadata (throws error if invalid)
  const validatedMetadata = createMetadata(simpleTransferApp);
  console.log('Metadata is valid and processed!');

  // Option 2: validateMetadata (returns an object with details)
  const validationResult = validateMetadata(simpleTransferApp);
  if (validationResult.isValid) {
    console.log('Metadata is valid:', validationResult.data);
  } else {
    console.error('Validation errors:', validationResult.errors);
  }
} catch (error) {
  console.error('Error creating metadata:', error);
}
```

See the [Validation](./validation.md) section for more details.

Now that you understand the basic structure, let's explore the different [Action Types](./action-types/blockchain-actions.md) you can include.
