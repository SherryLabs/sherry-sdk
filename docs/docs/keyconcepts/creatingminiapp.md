# Creating Your First Mini App

Define a Metadata object with all required fields:

```typescript
const simpleTransferApp: Metadata = {
  url: 'https://transfer.myapp.example/simple-avax',
  icon: 'https://myapp.example/icons/avax-transfer.png',
  title: 'Send 0.1 AVAX',
  description: 'Quickly send 0.1 AVAX to the project treasury.',
  actions: [
    {
      label: 'Send 0.1 AVAX',
      description: 'Transfer 0.1 AVAX to the treasury.',
      to: '0xTreasuryAddress...',
      amount: 0.1,
      chains: { source: 'avalanche' },
    } as TransferAction,
  ],
};
```
