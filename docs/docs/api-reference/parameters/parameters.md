---
sidebar_position: 5
---

# Action Parameters

Action parameters define the inputs users provide when executing actions. They control UI generation and data validation. All parameter objects share a common set of base properties and can include additional properties specific to their type.

## Base Parameter Properties

All parameter types extend from a base structure and include the following properties:

```typescript
interface BaseParameter {
  name: string;        // Unique identifier for the parameter.
  label: string;       // User-friendly label displayed in the UI.
  type: string;        // Specifies the input type (e.g., 'text', 'number', 'select').
  required?: boolean;  // Whether the parameter is mandatory (default: false).
  description?: string;// Additional help text or guidance for the user.
  fixed?: boolean;     // If true, the parameter's value is pre-set and not editable by the user.
  value?: any;         // Default or fixed value for the parameter.
}
```

| Property      | Type      | Required | Description                                       |
|---------------|-----------|----------|---------------------------------------------------|
| `name`        | `string`  | ✅        | Unique parameter name/identifier.                 |
| `label`       | `string`  | ✅        | User-friendly label for the UI.                   |
| `type`        | `string`  | ✅        | The specific type of the parameter.               |
| `required`    | `boolean` | ❌        | Whether the field is mandatory.                   |
| `description` | `string`  | ❌        | Additional help text displayed to the user.       |
| `fixed`       | `boolean` | ❌        | If true, the value is pre-defined and not user-editable. |
| `value`       | `any`     | ❌        | Default value or the fixed value if `fixed` is true. |

## Parameter Types

Below are the specific parameter types available, each extending the `BaseParameter` properties with its own unique characteristics and additional fields.

### Text-Based Parameters

For inputs that expect textual data. This includes plain text, emails, URLs, and longer messages.

**Interface:**
```typescript
interface TextBasedParameter extends BaseParameter {
  type:
    | 'text'
    | 'email'
    | 'url'
    | 'textarea'
    | 'string' // Generic string, often used with ABI types
    | 'bytes'  // For byte strings, typically hex-encoded
    | Extract<AbiType, 'string' | 'bytes' | `bytes${number}`>;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regular expression for validation.
}
```

**Properties:**

| Property    | Type     | Description                                     |
|-------------|----------|-------------------------------------------------|
| `minLength` | `number` | Minimum character length.                       |
| `maxLength` | `number` | Maximum character length.                       |
| `pattern`   | `string` | A regex pattern for input validation.           |

**Examples:**

*   **Simple Text Input:**
    ```json
    {
      "name": "username",
      "label": "Username",
      "type": "text",
      "required": true,
      "minLength": 3,
      "maxLength": 20,
      "pattern": "^[a-zA-Z0-9_]+$",
      "description": "Must be 3-20 alphanumeric characters or underscores."
    }
    ```

*   **Email Input:**
    ```json
    {
      "name": "userEmail",
      "label": "Email Address",
      "type": "email",
      "required": true,
      "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", // Example, often handled by UI
      "description": "Please enter a valid email address."
    }
    ```

*   **Textarea for Longer Messages:**
    ```json
    {
      "name": "feedback",
      "label": "Your Feedback",
      "type": "textarea",
      "required": false,
      "maxLength": 500,
      "description": "Provide your comments (max 500 characters)."
    }
    ```

### Number-Based Parameters

For inputs that expect numerical data, including integers, decimals, and dates/times represented as timestamps.

**Interface:**
```typescript
interface NumberBasedParameter extends BaseParameter {
  type: 'number' | 'datetime' | Extract<AbiType, `uint${string}` | `int${string}`>;
  min?: number;     // Minimum allowed value.
  max?: number;     // Maximum allowed value.
  pattern?: string; // Regular expression (less common for numbers but available).
}
```

**Properties:**

