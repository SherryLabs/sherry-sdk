---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/validation.md
sidebar_position: 7
---

# Metadata Validation

A key feature of the Sherry SDK is built-in validation. Before a mini-app can be used, its `Metadata` must be validated to ensure the structure is correct, actions are well-defined, parameters match ABIs, chains are valid, etc.

## Validation Functions

The SDK exports two main functions for validation:

1.  **`createMetadata(metadata: Metadata): ValidatedMetadata`**
    -   Takes a `Metadata` object as input.
    -   Performs comprehensive validation.
    -   If validation succeeds, it processes the metadata (e.g., infers parameter types from ABI for `BlockchainAction`) and returns a `ValidatedMetadata` object.
    -   If validation fails, it **throws an error** (`SherryValidationError` or `InvalidMetadataError`) containing details about the issues found.
    -   Useful when you only want to proceed if the metadata is valid and prefer handling errors with `try...catch`.

2.  **`validateMetadata(metadata: Metadata): ValidationResult`**
    -   Takes a `Metadata` object as input.
    -   Performs the same comprehensive validation as `createMetadata`.
    -   **Does not throw errors.** Instead, it returns a `ValidationResult` object.
    -   `ValidationResult` has the shape:
        ```typescript
        type ValidationResult =
          | { isValid: true; type: 'ValidatedMetadata'; data: ValidatedMetadata }
          | { isValid: false; type: 'ValidationError'; errors: ValidationErrorInfo[] };

        interface ValidationErrorInfo {
            path: string; // Path to the field with error (e.g., "actions[0].params[1].name")
            message: string; // Descriptive error message
        }
        ```
    -   Useful when you want to check validity and explicitly handle errors without using `try...catch`.

## Usage Example

```typescript
import { Metadata, createMetadata, validateMetadata } from '@sherrylinks/sdk';

const myMetadata: Metadata = {
  url: 'https://test.app',
  icon: 'icon.png',
  title: 'Test App',
  description: 'A test mini-app',
  actions: [
    // ... a potentially invalid action ...
    {
        label: "Invalid Action",
        // Missing 'chains', 'to'/'recipient'/'amount'/'amountConfig' for TransferAction
    }
  ],
};

// Using createMetadata
try {
  const validatedMeta = createMetadata(myMetadata);
  console.log("Metadata is valid and processed:", validatedMeta);
  // Use validatedMeta...
} catch (error: any) {
  console.error("Validation Error (createMetadata):", error.message);
  if (error.validationErrors) {
      console.error("Details:", error.validationErrors);
  }
}

// Using validateMetadata
const result = validateMetadata(myMetadata);

if (result.isValid) {
  console.log("Metadata is valid (validateMetadata):", result.data);
  // Use result.data...
} else {
  console.error("Validation Errors (validateMetadata):");
  result.errors.forEach(err => {
    console.error(`- Field: ${err.path}, Error: ${err.message}`);
  });
}
```

## What is Validated?

Validation covers many aspects, including:

-   **`Metadata` Structure:** Presence and correct type of `url`, `icon`, `title`, `description`, `actions`.
-   **Actions:**
    -   Valid action type (`blockchain`, `transfer`, `http`, `flow`).
    -   Required properties for each action type (`address`, `abi`, `functionName` for blockchain; `endpoint` for http; `initialActionId` for flow, etc.).
    -   Validity of `chains`.
-   **`BlockchainAction`:**
    -   `address` is a valid address.
    -   `abi` is a valid ABI (array of objects).
    -   `functionName` exists in the `abi`.
    -   `params` match the number and (approximate) type of the function's `inputs` in the `abi`.
    -   `amount` only present if the function is `payable` or `nonpayable` (not `view` or `pure`).
-   **`TransferAction`:**
    -   `to` (if present) is a valid address.
    -   `amount` (if present) is a positive number.
    -   Valid configuration of `recipient` and `amountConfig` (if used).
-   **`HttpAction`:**
    -   `endpoint` is a valid URL.
    -   `params` have valid `name`, `label`, `type`.
    -   `options` present and non-empty for `select` and `radio`.
-   **`ActionFlow`:**
    -   `initialActionId` exists in `actions`.
    -   All `NestedAction` `id`s are unique within the flow.
    -   All `nextActionId`s reference existing `id`s.
    -   Valid structure for each `NestedAction` type.
-   **Parameters (General):**
    -   `name` and `label` present.
    -   Valid types.
    -   Type-specific validations (`minLength`, `maxLength`, `pattern`, `min`, `max`).
    -   Valid `options` for `select` and `radio`.

Successful validation ensures the `Metadata` is coherent and has a high probability of working as expected in the Sherry execution environment.