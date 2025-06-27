---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/creating-miniapps.md
sidebar_position: 2
---

# Creating Mini-Apps

Learn how to build interactive Web3 mini-apps using the Sherry SDK. This guide covers everything from basic concepts to advanced implementations, helping you create engaging social media experiences that seamlessly integrate blockchain functionality.

## Understanding Mini-Apps

Mini-apps are interactive widgets that embed directly into social media posts, allowing users to perform Web3 actions without leaving their social feed. They consist of metadata that defines the app structure and actions that users can execute.

### Core Components

Every mini-app has three essential parts:

1. **Metadata:** Defines the app's appearance, description, and available actions
2. **Actions:** Interactive elements users can execute (transfers, smart contracts, APIs)
3. **Parameters:** User inputs required to complete actions (amounts, addresses, choices)

## The Metadata Interface

The `Metadata` object is the foundation of every mini-app. It defines how your app appears to users and what actions they can perform.

```typescript
interface Metadata {
  url: string; // Unique identifier URL for your app
  icon: string; // Public URL to your app icon
  title: string; // Display name shown to users
  description: string; // Brief explanation of functionality
  baseUrl?: string; // API server URL (optional, auto-detected)
  actions: Action[]; // Array of interactive actions
}
```

### Property Details

**`url`** - Your app's unique identifier

- Must be a URL you control (e.g., `https://myapp.com/tip-jar`)
- Used for app discovery and verification
- Should be stable and permanent

**`icon`** - Visual representation of your app

- Public URL to an image file (PNG, SVG, or JPG)
- Recommended size: 200x200 pixels
- Should be accessible without authentication

**`title`** - User-facing app name

- Keep it concise (2-5 words)
- Clearly describes the app's purpose
- Shown prominently in the UI

**`description`** - Explains what your app does

- One sentence describing the main functionality
- Helps users understand the value proposition
- Keep under 100 characters for best display

**`baseUrl`** - Your API server location (optional)

- Auto-detected from the request in most cases
- Override when using custom domains or proxies
- Must be publicly accessible for the app to work

**`actions`** - Interactive elements users can execute

- Array of different action types
- At least one action is required
- Each action represents a button/interaction

## Quick Start Examples

### Example 1: Simple Tip Jar

A basic mini-app that allows users to send tips with predefined amounts:

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

const tipJarApp: Metadata = {
  url: 'https://myapp.com/tip-jar',
  icon: 'https://myapp.com/icons/tip.png',
  title: 'Creator Tip Jar',
  description: 'Support your favorite content creator',
  actions: [
    {
      type: 'transfer',
      label: 'Send Tip',
      chains: { source: 43114 }, // Avalanche mainnet
      to: '0x742d35Cc6734C0532925a3b8D4ccd306f6F4B26C',
      amountConfig: {
        type: 'radio',
        label: 'Tip Amount',
        options: [
          { label: 'Coffee', value: 0.01, description: '0.01 AVAX' },
          { label: 'Lunch', value: 0.05, description: '0.05 AVAX' },
          { label: 'Dinner', value: 0.1, description: '0.1 AVAX' },
        ],
      },
    },
  ],
};

export default createMetadata(tipJarApp);
```

### Example 2: NFT Minting

A mini-app that allows users to mint NFTs with custom parameters:

```typescript
const nftMintApp: Metadata = {
  url: 'https://mynft.com/mint',
  icon: 'https://mynft.com/icon.png',
  title: 'Mint Cosmic NFT',
  description: 'Mint your unique cosmic NFT collection',
  actions: [
    {
      type: 'blockchain',
      label: 'Mint NFT',
      address: '0xNFTContractAddress',
      abi: nftContractAbi,
      functionName: 'mint',
      chains: { source: 43114 },
      amount: 0.1, // Mint cost in AVAX
      params: [
        {
          name: 'to',
          label: 'Recipient Address',
          type: 'address',
          required: true,
          description: 'Address that will receive the NFT',
        },
        {
          name: 'rarity',
          label: 'NFT Rarity',
          type: 'select',
          required: true,
          options: [
            { label: 'Common', value: 1 },
            { label: 'Rare', value: 2 },
            { label: 'Epic', value: 3 },
            { label: 'Legendary', value: 4 },
          ],
        },
      ],
    },
  ],
};
```

### Example 3: Email Collection + Token Reward

A multi-action app that collects emails and rewards users with tokens:

```typescript
const emailRewardApp: Metadata = {
  url: 'https://newsletter.com/signup',
  icon: 'https://newsletter.com/icon.png',
  title: 'Newsletter Signup',
  description: 'Join our newsletter and get reward tokens',
  actions: [
    {
      type: 'http',
      label: 'Join Newsletter',
      path: 'https://api.newsletter.com/signup',
      params: [
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          description: 'Your email for newsletter updates',
        },
        {
          name: 'interests',
          label: 'Your Interests',
          type: 'select',
          required: false,
          options: [
            { label: 'DeFi Updates', value: 'defi' },
            { label: 'NFT News', value: 'nft' },
            { label: 'Gaming', value: 'gaming' },
          ],
        },
      ],
    },
    {
      type: 'blockchain',
      label: 'Claim Reward Tokens',
      address: '0xRewardTokenContract',
      abi: tokenAbi,
      functionName: 'claimReward',
      chains: { source: 43114 },
      params: [
        {
          name: 'recipient',
          label: 'Your Wallet',
          type: 'address',
          required: true,
        },
      ],
    },
  ],
};
```

## Validation & Error Handling

The Sherry SDK provides robust validation to ensure your mini-apps work correctly. Always validate your metadata before deployment.

### Using createMetadata()

The recommended approach for validation:

```typescript
import { createMetadata } from '@sherrylinks/sdk';

