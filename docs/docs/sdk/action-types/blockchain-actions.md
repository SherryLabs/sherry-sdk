---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/action-types/blockchain-actions.md
sidebar_position: 1
---

# Blockchain Actions

`BlockchainActionMetadata` allows you to interact with smart contract functions on various blockchains.

## `BlockchainActionMetadata` Interface

```typescript
// src/interface/actions/blockchainAction.ts
export interface BlockchainActionMetadata extends BaseAction {
  address: `0x${string}`; // Contract address
  abi: Abi; // Contract ABI (array of objects)
  functionName: string; // Name of the function to call
  amount?: number; // Amount to send if the function is 'payable' (in native unit, e.g., ETH, AVAX)
  params?: BlockchainParameter[]; // Function parameters (optional)
  // chains: ChainContext; // Inherited from BaseAction
}

export interface BaseAction {
  label: string; // Label for UI
  description: string; // Description/help text
  chains: ChainContext; // Chains involved
}
```

- `label`: Text the user sees to initiate the action.
- `description`: Additional help text.
- `address`: The address of the smart contract to interact with.
- `abi`: The Application Binary Interface (ABI) of the contract. You only need to include the definition of the function you are calling and any others necessary for validation or processing. Using `as const` provides better type safety.
- `functionName`: The exact name of the contract function you want to execute.
- `amount` (Optional): If the function is `payable`, specify the amount of the `source` chain's native currency (e.g., AVAX, CELO) to send with the transaction. The SDK will convert it to the smallest unit (wei).
- `params` (Optional): An array of `BlockchainParameter` objects defining the inputs required by the contract function. They must be **in the same order** as they appear in the ABI. See [Parameters](./../parameters.md) for more details.
- `chains`: Defines the source chain (`source`) where the transaction will be executed. See [Chains](./../chains.md).

## Example: Approving an ERC20 Token

```typescript
import { BlockchainActionMetadata, PARAM_TEMPLATES, createParameter } from '@sherrylinks/sdk';

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
  label: 'Approve USDC',
  description: 'Allow the Swap contract to use your USDC.',
  address: '0xUSDCContractAddress...', // USDC contract address
  abi: erc20Abi,
  functionName: 'approve',
  chains: { source: 'avalanche' },
  params: [
    // 1. Spender (address of the contract that will spend the tokens)
    createParameter(PARAM_TEMPLATES.ADDRESS, {
      name: 'spender',
      label: 'Spender Contract',
      value: '0xSwapContractAddress...', // Fixed value
      fixed: true, // User cannot change it
    }),
    // 2. Amount (amount to approve)
    createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
      name: 'amount',
      label: 'Amount to Approve',
      // By default, the user will input the amount.
      // We could set a max value if desired:
      // value: '115792089237316195423570985008687907853269984665640564039457584007913129639935', // uint256 max
      // fixed: true,
    }),
  ],
};
```

In this example:

1.  We define the `approve` action from the ERC20 standard in the `abi`.
2.  We specify the USDC token `address`, the `abi`, and the `functionName`.
3.  We indicate it will run on `avalanche`.
4.  We define the `params` in order:
    - `spender`: Uses the `ADDRESS` template and fixes the value to the swap contract's address.
    - `amount`: Uses the `TOKEN_AMOUNT` template, allowing the user to input the amount.

## Example: Payable Function (Donate to Campaign)

```typescript
import { BlockchainActionMetadata, PARAM_TEMPLATES, createParameter } from '@sherrylinks/sdk';

const fundraisingAbi = [
  // ... other functions ...
  {
    name: 'donate',
    type: 'function',
    stateMutability: 'payable', // Important!
    inputs: [{ name: 'campaignId', type: 'uint256' }],
    outputs: [],
  },
] as const;

const donateAction: BlockchainActionMetadata = {
  label: 'Donate to Campaign',
  description: 'Support a campaign with AVAX.',
  address: '0xFundraisingContract...',
  abi: fundraisingAbi,
  functionName: 'donate',
  chains: { source: 'fuji' },
  amount: 0.1, // Send 0.1 AVAX with the transaction
  params: [
    createParameter(PARAM_TEMPLATES.INTEGER, {
      name: 'campaignId',
      label: 'Campaign ID',
      // User will input the ID
    }),
  ],
};
```

Here, the `donate` function is `payable`. We specify `amount: 0.1` to send 0.1 AVAX (on the Fuji network) along with the function call. The only parameter the user needs to input is `campaignId`.

For more details on defining parameters, see the [Parameters](./../parameters.md) section.
