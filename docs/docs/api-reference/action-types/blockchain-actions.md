# Blockchain Actions

Blockchain Actions allow you to interact with smart contract functions on various blockchains. They're the most powerful action type in the Sherry SDK, enabling complex DeFi interactions, NFT operations, and DAO governance.

## Interface

```typescript
interface BlockchainActionMetadata {
  type: 'blockchain';
  label: string; // Button text shown to users
  address: `0x${string}`; // Smart contract address
  abi: Abi; // Contract ABI
  functionName: string; // Function name to call
  chains: ChainContext; // Source blockchain
  amount?: number; // Native token amount for payable functions
  params?: Parameter[]; // Function parameters (must match ABI order)
}

interface ChainContext {
  source: Chain; // Required: where transaction executes
  destination?: Chain; // Optional: for cross-chain actions
}

type Chain = 43114 | 42220 | 43113 | 44787;
```

## Key Properties

### Required Properties

- **`type`**: Always `'blockchain'` for smart contract interactions
- **`label`**: User-facing text displayed on the action button
- **`address`**: Valid Ethereum-format contract address (`0x...`)
- **`abi`**: Contract ABI containing at least the function you're calling
- **`functionName`**: Exact name of the contract function to execute
- **`chains`**: Blockchain configuration with required `source` chain

### Optional Properties

- **`amount`**: Native currency amount to send (ETH, AVAX, CELO) for payable functions
- **`params`**: User input parameters that map to contract function arguments

## Supported Chains

| Chain       | Network           | Type    | Chain ID |
| ----------- | ----------------- | ------- | -------- |
| `avalanche` | Avalanche C-Chain | Mainnet | 43114    |
| `celo`      | Celo              | Mainnet | 42220    |
| `fuji`      | Avalanche Fuji    | Testnet | 43113    |
| `alfajores` | Celo Alfajores    | Testnet | 44787    |

## Examples

### 1. Token Approval (Non-Payable Function)

```typescript
import { BlockchainActionMetadata } from '@sherrylinks/sdk';

const erc20Abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const approveAction: BlockchainActionMetadata = {
  type: 'blockchain',
  label: 'Approve USDC',
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC contract
  abi: erc20Abi,
  functionName: 'approve',
  chains: { source: 43114 },
  params: [
    {
      name: 'spender',
      label: 'Spender Contract',
      type: 'address',
      value: '0x1234567890123456789012345678901234567890',
      fixed: true, // User cannot change this value
    },
    {
      name: 'amount',
      label: 'Amount to Approve',
      type: 'number',
      required: true,
      min: 0.000001,
      description: 'Amount of USDC to approve for spending',
    },
  ],
};
```

### 2. NFT Minting (Payable Function)

```typescript
const nftAbi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenURI', type: 'string' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
] as const;

const mintAction: BlockchainActionMetadata = {
  type: 'blockchain',
  label: 'Mint Cosmic NFT',
  address: '0x742d35Cc6734C0532925a3b8D4ccd306f6F4B26C',
  abi: nftAbi,
  functionName: 'mint',
  chains: { source: 43114 },
  amount: 0.1, // 0.1 AVAX mint price
  params: [
    {
      name: 'to',
      label: 'Recipient Address',
      type: 'address',
      required: true,
      description: 'Address that will receive the NFT',
    },
    {
      name: 'tokenURI',
      label: 'Metadata URI',
      type: 'text',
      value: 'ipfs://QmYourNftMetadata...',
      fixed: true,
      description: 'IPFS URI for NFT metadata',
    },
  ],
};
```

### 3. DAO Voting with Select Options

