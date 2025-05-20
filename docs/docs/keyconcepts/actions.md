# Understanding Actions and Parameters

## 🛠️ Action Parameters

Parameters define the user inputs required when executing actions.

```typescript
🔤 StandardParameter
Used for common inputs like strings, addresses, numbers, etc.
type BaseInputType =
  | 'address' | 'string' | 'bool' | 'bytes'
  | 'int' | 'uint' | 'text' | 'number'
  | 'email' | 'url' | 'datetime' | 'textarea';

🔽 SelectParameter & RadioParameter
Dropdown or radio inputs, using:
interface SelectOption {
  label: string;
  value: string | number | boolean;
  description?: string;
}

🧰 PARAM_TEMPLATES
Use PARAM_TEMPLATES and createParameter() to simplify input field creation:
const amountParam = createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
  name: 'transferAmount',
  label: 'Amount to Send',
  min: 0.01,
});

```
