# Transfer Actions

## Simple & Interactive Native Token Transfers

Transfer Actions are designed for **simple, user-friendly native token transfers** (ETH, AVAX, CELO). They provide the easiest way to send blockchain native currencies with built-in interactive UI components - no ABI knowledge required.

## Why Transfer Actions?

Unlike Blockchain Actions that require contract knowledge, or Dynamic Actions that need server logic, Transfer Actions are:

- **Purpose-built** for native token transfers
- **Highly interactive** with built-in UI configurability
- **Zero complexity** - no ABIs, no contracts, just send tokens
- **Mobile-optimized** with beautiful selection interfaces
- **Instant setup** - works in minutes, not hours

## Interface

```typescript
interface TransferAction {
  type: 'transfer';
  label: string; // Button text shown to users
  description?: string; // Optional help text
  chains: ChainContext; // Source and optional destination

  // Simple Configuration (fixed values)
  to?: AddressOrSender; // Fixed recipient address or 'sender'
  amount?: number; // Fixed amount in native units

  // Interactive Configuration (user choices)
  recipient?: RecipientConfig; // Let user choose recipient
  amountConfig?: AmountConfig; // Let user choose amount
}

// Type for addresses that can be either valid addresses or 'sender' keyword
type AddressOrSender = `0x${string}` | 'sender';
```

## 🆕 Special 'sender' Keyword

Transfer Actions support the special `'sender'` keyword that automatically resolves to the user's wallet address at runtime:

```typescript
// Transfer to the user themselves (self-transfer)
const selfTransfer: TransferAction = {
  type: 'transfer',
  label: 'Return Refund',
  description: 'Refund will be sent back to your wallet',
  chains: { source: 43114 },
  to: 'sender', // Resolves to user's address automatically
  amount: 0.05,
};

// Let users choose including themselves as an option
const flexibleRecipient: TransferAction = {
  type: 'transfer',
  label: 'Send Payment',
  description: 'Send to team member or keep for yourself',
  chains: { source: 43114 },
  recipient: {
    type: 'select',
    label: 'Recipient',
    defaultValue: 'sender', // Default to sending to themselves
    options: [
      { label: 'Keep for myself 👤', value: 'sender' },
      { label: 'Alice - Developer 👩‍💻', value: '0x1111...' },
      { label: 'Bob - Designer 👨‍🎨', value: '0x2222...' },
    ],
  },
  amount: 1.0,
};
```

### When to Use 'sender'

- **Refunds**: Automatically return funds to the user
- **Self-transactions**: Users interacting with their own accounts
- **Flexible options**: Include user as a recipient choice
- **Testing**: Easy testing without hardcoded addresses

## Configuration Options

### Simple Fixed Transfers

For straightforward transfers with predetermined values:

```typescript
const simpleDonation: TransferAction = {
  type: 'transfer',
  label: 'Donate 0.1 AVAX',
  description: 'Support our project development',
  chains: { source: 43114 },
  to: '0x742d35Cc6734C0532925a3b8D4ccd306f6F4B26C',
  amount: 0.1,
};
```

### Interactive Recipient Selection

Let users choose from predefined recipients:

```typescript
const charityDonation: TransferAction = {
  type: 'transfer',
  label: 'Support a Cause',
  description: 'Choose your preferred charity',
  chains: { source: 42220 },
  recipient: {
    type: 'select',
    label: 'Select Charity',
    required: true,
    options: [
      {
        label: 'Education Fund 🎓',
        value: '0x1234567890123456789012345678901234567890',
        description: 'Supporting education initiatives worldwide',
      },
      {
        label: 'Climate Action 🌍',
        value: '0x2345678901234567890123456789012345678901',
        description: 'Fighting climate change through technology',
      },
      {
        label: 'Healthcare Access 🏥',
        value: '0x3456789012345678901234567890123456789012',
        description: 'Improving healthcare in underserved communities',
      },
    ],
  },
  amount: 0.05, // Fixed amount, user chooses recipient
};
```

### Interactive Amount Selection

Let users choose from predefined amounts:

```typescript
const creatorTipping: TransferAction = {
  type: 'transfer',
  label: 'Tip Creator',
  description: 'Show appreciation for great content',
  chains: { source: 43114 },
  to: '0x9876543210987654321098765432109876543210', // Fixed recipient
  amountConfig: {
    type: 'radio',
    label: 'Tip Amount',
    required: true,
    options: [
      {
        label: 'Coffee ☕',
        value: 0.01,
        description: '0.01 AVAX (~$0.50)',
      },
      {
        label: 'Lunch 🍕',
        value: 0.05,
        description: '0.05 AVAX (~$2.50)',
      },
      {
        label: 'Dinner 🍽️',
        value: 0.1,
        description: '0.1 AVAX (~$5.00)',
      },
      {
        label: 'Generous 💰',
        value: 0.5,
        description: '0.5 AVAX (~$25.00)',
      },
    ],
  },
};
```

### Fully Interactive (Both Recipient and Amount)

Let users customize everything:

