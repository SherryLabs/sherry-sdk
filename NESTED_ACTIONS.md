# Nested Actions Framework

## Overview

Nested Actions is a powerful framework within the Sherry SDK that allows developers to create complex, multi-step flows for blockchain interactions, token transfers, and HTTP calls. Unlike standalone actions that execute independently, nested actions work together as a directed graph, enabling conditional execution paths, user decisions, and sequential operation.

## Key Components

### ActionFlow

The `ActionFlow` is the container that holds and manages a collection of nested actions:

```typescript
interface ActionFlow {
  type: 'flow';
  label: string;
  initialActionId: string;
  actions: NestedAction[];
}
```

- `type`: Always 'flow' to identify it as an action flow
- `label`: Human-readable name for the flow
- `initialActionId`: References the first action to execute in the flow
- `actions`: Array of all nested actions in the flow

### NestedAction Types

The framework supports five types of nested actions:

1. **NestedBlockchainAction**: Executes blockchain contract calls
2. **NestedTransferAction**: Handles token transfers
3. **NestedHttpAction**: Makes API requests and submits forms
4. **DecisionAction**: Presents choices to users, allowing them to select the next path
5. **CompletionAction**: Ends a flow with success/error/info status and message

Each action type extends the `NestedActionBase` interface providing a common structure:

```typescript
interface NestedActionBase {
  id: string;
  label: string;
  nextActions?: NextActionDefinition[];
}
```

### Action Sequencing

Actions connect through the `nextActions` array, which can contain multiple potential paths:

```typescript
interface NextActionDefinition {
  actionId: string;
  conditions?: ActionCondition[];
}
```

The `conditions` array allows for conditional execution based on previous action results:

```typescript
interface ActionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: string | number | boolean;
}
```

## Execution Context

The `FlowExecutor` maintains a context object during execution, storing:

- Results of previous actions
- User inputs and decisions
- Dynamic values for subsequent actions

Template placeholders in action parameters (like `{{userAddress}}`) are automatically replaced with values from the context.

## Creating Complex Flows

### Simple Linear Flow

```typescript
const linearFlow: ActionFlow = {
  type: 'flow',
  label: 'Token Purchase Flow',
  initialActionId: 'approve',
  actions: [
    {
      id: 'approve',
      type: 'blockchain',
      label: 'Approve Token',
      // Blockchain action properties...
      nextActions: [{ actionId: 'transfer' }],
    },
    {
      id: 'transfer',
      type: 'transfer',
      label: 'Transfer Token',
      // Transfer action properties...
      nextActions: [{ actionId: 'completion' }],
    },
    {
      id: 'completion',
      type: 'completion',
      label: 'Purchase Complete',
      message: 'Your purchase was successful!',
      status: 'success',
    },
  ],
};
```

### Decision-Based Flow

```typescript
const decisionFlow: ActionFlow = {
  type: 'flow',
  label: 'Payment Options',
  initialActionId: 'choose_payment',
  actions: [
    {
      id: 'choose_payment',
      type: 'decision',
      label: 'Choose Payment Method',
      title: 'Select Payment Method',
      options: [
        { label: 'Credit Card', value: 'card', nextActionId: 'card_payment' },
        { label: 'Crypto', value: 'crypto', nextActionId: 'crypto_payment' },
      ],
    },
    {
      id: 'card_payment',
      type: 'http',
      label: 'Card Payment',
      // HTTP action properties...
      nextActions: [{ actionId: 'completion_success' }],
    },
    {
      id: 'crypto_payment',
      type: 'blockchain',
      label: 'Crypto Payment',
      // Blockchain action properties...
      nextActions: [{ actionId: 'completion_success' }],
    },
    {
      id: 'completion_success',
      type: 'completion',
      label: 'Payment Successful',
      message: 'Thank you for your payment!',
      status: 'success',
    },
  ],
};
```

### Conditional Flow

```typescript
const conditionalFlow: ActionFlow = {
  type: 'flow',
  label: 'NFT Purchase with Approval Check',
  initialActionId: 'check_allowance',
  actions: [
    {
      id: 'check_allowance',
      type: 'blockchain',
      label: 'Check Allowance',
      // Blockchain action properties...
      nextActions: [
        {
          actionId: 'approve_tokens',
          conditions: [{ field: 'lastResult.data.allowance', operator: 'lt', value: 1000 }],
        },
        {
          actionId: 'purchase_nft',
          conditions: [{ field: 'lastResult.data.allowance', operator: 'gte', value: 1000 }],
        },
      ],
    },
    {
      id: 'approve_tokens',
      type: 'blockchain',
      label: 'Approve Tokens',
      // Blockchain action properties...
      nextActions: [{ actionId: 'purchase_nft' }],
    },
    {
      id: 'purchase_nft',
      type: 'blockchain',
      label: 'Purchase NFT',
      // Blockchain action properties...
      nextActions: [{ actionId: 'completion_success' }],
    },
    {
      id: 'completion_success',
      type: 'completion',
      label: 'Purchase Complete',
      message: 'Your NFT purchase was successful!',
      status: 'success',
    },
  ],
};
```

## Flow Validation

The SDK includes the `FlowValidator` class which ensures:

1. All actions referenced in `nextActions` exist in the flow
2. All actions are reachable from the initial action
3. No cycles or dead-ends exist in the flow graph
4. Decision options have valid next action references
5. Completion actions are properly terminal (no next actions)

## Dynamic Parameters

Actions in a flow can reference values from previous action results using template strings:

```typescript
{
    id: 'transfer',
    type: 'transfer',
    label: 'Send Tokens',
    to: '{{lastResult.data.recipientAddress}}',
    amount: 0.1,
    chains: { source: 'avalanche' }
}
```

## Error Handling

The flow executor handles errors by:

1. Capturing error information in the context
2. Adding error results to the execution history
3. Potentially redirecting to error-handling actions based on conditions
4. Allowing for recovery paths in the flow design

## Best Practices

1. **Unique IDs**: Ensure each action has a unique ID within the flow
2. **Validation First**: Validate your flow using FlowValidator before attempting execution
3. **Error Paths**: Always include error handling paths in your flows
4. **Documentation**: Add clear labels and descriptions to help users understand each step
5. **Testing**: Test all possible paths through your flow, including error conditions
6. **Completion Actions**: Every flow should terminate with one or more completion actions

## Use Cases

Nested Actions are ideal for:

- Multi-step processes like token swaps (approval + swap)
- User onboarding flows
- Governance voting (proposal submission, voting, execution)
- NFT minting and listing workflows
- Cross-chain transfers requiring multiple steps
- Any DApp interaction requiring conditional logic or sequential steps

## Flow Execution Visualization

The FlowExecutor maintains a history of executed actions, making it possible to visualize:

- The current state of the flow
- Which actions have been executed
- The results of each action
- The path taken through the flow
- Remaining actions to be executed

This enables rich UI experiences showing users their progress through a complex process.
