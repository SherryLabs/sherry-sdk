# Metadata Validation

Validation ensures the mini-app is correctly structured and prevents runtime errors.

```typescript
✅ createMetadata()
Validates and throws an error if invalid:
try {
  const validData = createMetadata(myMetadata);
} catch (error) {
  console.error('Validation failed:', error.message);
}

🧐 validateMetadata()
Returns an object with validation result (no exceptions):
const result = validateMetadata(myMetadata);
if (!result.isValid) {
  result.errors.forEach(err => {
    console.error(`${err.path}: ${err.message}`);
  });
}
```

## 🔍 What Gets Validated?
```typescript
Metadata structure

Action types and required fields

Chain support

ABI match in BlockchainAction

Parameter validity and matching

Unique and valid flows in ActionFlow
```
