---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/action-types/nested-action-flows.md
sidebar_position: 4
---

# Nested Action Flows (`ActionFlow`)

`ActionFlow` allows you to create interactive, multi-step experiences, guiding the user through a process that can include different action types, decisions, and conditional logic.

## `ActionFlow` Interface

```typescript
// src/interface/actions/flowAction.ts
export interface ActionFlow {
  type: 'flow'; // Action type identifier
  label: string; // Main label for the flow (e.g., "Advanced Swap")
  initialActionId: string; // ID of the first action to execute in the flow
  actions: NestedAction[]; // Array containing all actions that make up the flow
}
```

- `type`: Always `'flow'`.
- `label`: General label for the flow.
- `initialActionId`: The `id` of the `NestedAction` within the `actions` array that will start the flow.
- `actions`: An array containing all the individual actions that are part of the flow.

## Nested Actions (`NestedAction`)

Each step within an `ActionFlow` is a `NestedAction`. There are several types:

```typescript
// src/interface/actions/flowAction.ts

// Base for all nested actions
export interface NestedActionBase {
  id: string; // Unique identifier WITHIN the flow
  label: string; // Label for this specific step
  nextActions?: NextActionDefinition[]; // Defines which action(s) follow
}

// Blockchain Action within a flow
export interface NestedBlockchainAction
  extends Omit<BlockchainActionMetadata, 'label' | 'description'>,
    NestedActionBase {
  type: 'blockchain';
}

// Transfer Action within a flow
export interface NestedTransferAction extends Omit<TransferAction, 'label'>, NestedActionBase {
  type: 'transfer';
}

// HTTP Action within a flow
export interface NestedHttpAction extends Omit<HttpAction, 'label'>, NestedActionBase {
  type: 'http';
}

// Decision Action (user chooses a path)
export interface DecisionAction extends NestedActionBase {
  type: 'decision';
  title: string;
  description?: string;
  options: {
    label: string;
    value: string; // Value associated with the chosen option
    nextActionId: string; // ID of the next action for this option
  }[];
}

// Completion Action (end of a flow path)
export interface CompletionAction extends NestedActionBase {
  type: 'completion';
  message: string;
  status: 'success' | 'error' | 'info';
  // Does not have nextActions
}

// Union type for any nested action
export type NestedAction =
  | NestedBlockchainAction
  | NestedTransferAction
  | NestedHttpAction
  | CompletionAction
  | DecisionAction;
```

**Key Properties of `NestedActionBase`:**

- `id`: A **unique** identifier for this action _within the flow_. Used for navigation (`initialActionId`, `nextActionId`).
- `label`: Specific label for this step of the flow.
- `nextActions`: An array defining which action(s) should execute next after this one completes successfully.

## Navigation and Conditions (`nextActions`)

The `nextActions` property controls the flow.

```typescript
// src/interface/actions/flowAction.ts
export interface NextActionDefinition {
  actionId: string; // ID of the next action to execute
  conditions?: ActionCondition[]; // Optional conditions (all must be met)
}

export interface ActionCondition {
  field: string; // Field in the context to evaluate (e.g., 'lastResult.status', 'userInput.amount')
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'; // Comparison operator
  value: any; // Value to compare against
}
```

- If a `NestedAction` (except `CompletionAction`) has a `nextActions` array:
  - If there's only one `NextActionDefinition` without `conditions`, navigate to that `actionId` upon success.
  - If there are multiple `NextActionDefinition`s, evaluate the `conditions` of each one in order. The first one whose conditions are met determines the next `actionId`.
  - If no conditions are met (and there's no condition-less definition at the end), the flow might end or be considered in an invalid state (depends on the executor implementation).
- `conditions` are evaluated against an **execution context** that maintains the flow's state, including the results of the last action (`lastResult`) and user inputs.
- The `field` uses dot notation to access nested values in the context (e.g., `lastResult.data.txHash`).

## Special Nested Action Types

### `DecisionAction`

Presents options to the user. The `value` of the option selected by the user is stored in the context (typically as `userInput` or `userChoice`) and used to determine the `nextActionId` specified in that option.

### `CompletionAction`

Marks the end of a flow path. Displays a final `message` with a `status`. It does not have `nextActions`.

## Example: DeFi Swap Flow (Approval + Swap)

```typescript
import {
  ActionFlow,
  NestedBlockchainAction,
  DecisionAction,
  CompletionAction,
  PARAM_TEMPLATES,
  createParameter,
} from '@sherrylinks/sdk';

// Simplified ABIs (erc20Abi, dexAbi) ...

const defiSwapFlow: ActionFlow = {
  type: 'flow',
  label: 'DeFi Swap',
  initialActionId: 'approve-token',
  actions: [
    // 1. Approve Token
    {
      id: 'approve-token',
      type: 'blockchain',
      label: 'Step 1: Approve USDC Spend',
      address: '0xUsdcAddress...',
      abi: erc20Abi,
      functionName: 'approve',
      chains: { source: 43114 },
      params: [
        createParameter(PARAM_TEMPLATES.ADDRESS, {
          name: 'spender',
          value: '0xDexRouterAddress...',
          fixed: true,
        }),
        createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
          name: 'amount',
          label: 'Amount to Approve' /* Could come from a previous step */,
        }),
      ],
      nextActions: [
        {
          actionId: 'confirm-swap',
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'success' }],
        },
        {
          actionId:
            'approval-failed' /* No conditions, runs if the previous fails or isn't 'success' */,
        },
      ],
    } as NestedBlockchainAction,

    // 2. Confirm Swap (Decision)
    {
      id: 'confirm-swap',
      type: 'decision',
      label: 'Step 2: Confirm Swap',
      title: 'Proceed with Swap?',
      description: 'You have approved the token. Do you want to execute the swap now?',
      options: [
        { label: 'Yes, Swap', value: 'confirm', nextActionId: 'execute-swap' },
        { label: 'Cancel', value: 'cancel', nextActionId: 'swap-cancelled' },
      ],
    } as DecisionAction,

    // 3. Execute Swap
    {
      id: 'execute-swap',
      type: 'blockchain',
      label: 'Step 3: Executing Swap',
      address: '0xDexRouterAddress...',
      abi: dexAbi,
      functionName: 'swapExactTokensForTokens',
      chains: { source: 43114 },
      params: [
        // Swap parameters, could use context values {{...}}
        // e.g., { name: 'amountIn', value: '{{approveStep.params.amount}}' }
      ],
      nextActions: [
        {
          actionId: 'swap-success',
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'success' }],
        },
        { actionId: 'swap-failed' },
      ],
    } as NestedBlockchainAction,

    // --- Completion States ---
    {
      id: 'approval-failed',
      type: 'completion',
      label: 'Approval Failed',
      message: 'Token approval failed. Please try again.',
      status: 'error',
    } as CompletionAction,
    {
      id: 'swap-success',
      type: 'completion',
      label: 'Swap Successful',
      message: 'Your swap completed successfully!',
      status: 'success',
    } as CompletionAction,
    {
      id: 'swap-failed',
      type: 'completion',
      label: 'Swap Failed',
      message: 'The swap failed after approval.',
      status: 'error',
    } as CompletionAction,
    {
      id: 'swap-cancelled',
      type: 'completion',
      label: 'Swap Cancelled',
      message: 'You have cancelled the swap.',
      status: 'info',
    } as CompletionAction,
  ],
};
```

This example shows how to chain actions, use conditions based on success (`lastResult.status`), and guide the user through a decision and to different final states. Parameter values in later steps can reference outputs or inputs from previous steps using template syntax `{{contextVariable}}` (the exact context handling implementation may vary).
