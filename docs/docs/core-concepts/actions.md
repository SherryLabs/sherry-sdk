# Understanding Actions and Parameters

## Actions

In Sherry, **actions** are the core interactive units that define what a mini-app can do. Each action represents a specific task the user can trigger—such as sending tokens, calling a smart contract, or initiating a multi-step flow.

Sherry supports **4 different action types**, each optimized for different complexity levels and use cases:

## Dynamic Actions (`type: 'dynamic'`) - Most Powerful

The most sophisticated action type for complex Web3 operations. Your server computes the optimal transaction based on user inputs, market conditions, and complex logic.

```typescript
{
  type: 'dynamic',
  label: 'Optimal DeFi Strategy',
  path: '/api/calculate-best-yield',
  chains: { source: 43114 },
  params: [
    {
      name: 'amount',
      label: 'Investment Amount',
      type: 'number',
      required: true
    },
    {
      name: 'risk',
      label: 'Risk Tolerance',
      type: 'select',
      options: [
        { label: 'Conservative', value: 'low' },
        { label: 'Moderate', value: 'medium' },
        { label: 'Aggressive', value: 'high' }
      ]
    }
  ]
}
```

**Perfect for:**

- Multi-step DeFi strategies (yield farming, arbitrage)
- Dynamic pricing and routing
- Complex contract interactions requiring server-side computation
- Real-time market analysis and execution
- Cross-protocol optimizations

**How it works:**

1. User fills out parameters
2. Your server receives the data via API call
3. Server analyzes market conditions, calculates optimal strategy
4. Server returns a ready-to-execute transaction
5. User signs and executes

### Blockchain Actions (`type: 'blockchain'`) - Direct Contract Interaction

For direct smart contract interactions where you know exactly which function to call and what parameters to use.

```typescript
{
  type: 'blockchain',
  label: 'Mint NFT',
  address: '0x742d35Cc6734C0532925a3b8D4ccd306f6F4B26C',
  // abi: nftAbi, // Assuming nftAbi is defined elsewhere
  functionName: 'mint',
  chains: { source: 43114 },
  amount: 0.1, // Fixed mint price in native currency
  params: [
    {
      name: 'to',
      label: 'Recipient Address',
      type: 'address',
      required: true
    }
  ]
}
```

**Perfect for:**

- Token approvals and transfers
- NFT minting with fixed parameters
- DAO voting on specific proposals
- Simple DeFi operations (stake, unstake)
- Direct contract function calls

**When to use vs Dynamic Actions:**

- Use Blockchain Actions when the contract call is straightforward
- Use Dynamic Actions when you need server-side logic to determine what to call

### Transfer Actions (`type: 'transfer'`) - Simple & Interactive

The most user-friendly way to send native tokens (ETH, AVAX, CELO) with customizable UI options.

```typescript
{
  type: 'transfer',
  label: 'Support Creator',
  chains: { source: 43114 },
  to: '0x742d35Cc6734C0532925a3b8D4ccd306f6F4B26C',
  amountConfig: {
    type: 'radio',
    label: 'Tip Amount',
    required: true,
    options: [
      { label: 'Small Tip', value: 0.01, description: '0.01 AVAX' },
      { label: 'Medium Tip', value: 0.05, description: '0.05 AVAX' },
      { label: 'Large Tip', value: 0.1, description: '0.1 AVAX' }
    ]
  }
}
```

**Perfect for:**

- Tips and donations
- Simple payments
- Crowdfunding contributions
- Social tipping
- Quick native token sends

**Key advantage:** No ABI knowledge required, built-in UI configurability

### Action Flows (`type: 'flow'`) - Multi-Step Workflows

For complex multi-step processes that combine different action types with conditional logic.

```typescript
{
  type: 'flow',
  label: 'DeFi Onboarding',
  initialActionId: 'check-balance',
  actions: [
    {
      id: 'check-balance',
      type: 'dynamic',
      label: 'Check Portfolio',
      path: '/api/analyze-portfolio',
      // ... params
      nextActions: [
        {
          actionId: 'suggest-strategy',
          conditions: [{ field: 'balance', operator: 'gt', value: 100 }]
        }
      ]
    },
    {
      id: 'suggest-strategy',
      type: 'decision',
      title: 'Recommended Strategy',
      options: [
        { label: 'Conservative', value: 'safe', nextActionId: 'execute-safe' },
        { label: 'Aggressive', value: 'risky', nextActionId: 'execute-risky' }
      ]
    },
    // ... more actions
  ]
}
```

**Perfect for:**

- User onboarding sequences
- Complex DeFi workflows (approve → swap → stake)
- Conditional business logic
- Multi-step transactions with user decisions

---

## Choosing the Right Action Type

### Decision Tree:

```
Do you need multiple steps or user decisions?
├─ Yes → Action Flow
└─ No → Continue...

Do you need complex server-side logic or real-time calculations?
├─ Yes → Dynamic Action
└─ No → Continue...

Are you just sending native tokens (ETH/AVAX/CELO)?
├─ Yes → Transfer Action
└─ No → Blockchain Action
```