| Property  | Type     | Description                                      |
|-----------|----------|--------------------------------------------------|
| `min`     | `number` | Minimum numerical value (inclusive).             |
| `max`     | `number` | Maximum numerical value (inclusive).             |
| `pattern` | `string` | A regex pattern for validating the number format. |

**Examples:**

*   **Decimal Number Input:**
    ```json
    {
      "name": "amount",
      "label": "Amount",
      "type": "number",
      "required": true,
      "min": 0.01,
      "max": 1000,
      "description": "Enter an amount between 0.01 and 1000."
    }
    ```

*   **Integer (ABI `uint256`) Input:**
    ```json
    {
      "name": "tokenId",
      "label": "Token ID",
      "type": "uint256", // Or 'number' if not strictly for ABI
      "required": true,
      "min": 0,
      "pattern": "^[0-9]+$",
      "description": "Enter the NFT Token ID (non-negative integer)."
    }
    ```

*   **Datetime Input (Unix Timestamp):**
    ```json
    {
      "name": "expirationDate",
      "label": "Expiration Date",
      "type": "datetime",
      "required": true,
      "description": "Select the expiration date and time."
    }
    ```

### Address Parameters

For inputs that expect blockchain addresses (e.g., Ethereum addresses).

**Interface:**
```typescript
interface AddressParameter extends BaseParameter {
  type: 'address' | Extract<AbiType, 'address'>;
  pattern?: string; // Regular expression for custom address validation.
}
```

**Properties:**

| Property  | Type     | Description                                     |
|-----------|----------|-------------------------------------------------|
| `pattern` | `string` | A regex pattern for validating the address format. Defaults to Ethereum address format if not provided. |

**Example:**
```json
{
  "name": "recipientAddress",
  "label": "Recipient Address",
  "type": "address",
  "required": true,
  "pattern": "^0x[a-fA-F0-9]{40}$", // Standard Ethereum address pattern
  "description": "Enter a valid Ethereum wallet address."
}
```

### Boolean Parameters

For inputs that represent a true/false or yes/no choice, typically rendered as a checkbox.

**Interface:**
```typescript
interface BooleanParameter extends BaseParameter {
  type: 'boolean' | Extract<AbiType, 'bool'>;
}
```

**Properties:**
This parameter type uses only the `BaseParameter` properties.

**Example:**
```json
{
  "name": "agreeToTerms",
  "label": "I agree to the terms and conditions",
  "type": "boolean",
  "required": true,
  "value": false // Default to unchecked
}
```

### Select Parameters

For inputs where the user chooses one option from a dropdown list.

**Interface:**
```typescript
interface SelectOption {
  label: string;                      // Text displayed for the option.
  value: string | number | boolean;   // Actual value of the option.
  description?: string;               // Optional additional description for the option.
}

interface SelectParameter extends BaseParameter {
  type: 'select';
  options: SelectOption[];
}
```

**Properties:**

| Property  | Type             | Description                                     |
|-----------|------------------|-------------------------------------------------|
| `options` | `SelectOption[]` | An array of `SelectOption` objects to populate the dropdown. |

**Example:**
```json
{
  "name": "tokenChoice",
  "label": "Select Token",
  "type": "select",
  "required": true,
  "options": [
    { "label": "Ether (ETH)", "value": "0xETHAddress", "description": "Native currency" },
    { "label": "USD Coin (USDC)", "value": "0xUSDCAddress", "description": "Stablecoin" }
  ],
  "description": "Choose a token for the transaction."
}
```

### Radio Parameters

For inputs where the user chooses one option from a set of radio buttons.

**Interface:**
```typescript
// Uses the same SelectOption interface as SelectParameter

interface RadioParameter extends BaseParameter {
  type: 'radio';
  options: SelectOption[];
}
```

**Properties:**

| Property  | Type             | Description                                     |
|-----------|------------------|-------------------------------------------------|
| `options` | `SelectOption[]` | An array of `SelectOption` objects to create radio buttons. |

