# Understanding Actions and Parameters

## ⚙️ Actions

In Sherry, **actions** are the core interactive units that define what a mini-app can do.  
Each action represents a specific task the user can trigger—such as sending tokens, calling a smart contract, or initiating a multi-step flow.

Actions determine:
- What will be executed (e.g., a transfer, a contract call)
- What input the user must provide
- On which blockchain(s) the action will take place

Sherry supports different types of actions, each tailored to common Web3 interactions. In the following sections, we'll explore each action type in detail.

### ⚙️ DynamicAction

`DynamicAction` is a flexible action type used to define dynamic behaviors within a mini-app.

It includes:
- A `label` and optional `description` shown to the user
- A `chains` field (`ChainContext`) to specify source and optional destination chains
- A `path` indicating the backend endpoint or execution route
- Optional `params`, which are user inputs defined using the `Parameter` type

This action type is useful when the logic behind the action is computed or resolved dynamically rather than being statically defined in the frontend.

```typescript
import { ChainContext } from '../chains';
import { Parameter } from '../inputs';

export interface DynamicAction {
    type: 'dynamic';
    label: string;
    description?: string;
    chains: ChainContext;
    path: string;
    params?: Parameter[];
}
```

Every interactive element within a mini-app—whether it's sending tokens or calling a smart contract—relies on **user inputs**.

## ⚙️ Parameters

In the Sherry SDK, these inputs are called **Parameters**. They define the information a user needs to provide before an action can be executed. For example: an address to send tokens to, an amount to transfer, or a token to select.

All parameters are built on a shared structure that controls how they appear in the UI and how the SDK handles them internally.

At the core, a parameter has:
- A `name` (used in the code or contract ABI)
- A `label` (what the user sees)
- A `type` (the kind of input expected: address, string, number, etc.)
- Optional validation rules (e.g., required, min/max, regex)

Parameters in the SDK are grouped into three main types:

- **Standard Inputs**: text fields, numbers, addresses, booleans, dates, etc.
- **Select Inputs**: dropdowns with predefined options
- **Radio Inputs**: single-choice selections with labeled options

These inputs are used across action types like `BlockchainAction` and `TransferAction`, allowing you to build rich, interactive forms for users to complete before submitting a transaction.

In the following sections, we’ll explore each parameter type in detail and explain how to configure them inside your mini-apps.

## Inputs 

In Sherry is required a list of predefined options. These options are described using the `SelectOption` interface.

```typescript
import { AbiType } from 'abitype';

// Option for selects and radios
export interface SelectOption {
    label: string;
    value: string | number | boolean;
    description?: string;
}
```

All parameters in the SDK extend from `BaseParameter`, which defines common fields like `name`, `type`, and `label`.  
It also supports optional settings such as `required`, `fixed`, and default `value`.

```typescript
export interface BaseParameter {
    type: string;
    name: string;
    label: string;
    required?: boolean;
    description?: string;
    fixed?: boolean; // If the value is fixed, it is not editable.
    value?: any; // Default value; if not provided, an empty input will be rendered.
}
```

+ `TextBasedParameter` is used for text inputs like strings, emails, URLs, or byte data.  
It supports validation rules such as `minLength`, `maxLength`, and regex `pattern`.

```typescript
export interface TextBasedParameter extends BaseParameter {
    type:
        | 'text'
        | 'email'
        | 'url'
        | 'textarea'
        | 'string'
        | 'bytes'
        | Extract<AbiType, 'string' | 'bytes' | `bytes${number}`>;
    minLength?: number;
    maxLength?: number;
    pattern?: string; // For validations using regex.
}
```

+ `NumberBasedParameter` handles numeric and datetime inputs, including integer types from ABI.  
It allows optional validation using `min`, `max`, and regex `pattern`.

```typescript
export interface NumberBasedParameter extends BaseParameter {
    type: 'number' | 'datetime' | Extract<AbiType, `uint${string}` | `int${string}`>;
    min?: number; // For numeric and datetime inputs.
    max?: number; // For numeric and datetime inputs.
    pattern?: string; // For regex validations.
}
```
+ `AddressParameter` is used for wallet address inputs. It supports optional regex-based validation through the `pattern` field.

```typescript
export interface AddressParameter extends BaseParameter {
    type: 'address' | Extract<AbiType, 'address'>;
    pattern?: string; // For regex validations.
}
```
+ `BooleanParameter` represents true/false inputs, often used for confirmations or toggles.  
It maps directly to Solidity's `bool` type.

```typescript
export interface BooleanParameter extends BaseParameter {
    type: 'boolean' | Extract<AbiType, 'bool'>;
}
```
+ `SelectParameter` is used to create dropdown inputs where users choose from predefined options.  
Each option is defined using the `SelectOption` interface.

```typescript
export interface SelectParameter extends BaseParameter {
    type: 'select';
    options: SelectOption[];
}
```
+ `RadioParameter` is used to render a set of radio buttons for single-option selection.  
Like `SelectParameter`, it uses `SelectOption[]` to define the available choices.

```typescript
export interface RadioParameter extends BaseParameter {
    type: 'radio';
    options: SelectOption[];
}
```
+ `StandardParameter` is a union type that includes all common input types: text, numbers, addresses, and booleans.  
It’s the most frequently used category for simple, single-field inputs in Sherry mini-apps.

```typescript
export type StandardParameter =
    | TextBasedParameter
    | NumberBasedParameter
    | AddressParameter
    | BooleanParameter;
```

+ `SelectionInputType` defines the two supported input types for multiple-choice selections.  
These are `'select'` for dropdowns and `'radio'` for radio button groups.

```typescript
export type SelectionInputType = 'select' | 'radio';
```

+ `UIInputType` defines the different types of input fields rendered in the mini-app UI.  
Each type is a specialized version of a string, number, or boolean adapted for specific use cases like email, URL, or date selection.

```typescript
export type UIInputType =
    | 'text' // String specialization with validation
    | 'number' // Specialization of number, uint or int work for number too
    | 'email' // String specialization for email
    | 'url' // String specialization for URLs
    | 'datetime' // String specialization for date
    | 'textarea' // String specialization for long text
    | 'boolean';
```

+ `BaseInputType` unifies all valid input types supported by the SDK.  
It includes ABI-compatible types, UI-specific inputs, and selection-based options like dropdowns and radio buttons.

```typescript
export type BaseInputType = AbiType | UIInputType | SelectionInputType;
```

+ `Parameter` is the main type used to define user inputs in Sherry actions.  
It combines standard fields, dropdowns (`SelectParameter`), and radio buttons (`RadioParameter`) into a single flexible structure.

```typescript
export type Parameter = StandardParameter | SelectParameter | RadioParameter;
```