### Examples by Use Case:

| Use Case                     | Best Action Type | Why                             |
| ---------------------------- | ---------------- | ------------------------------- |
| NFT Mint (fixed price)       | Blockchain       | Simple contract call            |
| NFT Mint (dynamic pricing)   | Dynamic          | Server calculates current price |
| Token Swap (simple)          | Blockchain       | Direct DEX interaction          |
| Token Swap (optimal routing) | Dynamic          | Server finds best route         |
| Tip/Donation                 | Transfer         | Simple native token send        |
| DAO Vote                     | Blockchain       | Direct governance contract call |
| DeFi Strategy                | Dynamic          | Complex optimization needed     |
| User Onboarding              | Flow             | Multiple steps with decisions   |

---

## Parameters

Parameters define the inputs users provide when executing actions. They control UI generation and validation.
For a comprehensive guide on all parameter types and their properties, please refer to the [Action Parameters API Reference](../api-reference/parameters/parameters.md).

### Parameter Structure

All parameters extend from `BaseParameter`:

```typescript
interface BaseParameter {
  name: string; // Parameter identifier
  label: string; // UI label shown to user
  type: string; // Input type
  required?: boolean; // Is this field mandatory?
  description?: string; // Help text
  fixed?: boolean; // Is the value non-editable?
  value?: any; // Default or fixed value
}
```

### Parameter Types by Action

#### Dynamic Actions - Most Flexible

- Can use any parameter type.
- Server processes all inputs.
- Perfect for complex forms.
  Refer to [Action Parameters API Reference](../api-reference/parameters/parameters.md) for all available types.

```typescript
// Example for Dynamic Action params
params: [
  {
    name: 'strategy',
    label: 'Investment Strategy',
    type: 'select',
    options: [
      /* options */
    ],
  },
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    min: 0.01,
  },
  // ... other parameter types
];
```

#### Blockchain Actions - ABI-Constrained

- Must match contract function parameters.
- Types should be compatible with ABI types (e.g., `uint256` can map to `type: 'number'`).
- Order must match ABI function signature.

```typescript
// For contract function: mint(address to, uint256 quantity)
params: [
  { name: 'to', type: 'address', label: 'Recipient' }, // Added label for clarity
  { name: 'quantity', type: 'uint256', label: 'Quantity' }, // Or type: 'number'
];
```

#### Transfer Actions - Configuration-Based

- Uses `amountConfig` and `recipient` instead of `params`.
- Built-in UI components.
- No ABI knowledge required.

```typescript
// No params array - uses config objects instead
amountConfig: {
  type: 'radio',
  options: [/* amount options */]
},
recipient: {
  type: 'select',
  options: [/* recipient options */]
}
```

### Parameter Templates

Use pre-built templates for common patterns:

```typescript
import { PARAM_TEMPLATES, createParameter } from '@sherrylinks/sdk';

// Address parameter
const recipientParam = createParameter(PARAM_TEMPLATES.ADDRESS, {
  name: 'recipient',
  label: 'Destination Address',
});

// Amount parameter
const amountParam = createParameter(PARAM_TEMPLATES.AMOUNT, {
  name: 'transferAmount',
  label: 'Amount to Send',
});
```

---

## Best Practices

### 1. Start Simple, Scale Complex

```typescript
// Start with Blockchain Action for simple contract calls
// Upgrade to Dynamic Action when you need server-side logic
```

### 2. Use Transfer Actions for Native Tokens

```typescript
// ✅ Good - Use Transfer Action for AVAX/ETH/CELO
{ type: 'transfer', amount: 0.1, chains: { source: 43114 } }

// ❌ Avoid - Don't use Blockchain Action for simple transfers
{ type: 'blockchain', functionName: 'transfer', /* complex setup */ }
```

### 3. Dynamic Actions for Complex Logic

```typescript
// ✅ Perfect use case - Server calculates optimal swap route
{
  type: 'dynamic',
  path: '/api/optimal-swap',
  // Server analyzes 10+ DEXs and returns best route
}

// ❌ Overkill - Simple fixed swap
{
  type: 'blockchain',
  functionName: 'swapExactTokensForTokens',
  // Known parameters, no calculation needed
}
```

### 4. Action Flows for Multi-Step UX

```typescript
// ✅ Great for onboarding
{
  type: 'flow',
  actions: [
    { id: 'welcome', type: 'decision', /* ... */ },
    { id: 'setup', type: 'dynamic', /* ... */ },
    { id: 'complete', type: 'completion', /* ... */ }
  ]
}
```

---

## Next Steps

- [Dynamic Actions](../api-reference/action-types/dynamic-actions) - Master the most powerful action type
- [Blockchain Actions](../api-reference/action-types/blockchain-actions) - Direct contract interactions
- [Transfer Actions](../api-reference/action-types/transfer-actions) - Simple native token transfers
- [Action Flows](../api-reference/action-types/action-flows) - Multi-step workflows
