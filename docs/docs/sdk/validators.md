---
sidebar_position: 4
---

# Validators

Validators are an essential part of the Sherry SDK that ensure data integrity and correctness before submitting transactions to the blockchain.

## Blockchain Action Validator

The `BlockchainActionValidator` is responsible for validating blockchain action configurations.

### Usage Example

```typescript
import { BlockchainActionValidator } from '@sherrylabs/sherry-sdk';

// Define your blockchain action
const myAction = {
  label: 'Stake Tokens',
  description: 'Stake your tokens to earn rewards',
  address: '0x1234567890123456789012345678901234567890',
  abi: stakingAbi,
  functionName: 'stake',
  chains: { source: 'avalanche' },
  params: [
    {
      name: 'amount',
      label: 'Amount to Stake',
      type: 'number',
      required: true,
    },
  ],
};

// Validate the action
try {
  const validatedAction = BlockchainActionValidator.validateBlockchainAction(myAction);
  console.log('Action is valid and ready to use');
} catch (error) {
  console.error('Validation error:', error.message);
}
```

### What Gets Validated

The validator checks:

1. **Base Metadata** - Address format, ABI correctness, function existence
2. **Parameters** - Parameter types match ABI, required fields are present
3. **Select/Radio Options** - Options format, minimum number of options, no duplicate values
4. **Function Type** - Payable vs non-payable functions for amount handling
5. **Chain Compatibility** - Ensuring the action is valid for the specified chain

### Validation Methods

The BlockchainActionValidator provides several methods:

- `validateBlockchainAction(action)` - Validates the complete action and returns processed action data
- `validateBlockchainActionMetadata(metadata)` - Validates just the metadata portion
- `validateBlockchainParameters(params, abiParams)` - Validates parameters against ABI definitions

### Error Handling

Validation errors throw an `ActionValidationError` with a descriptive message:

```typescript
import { ActionValidationError } from '@sherrylabs/sherry-sdk';

try {
  // Validation code
} catch (error) {
  if (error instanceof ActionValidationError) {
    // Handle validation error
    console.error('Action validation failed:', error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Transaction Validator

The SDK also includes validators for transactions to ensure they meet blockchain requirements before submission.

```typescript
import { TransactionValidator } from '@sherrylabs/sherry-sdk';

// Validate a transaction
const isValid = TransactionValidator.validateTransaction({
  to: '0x1234567890123456789012345678901234567890',
  value: '0.1',
  data: '0x...',
});

if (isValid) {
  // Proceed with transaction
} else {
  // Handle invalid transaction
}
```

## Custom Validators

You can extend the SDK's validation capabilities by creating custom validators:

```typescript
import { BaseValidator } from '@sherrylabs/sherry-sdk';

class MyCustomValidator extends BaseValidator {
  static validateMyData(data) {
    // Custom validation logic
    if (!this.isValidFormat(data)) {
      throw new Error('Invalid data format');
    }
    return true;
  }

  static isValidFormat(data) {
    // Implementation of format checking
    return true; // or false if invalid
  }
}
```

For more details on validators, refer to the API reference.
