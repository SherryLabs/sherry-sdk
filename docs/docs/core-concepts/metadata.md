# Metadata

# Metadata Validation

Validation ensures your mini-app is correctly structured and prevents runtime errors.

## Validation Functions

The SDK exports two main functions for validation:

### `createMetadata(metadata: Metadata): ValidatedMetadata`

Takes a `Metadata` object, validates it completely, and returns a processed `ValidatedMetadata` object.

- **Validates**: Structure, action types, parameters, chains, ABI compatibility
- **Processes**: Infers parameter types from ABI, adds validation metadata
- **Throws**: `SherryValidationError` or `InvalidMetadataError` if validation fails
- **Returns**: `ValidatedMetadata` with additional processed information

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

const metadata: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'My Mini App',
  description: 'An awesome Web3 mini-app',
  actions: [
    {
      type: 'blockchain',
      label: 'Mint NFT',
      address: '0x...',
      abi: nftAbi,
      functionName: 'safeMint',
      chains: { source: 43114 },
      params: [
        {
          name: 'to',
          label: 'Recipient',
          type: 'address',
          required: true,
        },
      ],
    },
  ],
};

try {
  const validatedMetadata = createMetadata(metadata);
  console.log('✅ Metadata is valid and processed!');
  // Use validatedMetadata for your mini-app
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  // Handle validation errors
}
```

### `validateMetadata(metadata: Metadata): ValidationResult`

Validates metadata without throwing errors, returning a detailed result object.

```typescript
interface ValidationResult =
  | { isValid: true; type: 'ValidatedMetadata'; data: ValidatedMetadata }
  | { isValid: false; type: 'ValidationError'; errors: ValidationErrorInfo[] };

interface ValidationErrorInfo {
  path: string;    // Path to the error (e.g., "actions[0].params[1].name")
  message: string; // Descriptive error message
}
```

```typescript
import { validateMetadata } from '@sherrylinks/sdk';

const result = validateMetadata(metadata);

if (result.isValid) {
  console.log('✅ Metadata is valid:', result.data);
  // Use result.data
} else {
  console.error('❌ Validation errors found:');
  result.errors.forEach(error => {
    console.error(`- ${error.path}: ${error.message}`);
  });
}
```

## What Gets Validated?

### Metadata Structure

```typescript
✅ Required fields: url, icon, title, description, actions
✅ Field types: string validation for text fields
✅ Actions array: non-empty, max 4 actions
✅ BaseUrl format: valid URL if provided
```

### Action Validation

```typescript
✅ Action types: 'blockchain', 'transfer', 'http', 'dynamic', 'flow'
✅ Required properties per action type
✅ Chain configuration validity
✅ Cross-action consistency
```

#### BlockchainAction Validation

```typescript
✅ Contract address: valid Ethereum address format
✅ ABI structure: valid array of ABI objects
✅ Function existence: functionName exists in ABI
✅ Parameter compatibility: params match ABI inputs
✅ Parameter order: matches ABI function signature
✅ Amount field: only for payable functions
✅ Type compatibility: parameter types match ABI types
```

#### TransferAction Validation

```typescript
✅ Recipient address: valid if provided directly
✅ Amount: positive number if provided directly
✅ Chain support: valid source and destination chains
✅ Configuration objects: recipient and amountConfig structure
✅ Selection options: valid options for select/radio types
```

#### HttpAction Validation

```typescript
✅ Path URL: valid URL format
✅ Parameter structure: name, label, type validation
✅ Option arrays: non-empty for select/radio parameters
✅ Type-specific validation: email format, URL format, etc.
```

#### DynamicAction Validation

```typescript
✅ Path validation: absolute URL or relative with baseUrl
✅ BaseUrl dependency: relative paths require baseUrl in metadata
✅ Parameter structure: same as other action types
✅ Chain configuration: valid source chain
```

#### ActionFlow Validation

```typescript
✅ Initial action: initialActionId exists in actions array
✅ Unique IDs: no duplicate action IDs within flow
✅ Reference integrity: all nextActionId references exist
✅ Graph connectivity: all actions reachable from initial action
✅ Nested action validation: each action validates according to its type
✅ Completion actions: no nextActions allowed
✅ Decision options: valid nextActionId for each option
```

### Parameter Validation

```typescript
✅ Required fields: name, label, type
✅ Type compatibility: UI types vs ABI types for blockchain actions
✅ Constraint validation: min/max, minLength/maxLength
✅ Pattern validation: regex patterns are valid
✅ Option validation: non-empty arrays for select/radio
✅ Value compatibility: default/fixed values match expected types
✅ Selection consistency: values exist in options for select/radio
```

### Chain Validation

```typescript
✅ Supported chains: 'fuji', 'avalanche', 'alfajores', 'celo', 'ethereum', 'sepolia'
✅ Source chain: always required
✅ Destination chain: optional, valid if provided
✅ Cross-chain logic: proper source/destination combination
```

## Validation Examples

### Valid Metadata

```typescript
const validMetadata: Metadata = {
  url: 'https://myapp.example/api/mint',
  icon: 'https://myapp.example/icon.png',
  title: 'NFT Minter',
  description: 'Mint your unique NFT',
  actions: [
    {
      type: 'blockchain',
      label: 'Mint NFT',
      address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
      abi: [
        {
          name: 'safeMint',
          type: 'function',
          stateMutability: 'payable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'tokenURI', type: 'string' },
          ],
          outputs: [{ name: 'tokenId', type: 'uint256' }],
        },
      ],
      functionName: 'safeMint',
      chains: { source: 43114 },
      amount: 0.1,
      params: [
        {
          name: 'to',
          label: 'Recipient Address',
          type: 'address',
          required: true,
        },
        {
          name: 'tokenURI',
          label: 'Token URI',
          type: 'string',
          required: true,
          value: 'ipfs://QmHash',
          fixed: true,
        },
      ],
    },
  ],
};

