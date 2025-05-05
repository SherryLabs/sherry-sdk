---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/action-types/transfer-actions.md
sidebar_position: 2
---

# Transfer Actions

`TransferAction` allows users to send a blockchain's native currency (like ETH, AVAX, CELO) to another address.

## `TransferAction` Interface

```typescript
// src/interface/actions/transferAction.ts
export interface TransferAction {
  label: string; // Label for UI
  description?: string; // Optional description/help text
  chains: ChainContext; // Chains involved

  // Simple Configuration (fixed values)
  to?: `0x${string}`; // Fixed destination address
  amount?: number; // Fixed amount (in native unit, e.g., ETH, AVAX)

  // Advanced Configuration (allows user input/choice)
  recipient?: RecipientConfig; // Configuration for user to choose recipient
  amountConfig?: AmountConfig; // Configuration for user to choose amount
}

export interface RecipientConfig {
  defaultValue?: `0x${string}`;
  type?: 'select' | 'radio';
  options?: SelectOption[];
  label?: string;
  description?: string;
  required?: boolean;
}

export interface AmountConfig {
  defaultValue?: number;
  type?: 'select' | 'radio';
  options?: SelectOption[];
  label?: string;
  description?: string;
  required?: boolean;
}

export interface SelectOption {
  label: string;
  value: string | number | boolean; // `value` will be the address (string) for recipient, or amount (number) for amount
  description?: string;
}
```

- `label`: Text the user sees to initiate the action.
- `description`: Additional help text.
- `chains`: Defines the source chain (`source`) and optionally the destination (`destination`) if cross-chain. See [Chains](./../chains.md).
- `to` (Simple): Fixed destination address. If provided, `recipient` is ignored.
- `amount` (Simple): Fixed amount to send. If provided, `amountConfig` is ignored.
- `recipient` (Advanced): Allows configuring how the user selects or inputs the destination address.
  - If neither `recipient` nor `to` is provided, the user is assumed to input the address in a standard text field.
  - `type`: `'select'` or `'radio'` to present predefined options.
  - `options`: Array of `SelectOption` where `value` is the address (`0x...`).
  - `defaultValue`, `label`, `description`, `required`: Standard input properties.
- `amountConfig` (Advanced): Allows configuring how the user selects or inputs the amount.
  - If neither `amountConfig` nor `amount` is provided, the user is assumed to input the amount in a standard number field.
  - `type`: `'select'` or `'radio'` to present predefined options.
  - `options`: Array of `SelectOption` where `value` is the amount (number).
  - `defaultValue`, `label`, `description`, `required`: Standard input properties.

## Examples

### 1. Simple Fixed Transfer

```typescript
import { TransferAction } from '@sherrylinks/sdk';

const simpleDonation: TransferAction = {
  label: 'Donate 0.1 AVAX',
  description: 'Support our project with a small donation.',
  to: '0xProjectWalletAddress...', // Fixed recipient
  amount: 0.1, // Fixed amount
  chains: { source: 'avalanche' },
};
```

### 2. Recipient Selection (Select)

```typescript
import { TransferAction } from '@sherrylinks/sdk';

const charityDonation: TransferAction = {
  label: 'Donate to Charity',
  description: 'Choose a charity and the donation amount.',
  chains: { source: 'celo' },
  recipient: {
    type: 'select',
    label: 'Select Charity',
    required: true,
    options: [
      {
        label: 'Education Fund',
        value: '0xAddressEducation...',
        description: 'Supporting education initiatives',
      },
      {
        label: 'Climate Action',
        value: '0xAddressClimate...',
        description: 'Fighting climate change',
      },
    ],
  },
  // amountConfig is not defined, user will input the amount
  amountConfig: {
    defaultValue: 0.1, // We can set a default value
    label: 'Amount (CELO)',
  },
};
```

### 3. Amount Selection (Radio)

```typescript
import { TransferAction } from '@sherrylinks/sdk';

const tipCreator: TransferAction = {
  label: 'Tip Creator',
  description: 'Send a tip to the content creator.',
  chains: { source: 'avalanche' },
  to: '0xCreatorWalletAddress...', // Fixed recipient
  amountConfig: {
    type: 'radio',
    label: 'Tip Amount',
    required: true,
    options: [
      { label: 'Small', value: 0.01, description: '0.01 AVAX' },
      { label: 'Medium', value: 0.05, description: '0.05 AVAX' },
      { label: 'Large', value: 0.1, description: '0.1 AVAX' },
    ],
  },
};
```

### 4. Cross-Chain Transfer (User inputs all)

```typescript
import { TransferAction } from '@sherrylinks/sdk';

const bridgeTransfer: TransferAction = {
  label: 'Bridge to Celo',
  description: 'Send tokens from Avalanche to Celo.',
  chains: { source: 'avalanche', destination: 'celo' },
  // 'to', 'amount', 'recipient', and 'amountConfig' are not specified.
  // The UI will prompt the user for the destination address and amount.
};
```