```typescript
const daoAbi = [
  {
    name: 'castVote',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'support', type: 'bool' },
    ],
    outputs: [],
  },
] as const;

const voteAction: BlockchainActionMetadata = {
  type: 'blockchain',
  label: 'Vote on Proposal',
  address: '0xDaoContractAddress',
  abi: daoAbi,
  functionName: 'castVote',
  chains: { source: 42220 },
  params: [
    {
      name: 'proposalId',
      label: 'Proposal',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Proposal #42: Increase Treasury Allocation',
          value: 42,
          description: 'Allocate 100K tokens for ecosystem development',
        },
        {
          label: 'Proposal #43: New Partnership',
          value: 43,
          description: 'Strategic partnership with DeFi protocol',
        },
      ],
    },
    {
      name: 'support',
      label: 'Your Vote',
      type: 'radio',
      required: true,
      options: [
        { label: 'Yes - Support this proposal', value: true },
        { label: 'No - Oppose this proposal', value: false },
      ],
    },
  ],
};
```

### 4. Cross-Chain Bridge Action

```typescript
const bridgeAbi = [
  {
    name: 'bridgeTokens',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'recipient', type: 'address' },
      { name: 'destinationChainId', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

const bridgeAction: BlockchainActionMetadata = {
  type: 'blockchain',
  label: 'Bridge to Celo',
  address: '0xBridgeContractAddress',
  abi: bridgeAbi,
  functionName: 'bridgeTokens',
  chains: {
    source: 43114,
    destination: 42220, // Cross-chain action
  },
  params: [
    {
      name: 'token',
      label: 'Token to Bridge',
      type: 'select',
      required: true,
      options: [
        {
          label: 'USDC',
          value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          description: 'USD Coin',
        },
        {
          label: 'USDT',
          value: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          description: 'Tether USD',
        },
      ],
    },
    {
      name: 'amount',
      label: 'Amount to Bridge',
      type: 'number',
      required: true,
      min: 0.01,
      description: 'Amount of tokens to send to Celo',
    },
    {
      name: 'recipient',
      label: 'Recipient on Celo',
      type: 'address',
      required: true,
      description: 'Address that will receive tokens on Celo',
    },
    {
      name: 'destinationChainId',
      label: 'Destination Chain',
      type: 'number',
      value: 42220, // Celo chain ID
      fixed: true,
    },
  ],
};
```

## Parameter Types & ABI Compatibility

Parameters must be compatible with the corresponding ABI types:

| ABI Type            | Compatible Parameter Types             | Example              |
| ------------------- | -------------------------------------- | -------------------- |
| `address`           | `address`                              | Wallet addresses     |
| `bool`              | `boolean`, `radio` with boolean values | True/false choices   |
| `string`            | `text`, `email`, `url`, `textarea`     | Text inputs          |
| `uint256`, `int256` | `number`                               | Numeric inputs       |
| `bytes`, `bytes32`  | `text` (hex format)                    | Hex-encoded data     |
| `address[]`         | `text` (JSON array format)             | `["0x...", "0x..."]` |

## Parameter Validation

The SDK automatically validates parameters against the ABI:

### Order Validation

Parameters **must** be in the same order as the ABI function inputs:

```typescript
// ✅ Correct order matching ABI
// ABI: transfer(address to, uint256 amount)
params: [
  { name: 'to', label: 'Recipient', type: 'address' }, // First
  { name: 'amount', label: 'Amount', type: 'number' }, // Second
];

// ❌ Wrong order will cause validation error
params: [
  { name: 'amount', label: 'Amount', type: 'number' }, // Wrong!
  { name: 'to', label: 'Recipient', type: 'address' }, // Wrong!
];
```

### Type Validation

Parameter types must be compatible with ABI types:

```typescript
// ✅ Compatible types
{ name: 'to', type: 'address' }        // address parameter for address ABI type
{ name: 'amount', type: 'number' }     // number parameter for uint256 ABI type
{ name: 'support', type: 'boolean' }   // boolean parameter for bool ABI type

// ❌ Incompatible types will cause validation error
{ name: 'to', type: 'number' }         // number parameter for address ABI type
{ name: 'amount', type: 'text' }       // text parameter for uint256 ABI type
```

### Value Validation

Fixed and default values are validated against ABI types:

```typescript
// ✅ Valid values
{ name: 'spender', type: 'address', value: '0x123...abc', fixed: true }
{ name: 'amount', type: 'number', value: 100.5 }
{ name: 'active', type: 'boolean', value: true }

// ❌ Invalid values will cause validation error
{ name: 'spender', type: 'address', value: 'invalid-address', fixed: true }
{ name: 'amount', type: 'number', value: 'not-a-number' }
```

## Payable Functions

For payable functions, use the `amount` property to specify native token value:

```typescript
const payableAction: BlockchainActionMetadata = {
  type: 'blockchain',
  label: 'Donate 0.5 ETH',
  address: '0xDonationContract',
  abi: donationAbi,
  functionName: 'donate',
  chains: { source: 43114 },
  amount: 0.5, // Send 0.5 AVAX with the transaction
  params: [
    {
      name: 'message',
      label: 'Donation Message',
      type: 'text',
      required: false,
    },
  ],
};
```

## Advanced Features

### Parameter Templates

Use built-in templates for common parameter patterns:

```typescript
import { PARAM_TEMPLATES, createParameter } from '@sherrylinks/sdk';

const params = [
  createParameter(PARAM_TEMPLATES.ADDRESS, {
    name: 'recipient',
    label: 'Token Recipient',
  }),
  createParameter(PARAM_TEMPLATES.AMOUNT, {
    name: 'tokenAmount',
    label: 'Tokens to Send',
    min: 0.01,
  }),
];
```

### Special Values

Some parameters accept special values:

```typescript
{
  name: 'to',
  label: 'Recipient',
  type: 'address',
  value: 'sender' // Special value: resolves to current user's address
}
```

### Complex Parameter Types

For advanced use cases:

```typescript
// Array parameter (as JSON string)
{
  name: 'recipients',
  label: 'Recipients',
  type: 'text',
  value: '["0x123...abc", "0x456...def"]',
  description: 'JSON array of recipient addresses'
}

// Bytes parameter (hex-encoded)
{
  name: 'data',
  label: 'Transaction Data',
  type: 'text',
  pattern: '^0x[a-fA-F0-9]*$',
  description: 'Hex-encoded transaction data'
}
```

## Validation & Error Handling

Use the SDK validation functions to catch errors early:

```typescript
import { createMetadata } from '@sherrylinks/sdk';

try {
  const validatedAction = createMetadata({
    url: 'https://myapp.com',
    icon: 'https://myapp.com/icon.png',
    title: 'My Blockchain App',
    description: 'Interact with smart contracts',
    actions: [blockchainAction],
  });

  console.log('✅ Action validated successfully');
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  // Handle validation errors appropriately
}
```

## Common Validation Errors

| Error                            | Cause                                 | Solution                                 |
| -------------------------------- | ------------------------------------- | ---------------------------------------- |
| `Function not found in ABI`      | `functionName` doesn't exist          | Check ABI contains the function          |
| `Parameter name mismatch`        | Parameter names don't match ABI       | Ensure parameter names match exactly     |
| `Parameter order mismatch`       | Parameters in wrong order             | Reorder parameters to match ABI          |
| `Invalid address`                | Malformed contract address            | Use valid `0x...` format address         |
| `Type compatibility error`       | Parameter type incompatible with ABI  | Use compatible parameter types           |
| `Amount on non-payable function` | `amount` set for non-payable function | Remove `amount` or make function payable |

## Best Practices

1. **Always validate your ABI** - Include only necessary function definitions
2. **Use `as const`** - Add type assertion for better TypeScript support
3. **Order parameters correctly** - Match the exact order in your ABI
4. **Provide clear labels** - Make parameter labels user-friendly
5. **Add helpful descriptions** - Guide users with parameter descriptions
6. **Use appropriate validation** - Set min/max values and patterns
7. **Test thoroughly** - Validate your actions before deployment

---

## Next Steps

- [**Transfer Actions**](./transfer-actions) - Learn about native token transfers
- [**Action Flows**](./nested-action-flows) - Create multi-step workflows
- [**Parameters Guide**](../parameters/parameters) - Deep dive into parameter configuration