**Example:**
```json
{
  "name": "priorityLevel",
  "label": "Priority Level",
  "type": "radio",
  "required": true,
  "value": "medium", // Default selected radio option
  "options": [
    { "label": "Low", "value": "low", "description": "Standard processing time" },
    { "label": "Medium", "value": "medium", "description": "Faster processing" },
    { "label": "High", "value": "high", "description": "Immediate processing" }
  ]
}
```

### File Parameters

For inputs that allow users to upload files.

**Interface:**
```typescript
interface FileParameter extends BaseParameter {
  type: 'file';
  accept?: string;    // Comma-separated string of accepted file types (e.g., "application/pdf,image/jpeg").
  maxSize?: number;   // Maximum file size in bytes.
  multiple?: boolean; // If true, allows multiple file selection.
}
```

**Properties:**

| Property   | Type      | Description                                                                 |
|------------|-----------|-----------------------------------------------------------------------------|
| `accept`   | `string`  | MIME types or extensions (e.g., `image/png`, `.pdf`).                       |
| `maxSize`  | `number`  | Maximum file size in bytes.                                                 |
| `multiple` | `boolean` | Allows selection of multiple files if true.                                 |

**Example:**
```json
{
  "name": "documentUpload",
  "label": "Upload Document",
  "type": "file",
  "required": true,
  "accept": "application/pdf,.docx",
  "maxSize": 5242880, // 5MB
  "multiple": false,
  "description": "Upload your document in PDF or DOCX format (max 5MB)."
}
```

### Image Parameters

A specialized file input for uploading images, with additional properties for image-specific validation.

**Interface:**
```typescript
interface ImageParameter extends BaseParameter {
  type: 'image';
  accept?: string;      // Accepted image types (e.g., "image/jpeg,image/png").
  maxSize?: number;     // Maximum file size in bytes.
  multiple?: boolean;   // If true, allows multiple image selection.
  maxWidth?: number;    // Maximum image width in pixels.
  maxHeight?: number;   // Maximum image height in pixels.
  aspectRatio?: string; // Desired aspect ratio (e.g., "16:9", "1:1").
}
```

**Properties:**

| Property      | Type      | Description                                                                 |
|---------------|-----------|-----------------------------------------------------------------------------|
| `accept`      | `string`  | MIME types for images (e.g., `image/jpeg`, `image/png`).                    |
| `maxSize`     | `number`  | Maximum image file size in bytes.                                           |
| `multiple`    | `boolean` | Allows selection of multiple images if true.                                |
| `maxWidth`    | `number`  | Maximum allowed width of the image in pixels.                               |
| `maxHeight`   | `number`  | Maximum allowed height of the image in pixels.                              |
| `aspectRatio` | `string`  | Enforces a specific aspect ratio (e.g., "16:9", "4:3", "1:1").              |

**Example:**
```json
{
  "name": "profilePicture",
  "label": "Profile Picture",
  "type": "image",
  "required": false,
  "accept": "image/jpeg,image/png",
  "maxSize": 2097152, // 2MB
  "maxWidth": 800,
  "maxHeight": 800,
  "aspectRatio": "1:1",
  "description": "Upload a square profile picture (JPG or PNG, max 2MB, 800x800px)."
}
```

## Validation Properties

Validation properties like `minLength`, `maxLength`, `min`, `max`, `pattern`, `required`, `accept`, `maxSize`, etc., are defined within each parameter type above. Ensure that user inputs meet these criteria for successful action execution. The UI will typically provide immediate feedback based on these validation rules.

## Best Practices

### 1. Parameter Order

For `BlockchainAction`, parameters **must** be in the same order as the ABI function inputs:

```typescript
// ABI function: transfer(address to, uint256 amount)
params: [
  // First parameter: 'to' address
  {
    name: 'to',
    label: 'Recipient',
    type: 'address',
    required: true,
  },
  // Second parameter: 'amount'
  {
    name: 'amount',
    label: 'Amount',
    type: 'uint256',
    required: true,
  },
];
```

