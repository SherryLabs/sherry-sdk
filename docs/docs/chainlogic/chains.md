# Chains

The Chain type describes the supported chains and must be defined in the metadata for BlockchainAction or TransferAction to execute properly. This is critical because if you try to execute a function from a contract on Avalanche but specify Celo as Chain, the transaction will not fail at the source chain, but it will fail when trying to execute on Celo since the function will not exist there.

# Chain Type

The Chain type has the following definition

```TypeScript
export type Chain = "fuji" | "avalanche" | "alfajores" | "celo" | "monad-testnet"

export type Chain = "fuji" | "avalanche" | "alfajores" | "celo" | "monad-testnet"

/**
 * Reset the text fill color so that placeholder is visible
 */
.npm__react-simple-code-editor__textarea:empty {
  -webkit-text-fill-color: inherit !important;
}

/**
 * Hack to apply on some CSS on IE10 and IE11
 */
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  /**
    * IE doesn't support '-webkit-text-fill-color'
    * So we use 'color: transparent' to make the text transparent on IE
    * Unlike other browsers, it doesn't affect caret color in IE
    */
  .npm__react-simple-code-editor__textarea {
    color: transparent !important;
  }

  .npm__react-simple-code-editor__textarea::selection {
    background-color: #accef7 !important;
    color: transparent !important;
  }
}
```

## Chain Context

```TypeScript
export interface ChainContext {
  source: Chain;
  destination?: Chain;  // undefined for single-chain actions
}
```

## Example:

```TypeScript
{
    url: "https://sherry.social/links",
    icon: "icon",
    title: "sherry.social",
    description: "claim your early supporter badge",
    actions: [
        {
           label: "Mint Badge",
           address: "0x1234567890abcdef1234567890abcdef12345678",
           abi: exampleAbi,
           functionName: "safeMint",
           paramsLabel: ["To"],
           chains: { source: "avalanche" }
        }
    ]
};
```