```typescript
const flexiblePayment: TransferAction = {
  type: 'transfer',
  label: 'Send Payment',
  description: 'Send AVAX to team members',
  chains: { source: 43114 },

  recipient: {
    type: 'select',
    label: 'Team Member',
    required: true,
    options: [
      {
        label: 'Alice - Frontend Dev 👩‍💻',
        value: '0x1111111111111111111111111111111111111111',
        description: 'Lead Frontend Developer',
      },
      {
        label: 'Bob - Backend Dev 👨‍💻',
        value: '0x2222222222222222222222222222222222222222',
        description: 'Senior Backend Engineer',
      },
      {
        label: 'Carol - Designer 🎨',
        value: '0x3333333333333333333333333333333333333333',
        description: 'UI/UX Designer',
      },
    ],
  },

  amountConfig: {
    type: 'select',
    label: 'Payment Amount',
    required: true,
    options: [
      {
        label: 'Bonus Payment',
        value: 0.5,
        description: '0.5 AVAX bonus',
      },
      {
        label: 'Weekly Salary',
        value: 2.0,
        description: '2.0 AVAX weekly',
      },
      {
        label: 'Project Completion',
        value: 5.0,
        description: '5.0 AVAX milestone',
      },
    ],
  },
};
```

## Cross-Chain Transfers

Transfer Actions support cross-chain operations:

```typescript
const crossChainTransfer: TransferAction = {
  type: 'transfer',
  label: 'Bridge to Celo',
  description: 'Send tokens from Avalanche to Celo network',
  chains: {
    source: 43114,
    destination: 42220,
  },
  // When neither to/amount nor configs are specified,
  // user gets standard input fields for both
};
```

## Configuration Interfaces

### RecipientConfig

```typescript
interface RecipientConfig {
  type?: 'select' | 'radio'; // UI component type
  label?: string; // Field label
  description?: string; // Help text
  required?: boolean; // Is selection required
  defaultValue?: AddressOrSender; // Default selection (address or 'sender')
  options?: SelectOption[]; // Predefined recipients
}
```

### AmountConfig

```typescript
interface AmountConfig {
  type?: 'select' | 'radio'; // UI component type
  label?: string; // Field label
  description?: string; // Help text
  required?: boolean; // Is selection required
  defaultValue?: number; // Default amount
  options?: SelectOption[]; // Predefined amounts
}
```

### SelectOption

```typescript
interface SelectOption {
  label: string; // Display text
  value: string | number; // Actual value (address or amount)
  description?: string; // Optional help text
}
```

## Advanced Examples

### Social Media Tipping with Context

```typescript
const contextualTipping: TransferAction = {
  type: 'transfer',
  label: 'Tip for this Post',
  description: 'Reward quality content creation',
  chains: { source: 42220 },
  to: '0xContentCreatorAddress',

  amountConfig: {
    type: 'radio',
    label: 'How much did you enjoy this?',
    required: true,
    options: [
      {
        label: 'Liked it 👍',
        value: 0.01,
        description: '0.01 CELO - Quick appreciation',
      },
      {
        label: 'Loved it ❤️',
        value: 0.05,
        description: '0.05 CELO - Great content!',
      },
      {
        label: 'Mind blown 🤯',
        value: 0.1,
        description: '0.1 CELO - This was amazing!',
      },
    ],
  },
};
```

### Crowdfunding with Milestones

```typescript
const crowdfunding: TransferAction = {
  type: 'transfer',
  label: 'Fund This Project',
  description: 'Help us reach our funding goal',
  chains: { source: 43114 },
  to: '0xProjectFundingAddress',

  amountConfig: {
    type: 'select',
    label: 'Contribution Level',
    required: true,
    options: [
      {
        label: 'Supporter 🙌',
        value: 0.1,
        description: '0.1 AVAX - Every bit helps!',
      },
      {
        label: 'Believer 💪',
        value: 0.5,
        description: '0.5 AVAX - You believe in us!',
      },
      {
        label: 'Champion 🏆',
        value: 1.0,
        description: '1.0 AVAX - Major supporter!',
      },
      {
        label: 'Hero 🦸',
        value: 5.0,
        description: '5.0 AVAX - Project hero status!',
      },
    ],
  },
};
```

### Split Payment System

```typescript
const splitPayment: TransferAction = {
  type: 'transfer',
  label: 'Pay Team Share',
  description: 'Distribute project earnings',
  chains: { source: 43113 },

  recipient: {
    type: 'radio',
    label: 'Team Member (Equal Split)',
    required: true,
    options: [
      {
        label: 'Development Team (40%)',
        value: '0xDevTeamMultisig',
        description: '4 developers, 10% each',
      },
      {
        label: 'Marketing Team (30%)',
        value: '0xMarketingTeamMultisig',
        description: '3 marketers, 10% each',
      },
      {
        label: 'Operations (20%)',
        value: '0xOperationsAddress',
        description: 'Infrastructure and support',
      },
      {
        label: 'Reserve Fund (10%)',
        value: '0xReserveFundAddress',
        description: 'Emergency fund',
      },
    ],
  },

  amountConfig: {
    type: 'select',
    label: 'Distribution Amount',
    required: true,
    options: [
      { label: 'Weekly Distribution', value: 0.5 },
      { label: 'Monthly Distribution', value: 2.0 },
      { label: 'Quarterly Distribution', value: 6.0 },
    ],
  },
};
```

