# Quick Start
## First Steps! 🚀 

This section will help you get up and running with the Sherry SDK in minutes.  
You’ll learn how to install the SDK, create your first mini-app, and validate your setup to start building interactive Web3 experiences inside social media posts.


## Basic Mini-App

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

// Create a simple token transfer metadata
const metadata: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Send AVAX',
  description: 'Quick AVAX transfer',
  actions: [
    {
      label: 'Send 0.1 AVAX',
      description: 'Transfer 0.1 AVAX to recipient',
      to: '0x1234567890123456789012345678901234567890',
      amount: 0.1,
      chains: { source: 'avalanche' },
    },
  ],
};

// Validate and process metadata
const validatedMetadata = createMetadata(metadata);

 import { createMetadata, Metadata, ActionFlow } from '@sherrylinks/sdk';
// Create a flow with multiple steps and decision points
 const swapFlow: ActionFlow = {
 type: 'flow',
 label: 'Token Swap',
 initialActionId: 'select-tokens',
 actions: [
   // Step 1: Select tokens and amount
 {
 id: 'select-tokens',
 type: 'http',
 label: 'Select Tokens',
 path: 'https://api.example.com/quote',
 params: [
 // Token selection parameters...
 ],
 nextActions: [{ actionId: 'review-quote' }],
 },
// Step 2: Review and decide
{
  id: 'review-quote',
  type: 'decision',
  label: 'Review Quote',
  title: 'Review Your Swap',
  options: [
    { label: 'Confirm', value: 'confirm', nextActionId: 'execute-swap' },
    { label: 'Cancel', value: 'cancel', nextActionId: 'cancelled' },
  ],
},

// Step 3: Execute swap
{
  id: 'execute-swap',
  type: 'blockchain',
  label: 'Swap Tokens',
  address: '0xRouterAddress',
  // ... other blockchain action properties
  nextActions: [
    {
      actionId: 'success',
      conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'success' }],
    },
    {
      actionId: 'failed',
      conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'error' }],
    },
  ],
},


```
## Completion states

```typescript
{
  id: 'success',
  type: 'completion',
  label: 'Swap Complete',
  message: 'Your swap was successful!',
  status: 'success',
},

{
  id: 'failed',
  type: 'completion',
  label: 'Swap Failed',
  message: 'Your swap failed. Please try again.',
  status: 'error',
},
{
  id: 'cancelled',
  type: 'completion',
  label: 'Swap Cancelled',
  message: 'You cancelled the swap.',
  status: 'info',
},

],
 };
``` 
## Add to Metadata 

```typescript
 const flowMetadata: Metadata = {
 url: 'https://swap.example',
 icon: 'https://example.com/swap-icon.png',
 title: 'Advanced Token Swap',
 description: 'Swap tokens with our guided flow',
 actions: [swapFlow],
 };
 ```




