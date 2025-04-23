---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/parameters.md
sidebar_position: 5
---

# Action Parameters

Parameters define the inputs a user provides when executing a `BlockchainAction` or `HttpAction`. They allow configuring the UI and validation for each required field.

## Parameter Types

There are three main parameter types, sharing a `BaseParameter`:

```typescript
// src/interface/actions/blockchainAction.ts (similar in httpAction.ts)
export interface BaseParameter {
  name: string; // Parameter name (matches ABI or JSON key)
  label: string; // Label to display in UI
  description?: string; // Optional help text
  required?: boolean; // Is it mandatory? (Validator might infer from ABI for BlockchainActions)
  fixed?: boolean; // Is the value fixed and non-editable by the user?
  value?: any; // Default or fixed value
}
```

1.  **`StandardParameter`**: For common input types.

    ```typescript
    export interface StandardParameter extends BaseParameter {
      type: BaseInputType; // 'address', 'string', 'bool', 'bytes', 'int', 'uint', 'text', 'number', 'email', 'url', 'datetime', 'textarea'
      minLength?: number; // For 'text', 'textarea', 'string'
      maxLength?: number; // For 'text', 'textarea', 'string'
      pattern?: string; // Regex for validation (e.g., for 'address', 'email')
      min?: number; // For 'number', 'int', 'uint', 'datetime'
      max?: number; // For 'number', 'int', 'uint', 'datetime'
    }
    ```

    - The `type` can be a Solidity type (`address`, `uint256`, `string`, `bool`, etc.) or a more specific UI type (`text`, `number`, `email`, `textarea`, `datetime`). If `type` is not specified for a `BlockchainAction`, the SDK will try to infer it from the `abi`. For `HttpAction`, `type` is mandatory.

2.  **`SelectParameter`**: For dropdown lists.

    ```typescript
    export interface SelectParameter extends BaseParameter {
      type: 'select';
      options: SelectOption[];
    }
    ```

3.  **`RadioParameter`**: For radio buttons.
    ```typescript
    export interface RadioParameter extends BaseParameter {
      type: 'radio';
      options: SelectOption[];
    }
    ```

Both `SelectParameter` and `RadioParameter` use `SelectOption`:

```typescript
export interface SelectOption {
  label: string; // Text to display for the option
  value: string | number | boolean; // Value to be used if selected
  description?: string; // Optional additional description
}
```

## Common Properties

- `name`: Crucial. Must exactly match the parameter name in the ABI function (for `BlockchainAction`) or the key expected by the API (for `HttpAction`).
- `label`: The text the user sees next to the input field.
- `description`: Help text appearing near the field.
- `required`: Indicates if the field is mandatory. For `BlockchainAction`, if not specified, it's inferred from the ABI. For `HttpAction`, it must be specified explicitly (defaults often to `true` if omitted).
- `fixed`: If `true`, the provided `value` is used directly, and the user cannot edit it. Useful for predefined or constant values.
- `value`: Default value for the field. If `fixed` is `true`, this is the value that will be used.

## Parameter Templates (`PARAM_TEMPLATES`)

To simplify creating common parameters, the SDK provides `PARAM_TEMPLATES`.

```typescript
import { PARAM_TEMPLATES, createParameter } from '@sherrylinks/sdk';

// Address parameter using template
const recipientParam = createParameter(PARAM_TEMPLATES.ADDRESS, {
  name: 'recipient', // Override the 'name'
  label: 'Destination Address', // Override the 'label'
});

// Token amount parameter using template
const amountParam = createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
  name: 'transferAmount',
  label: 'Amount to Send',
  min: 0.01, // Override the minimum
});

// Yes/No selection parameter using template
const confirmParam = createParameter(PARAM_TEMPLATES.YES_NO, {
  name: 'confirmation',
  label: 'Are you sure?',
});
```

The `createParameter` function takes a template and a customizations object. Properties in `customizations` override those in the template. **You must always provide at least the `name` in the customizations.**

**Available Templates (Examples):**

- `PARAM_TEMPLATES.ADDRESS`: Ethereum address (`0x...`).
- `PARAM_TEMPLATES.AMOUNT`: Numeric amount (generally for transfers).
- `PARAM_TEMPLATES.TOKEN_AMOUNT`: Numeric amount for tokens (can have decimals).
- `PARAM_TEMPLATES.INTEGER`: Integer number.
- `PARAM_TEMPLATES.NFT_ID` / `TOKEN_ID`: Numeric token ID.
- `PARAM_TEMPLATES.EMAIL`: Email address.
- `PARAM_TEMPLATES.URL`: Web URL.
- `PARAM_TEMPLATES.TEXT`: Simple text field.
- `PARAM_TEMPLATES.TEXTAREA`: Long text field.
- `PARAM_TEMPLATES.BOOLEAN`: Boolean checkbox (usually).
- `PARAM_TEMPLATES.BOOLEAN_RADIO` / `YES_NO`: Yes/No radio selection.
- `PARAM_TEMPLATES.DATE`: Date/time selector.
- `PARAM_TEMPLATES.TOKEN_SELECT`: Selector for common tokens (ETH, USDC, etc.).
- `PARAM_TEMPLATES.CHAIN_SELECT`: Selector for supported blockchains.
- ... and more. Explore the exported `PARAM_TEMPLATES` object to see all options.

## Helper Functions

Besides `createParameter`, specific helpers exist:

- `createSelectParam(name, label, options, required, description)`
- `createRadioParam(name, label, options, required, description)`
- `createSelectOptions(optionsArray)`: Converts a simple array to `SelectOption[]` format.

```typescript
import { createSelectParam, createSelectOptions } from '@sherrylinks/sdk';

const charityOptions = [
  { label: 'Fund A', value: '0xA...' },
  { label: 'Fund B', value: '0xB...' },
];

const charitySelect = createSelectParam(
  'charityAddress',
  'Choose Charity',
  createSelectOptions(charityOptions), // Using helper
  true,
  'Select the organization to donate to',
);
```