try {
  const validatedMetadata = createMetadata(tipJarApp);
  console.log('Mini-app validated successfully!');

  // Use validated metadata for your app
  return validatedMetadata;
} catch (error) {
  console.error('Validation failed:', error.message);
  // Handle validation errors
}
```

### Using validateMetadata()

For more detailed validation information:

```typescript
import { validateMetadata } from '@sherrylinks/sdk';

const validationResult = validateMetadata(tipJarApp);

if (validationResult.isValid) {
  console.log('Metadata is valid:', validationResult.data);
} else {
  console.error('Validation errors:', validationResult.errors);
  // Handle specific validation issues
  validationResult.errors.forEach(error => {
    console.log(`Field: ${error.field}, Issue: ${error.message}`);
  });
}
```

### Common Validation Errors

**Missing Required Fields**

```typescript
// ❌ Missing required 'actions' field
const invalidMetadata = {
  url: 'https://myapp.com',
  title: 'My App',
  description: 'Description',
  // actions: [] // Missing!
};
```

**Invalid URLs**

```typescript
// ❌ Invalid URL format
const invalidMetadata = {
  url: 'not-a-valid-url', // Must be a valid URL
  icon: 'also-invalid', // Must be a valid URL
  // ...
};
```

**Invalid Action Configuration**

```typescript
// ❌ Invalid action type
const invalidAction = {
  type: 'invalid-type', // Must be 'transfer', 'blockchain', 'http', etc.
  label: 'Do Something',
};
```

## Action Types Overview

The Sherry SDK supports several action types, each designed for specific use cases:

### Transfer Actions

Perfect for simple token transfers with built-in UI components:

```typescript
{
  type: 'transfer',
  label: 'Send Payment',
  chains: { source: 43114 },
  to: '0x...', // Fixed recipient
  amount: 0.1  // Fixed amount
}
```

**When to use:** Tips, donations, simple payments, fixed-amount transfers

### Blockchain Actions

For smart contract interactions with custom ABIs:

```typescript
{
  type: 'blockchain',
  label: 'Mint NFT',
  address: '0xContractAddress',
  abi: contractAbi,
  functionName: 'mint',
  chains: { source: 43114 },
  params: [/* custom parameters */]
}
```

**When to use:** NFT minting, token swaps, DAO voting, DeFi operations

### HTTP Actions

For data collection and external API integration:

```typescript
{
  type: 'http',
  label: 'Submit Form',
  path: 'https://api.myapp.com/submit',
  params: [/* form parameters */]
}
```

**When to use:** Email collection, surveys, data submission, external integrations

### Dynamic Actions

For server-side computed actions with complex business logic:

```typescript
{
  type: 'dynamic',
  label: 'Smart Execute',
  path: '/api/compute',
  chains: { source: 43114 },
  params: [/* input parameters */]
}
```

**When to use:** Complex calculations, real-time pricing, conditional logic

## Best Practices

### Metadata Design

- **Clear Titles:** Use descriptive, action-oriented titles
- **Helpful Descriptions:** Explain value proposition in one sentence
- **Professional Icons:** Use high-quality, recognizable icons
- **Stable URLs:** Use URLs you control and won't change

### User Experience

- **Minimal Friction:** Reduce the number of required inputs
- **Clear Labels:** Use user-friendly parameter labels
- **Helpful Descriptions:** Add context for complex parameters
- **Error Handling:** Provide clear error messages

### Security Considerations

- **Validate Inputs:** Always validate user inputs server-side
- **Rate Limiting:** Implement rate limiting on your APIs
- **CORS Headers:** Configure proper CORS for cross-origin requests
- **Input Sanitization:** Sanitize all user inputs before processing

### Performance Optimization

- **Small Icons:** Optimize icon file sizes for fast loading
- **Minimal Parameters:** Only ask for essential information
- **Fast APIs:** Ensure your backend responds quickly
- **Caching:** Cache static content where possible

## Testing Your Mini-App

### Local Development

1. Create your metadata object
2. Validate using `createMetadata()`
3. Test with the Sherry debugger
4. Deploy to a public URL for testing

### Production Deployment

1. Deploy your API to a reliable hosting provider
2. Ensure CORS headers are properly configured
3. Test all user flows thoroughly
4. Monitor performance and error rates

## Next Steps

Now that you understand the basics, explore specific action types:

- **[Transfer Actions](../api-reference/action-types/transfer-actions.md)** - Simple token transfers
- **[Blockchain Actions](../api-reference/action-types/blockchain-actions.md)** - Smart contract interactions
- **[Dynamic Actions](../api-reference/action-types/dynamic-actions.mdx)** - Server-side logic
- **[Action Parameters](../api-reference/parameters/parameters.md)** - User input configuration
- **[Complete Tutorial](../guides/guide-en.mdx)** - End-to-end implementation guide
