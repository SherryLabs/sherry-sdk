---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/action-types/http-actions.md
sidebar_position: 3
---

# HTTP Actions

`HttpAction` allows your mini-app to interact with external APIs, typically for submitting form data.

## `HttpAction` Interface

```typescript
// src/interface/actions/httpAction.ts
export interface HttpAction {
  label: string; // Label for UI
  endpoint: string; // URL of the API endpoint to call
  params: HttpParameter[]; // Parameters/fields of the form
}

// HttpParameter is a union of StandardParameter, SelectParameter, RadioParameter
// similar to BlockchainParameter, but with slightly different base types.
// See src/interface/actions/httpAction.ts for full details.

export type HttpParameter = StandardParameter | SelectParameter | RadioParameter;

export interface BaseParameter {
  name: string; // Field name (will be the key in the submitted data)
  label: string; // Label for UI
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface StandardParameter extends BaseParameter {
  type: BaseInputType; // 'text', 'number', 'boolean', 'email', 'url', 'datetime', 'textarea'
  // ... other props like minLength, pattern, min, max ...
}

export interface SelectParameter extends BaseParameter {
  type: 'select';
  options: SelectOption[];
}

export interface RadioParameter extends BaseParameter {
  type: 'radio';
  options: SelectOption[];
}

export interface SelectOption {
  label: string;
  value: string | number | boolean;
}
```

- `label`: Text the user sees to initiate the action (e.g., "Submit Feedback").
- `endpoint`: The full URL to which the form data will be sent. The SDK will make a POST request with the data in JSON format by default.
- `params`: An array of `HttpParameter` objects defining the form fields the user will fill out.
  - Each parameter defines a field with `name` (key in the sent JSON), `label` (for the UI), `type` (input type), `required`, etc.
  - The parameter types (`StandardParameter`, `SelectParameter`, `RadioParameter`) and their properties are very similar to those for `BlockchainAction`. See [Parameters](./../parameters.md) for more details on configuration.

## Example: Feedback Form

```typescript
import { HttpAction, HttpParameter } from '@sherrylinks/sdk';

const feedbackAction: HttpAction = {
  label: 'Submit Feedback',
  endpoint: 'https://api.myfeedback.example/submit',
  params: [
    {
      name: 'email',
      label: 'Your Email',
      type: 'email', // Specific input for email
      required: true,
      description: 'We need your email to respond.',
    },
    {
      name: 'rating',
      label: 'Rating',
      type: 'select', // Select input
      required: true,
      options: [
        { label: '⭐', value: 1 },
        { label: '⭐⭐', value: 2 },
        { label: '⭐⭐⭐', value: 3 },
        { label: '⭐⭐⭐⭐', value: 4 },
        { label: '⭐⭐⭐⭐⭐', value: 5 },
      ],
    },
    {
      name: 'comment',
      label: 'Comments',
      type: 'textarea', // Long text input
      required: false, // Optional
      maxLength: 500,
    },
    {
      name: 'subscribe',
      label: 'Subscribe to newsletter',
      type: 'boolean', // Checkbox
      required: false,
      defaultValue: false,
    },
  ],
};
```

When the user completes this form and executes the action, the SDK will send a POST request to `https://api.myfeedback.example/submit` with a JSON body similar to this (depending on user input):

```json
{
  "email": "user@example.com",
  "rating": 4,
  "comment": "Great app!",
  "subscribe": true
}
```

**Note:** Currently, the SDK only supports POST requests with a JSON body. There is no built-in support for other HTTP methods (GET, PUT, DELETE) or content types (form-data, x-www-form-urlencoded) directly via `HttpAction`.