### 2. User-Friendly Labels

Use clear, descriptive labels:

```typescript
// Good
{
  name: 'spender',
  label: 'Contract to Approve',
  description: 'The contract that will spend your tokens'
}

// Avoid
{
  name: 'spender',
  label: 'Spender'  // Too technical
}
```

### 3. Provide Helpful Descriptions

```typescript
{
  name: 'slippage',
  label: 'Slippage Tolerance',
  type: 'number',
  description: 'Maximum price difference you\'re willing to accept (0.5% recommended)',
  value: 0.5,
  min: 0.1,
  max: 5.0
}
```

### 4. Use Templates When Possible

```typescript
// Use templates for consistency
createParameter(PARAM_TEMPLATES.ADDRESS, {
  name: 'recipient',
  label: 'Send To'
});

// Instead of manually defining
{
  name: 'recipient',
  label: 'Send To',
  type: 'address',
  required: true,
  pattern: '^0x[a-fA-F0-9]{40}'
}
```

### 5. Validate User Input

```typescript
{
  name: 'tokenAmount',
  label: 'Token Amount',
  type: 'number',
  required: true,
  min: 0.000001,      // Minimum viable amount
  max: 1000000,       // Reasonable maximum
  description: 'Amount must be between 0.000001 and 1,000,000'
}
```

### 6. Group Related Options

For select/radio parameters, organize options logically:

```typescript
{
  name: 'network',
  label: 'Network',
  type: 'select',
  required: true,
  options: [
    // Mainnets first
    { label: 'Ethereum Mainnet', value: 'ethereum' },
    { label: 'Avalanche C-Chain', value: 'avalanche' },
    { label: 'Celo Mainnet', value: 'celo' },
    // Then testnets
    { label: 'Avalanche Fuji (Testnet)', value: 'fuji' },
    { label: 'Celo Alfajores (Testnet)', value: 'alfajores' }
  ]
}
```

## Parameter Examples by Use Case

### Token Transfer

```typescript
const transferParams = [
  createParameter(PARAM_TEMPLATES.ADDRESS, {
    name: 'to',
    label: 'Recipient Address',
  }),
  createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
    name: 'amount',
    label: 'Amount to Send',
    min: 0.000001,
  }),
];
```

### NFT Minting

```typescript
const mintParams = [
  createParameter(PARAM_TEMPLATES.ADDRESS, {
    name: 'to',
    label: 'Mint To Address',
    value: 'sender', // Default to current user
  }),
  {
    name: 'quantity',
    label: 'Quantity',
    type: 'select',
    required: true,
    options: [
      { label: '1 NFT', value: 1 },
      { label: '3 NFTs', value: 3 },
      { label: '5 NFTs', value: 5 },
    ],
  },
];
```

### DAO Voting

```typescript
const voteParams = [
  {
    name: 'proposalId',
    label: 'Proposal ID',
    type: 'uint256', // or 'number'
    required: true,
    description: 'The ID of the proposal to vote on.'
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
    description: 'Cast your vote for or against the proposal.'
  },
];
```

### API Form

```typescript
const formParams = [
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    description: 'Please enter your email.'
  },
  {
    name: 'feedback',
    label: 'Your Feedback',
    type: 'textarea',
    required: true,
    maxLength: 1000,
    description: 'Tell us what you think (max 1000 characters).'
  },
  {
    name: 'rating',
    label: 'Rating',
    type: 'select',
    required: true,
    options: [
      { label: '1 - Poor', value: 1 },
      { label: '2 - Fair', value: 2 },
      { label: '3 - Good', value: 3 },
      { label: '4 - Very Good', value: 4 },
      { label: '5 - Excellent', value: 5 },
    ],
    description: 'Rate your experience.'
  },
];
```

---

For more examples and advanced parameter configurations, see the [Action Types](./action-types/blockchain-actions.md) documentation.