// This will validate successfully
const validated = createMetadata(validMetadata);
```

### Common Validation Errors

#### Missing Required Fields

```typescript
const invalidMetadata = {
  // Missing required fields
  title: 'My App',
  actions: [],
};

// Error: "Metadata missing required 'url' field"
// Error: "Metadata missing required 'icon' field"
// Error: "Metadata missing required 'description' field"
// Error: "Metadata must include at least one action"
```

#### Parameter Mismatch

```typescript
const invalidAction = {
  type: 'blockchain',
  label: 'Transfer',
  address: '0x...',
  abi: [
    {
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
    },
  ],
  functionName: 'transfer',
  chains: { source: 43114 },
  params: [
    // Wrong order! Should be 'to' first, then 'amount'
    {
      name: 'amount',
      label: 'Amount',
      type: 'uint256',
    },
    {
      name: 'to',
      label: 'Recipient',
      type: 'address',
    },
  ],
};

// Error: "Parameter name mismatch at index 0. Expected 'to', received 'amount'"
```

#### Invalid Chain Configuration

```typescript
const invalidChain = {
  type: 'transfer',
  label: 'Send Tokens',
  chains: { source: 'invalid-chain' }, // Invalid chain
  amount: 0.1,
};

// Error: "Invalid source chain: invalid-chain"
```

#### Missing BaseUrl for Dynamic Action

```typescript
const invalidDynamic: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'Dynamic App',
  description: 'App with dynamic action',
  // Missing baseUrl!
  actions: [
    {
      type: 'dynamic',
      label: 'Dynamic Action',
      path: '/api/dynamic', // Relative path but no baseUrl
      chains: { source: 43114 },
    },
  ],
};

// Error: "Dynamic action has a relative path '/api/dynamic' but no baseUrl is provided"
```

## Error Handling Best Practices

### 1. Always Validate During Development

```typescript
import { createMetadata } from '@sherrylinks/sdk';

// Validate early in development
const metadata = createMetadata(myMetadata);
```

### 2. Use Try-Catch for Error Handling

```typescript
try {
  const validated = createMetadata(metadata);
  return NextResponse.json(validated);
} catch (error) {
  console.error('Validation error:', error);
  return NextResponse.json({ error: 'Invalid metadata configuration' }, { status: 500 });
}
```

### 3. Provide Detailed Error Information in Development

```typescript
if (process.env.NODE_ENV === 'development') {
  try {
    const validated = createMetadata(metadata);
    return NextResponse.json(validated);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.message,
        validationErrors: error.validationErrors || [],
      },
      { status: 500 },
    );
  }
}
```

### 4. Use validateMetadata for Detailed Debugging

```typescript
const result = validateMetadata(metadata);
if (!result.isValid) {
  console.log('Validation errors:');
  result.errors.forEach(error => {
    console.log(`❌ ${error.path}: ${error.message}`);
  });
}
```

## Integration with Development Tools

### Sherry Debugger

The [Sherry Debugger](https://app.sherry.social/debugger) provides visual validation:

1. **URL Mode**: Test your deployed endpoint
2. **JSON Mode**: Paste metadata JSON directly
3. **TypeScript Mode**: Validate your metadata code

### IDE Integration

```typescript
// Use TypeScript for compile-time validation
import { Metadata } from '@sherrylinks/sdk';

const metadata: Metadata = {
  // TypeScript will catch missing required fields
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png',
  title: 'My App',
  description: 'Description',
  actions: [
    // TypeScript will validate action structure
  ],
};
```

### Unit Testing

```typescript
import { validateMetadata, createMetadata } from '@sherrylinks/sdk';

describe('Metadata Validation', () => {
  test('valid metadata should pass validation', () => {
    const result = validateMetadata(validMetadata);
    expect(result.isValid).toBe(true);
  });

  test('invalid metadata should fail validation', () => {
    const result = validateMetadata(invalidMetadata);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('createMetadata should throw on invalid input', () => {
    expect(() => createMetadata(invalidMetadata)).toThrow();
  });
});
```

---

Proper validation ensures your mini-apps work reliably across all Sherry platforms and provides clear feedback during development. Always validate your metadata before deployment!
