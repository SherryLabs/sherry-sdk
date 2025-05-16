 # Key Concepts

 ## 📦 Metadata

## What is Metadata?


The metadata is the **backbone of every mini-app built using the Sherry SDK**. It’s a structured JSON object that defines how your mini-app behaves, how it interacts with blockchain smart contracts, and how it is rendered for users.


By carefully crafting the metadata, developers can create mini-apps tailored to various use cases, from executing token swaps to interacting with complex decentralized protocols.


This is how you define your mini-app's content and behavior:

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

interface Metadata {
  url: string;
  icon: string;
  title: string;
  description: string;
  actions: Action[];
  baseUrl?: string;
}
```

1. **url***: The url that will be shown.<br/>
 Example: "https://sherry.social/links"

2. **icon***: URL of the mini-app's visual representation. <br/>
Example: "https://mi-image.com"

3. **title***: The title displayed in the user interface. <br/>
Example: "sherry.social"

4. **description***: A short explanation of the mini-app's purpose. <br/>
Example: "Claim your early supporter badge"

5. **baseurl** : solo depende de si usas dynamic actions

6. **actions***: <br/>
Puede variar dependiendo de que action se vaya a usar. 

       

 ## ⚙️ Actions

Units of interactivity within your app:

```typescript
BlockchainAction: Contract interaction.

TransferAction: Token transfers.

ActionFlow: Multi-step logic.
```
## 🎛️ Parameters

User input fields tied to an action. Can be text, addresses, booleans, selections, etc.

## ✅ Validation

Sherry SDK includes built-in validators to ensure your mini-app structure is solid before deployment.