## UI Components Generated

### Select Component (Dropdown)

```typescript
type: 'select';
// Renders as:
// [Select Recipient ▼]
//   ├─ Education Fund 🎓
//   ├─ Climate Action 🌍
//   └─ Healthcare Access 🏥
```

### Radio Component (Button Group)

```typescript
type: 'radio';
// Renders as:
// ○ Coffee ☕ (0.01 AVAX)
// ○ Lunch 🍕 (0.05 AVAX)
// ● Dinner 🍽️ (0.1 AVAX) [selected]
```

## Validation

Transfer Actions automatically validate:

- **Address format** - Ensures valid Ethereum addresses or 'sender' keyword
- **Amount ranges** - Prevents negative or excessive amounts
- **Chain compatibility** - Verifies supported chains
- **Required fields** - Enforces required selections
- **Option existence** - Ensures selected options are valid
- **Special keywords** - Validates 'sender' keyword (case-insensitive)

```typescript
// Validation happens automatically
import { createMetadata } from '@sherrylinks/sdk';

try {
  const validated = createMetadata({
    // ... your metadata with transfer actions
  });
  console.log('✅ Transfer actions validated');
} catch (error) {
  console.error('❌ Validation failed:', error.message);
}
```

## Comparison with Other Action Types

| Feature                | Transfer Action        | Blockchain Action     | Dynamic Action       |
| ---------------------- | ---------------------- | --------------------- | -------------------- |
| **Purpose**            | Native token transfers | Contract interactions | Complex server logic |
| **Complexity**         | Simple                 | Medium                | Advanced             |
| **Setup Time**         | Minutes                | Hours                 | Days                 |
| **ABI Required**       | No                     | Yes                   | No                   |
| **Server Logic**       | No                     | No                    | Yes                  |
| **UI Configurability** | High                   | Medium                | Medium               |
| **Gas Efficiency**     | High                   | Medium                | Variable             |

## When to Use Transfer Actions

### Perfect for:

- Tips and donations
- Social media rewards
- Simple payments
- Crowdfunding contributions
- Team payouts
- Event ticket purchases (native token)
- Membership fees
- Content creator support

### Not suitable for:

- Token transfers (ERC-20) - use Blockchain Actions
- Complex DeFi operations - use Dynamic Actions
- Multi-step workflows - use Action Flows
- Contract function calls - use Blockchain Actions

## Best Practices

### 1. **Make Options Descriptive**

```typescript
// Good - Clear context and value
{
  label: 'Premium Support 💎',
  value: 0.1,
  description: '0.1 AVAX - Priority support for 1 month'
}

// Avoid - Unclear value proposition
{ label: 'Option 1', value: 0.1 }
```

### 2. **Use Appropriate UI Components**

```typescript
// Radio for 2-5 options (visual comparison)
type: 'radio'; // Good for tip amounts

// Select for 5+ options (saves space)
type: 'select'; // Good for many recipients
```

### 3. **Provide Context in Descriptions**

```typescript
{
  label: 'Monthly Subscription',
  description: 'Renews automatically, cancel anytime'
}
```

### 4. **Use Meaningful Defaults**

```typescript
amountConfig: {
  defaultValue: 0.05, // Common tip amount
  options: [/* ... */]
}
```

### 5. **Group Related Options**

```typescript
// Group by purpose or value range
options: [
  // Small tips
  { label: 'Quick Thanks ☕', value: 0.01 },
  { label: 'Nice Work 👍', value: 0.02 },

  // Medium tips
  { label: 'Great Content 🔥', value: 0.05 },
  { label: 'Excellent Post ⭐', value: 0.1 },

  // Large tips
  { label: 'Outstanding 🏆', value: 0.5 },
  { label: 'Life Changing 🚀', value: 1.0 },
];
```

## Common Patterns

### Pattern 1: Fixed Recipient, Variable Amount

```typescript
// Use case: Tipping a content creator
{
  to: '0xCreatorAddress', // Fixed
  amountConfig: { /* variable amounts */ }
}
```

### Pattern 2: Variable Recipient, Fixed Amount

```typescript
// Use case: Equal donations to different charities
{
  amount: 0.1, // Fixed
  recipient: { /* different charities */ }
}
```

### Pattern 3: Both Variable

```typescript
// Use case: Flexible team payments
{
  recipient: { /* team members */ },
  amountConfig: { /* payment amounts */ }
}
```

### Pattern 4: Both Fixed

```typescript
// Use case: Simple one-click donation
{
  to: '0xCharityAddress',
  amount: 0.05
}
```

---

## Next Steps

- [**Dynamic Actions**](./dynamic-actions) - For complex server-side logic
- [**Blockchain Actions**](./blockchain-actions) - For contract interactions
- [**Action Flows**](./action-flows) - Combine transfers in multi-step workflows
- [**Parameters Guide**](../parameters/parameters) - Advanced parameter configuration
