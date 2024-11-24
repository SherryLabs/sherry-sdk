# Sherry SDK

Welcome to the Sherry SDK! This SDK allows you to create mini-apps that interact with any function of any smart contract.

## Features

- **Smart Contract Interaction**: Easily interact with any function of any smart contract.
- **Mini-App Creation**: Build mini-apps quickly and efficiently.
- **Flexible and Extensible**: Designed to be flexible and easily extensible to meet your needs.

## Installation

To install the Sherry SDK, use the following command:


```bash
npm install @sherrylinks/sdk
```

```bash
yarn add @sherrylinks/sdk
```

## Usage

Here is a basic example of how to use the Sherry SDK:

Abi

```typescript

```

Metadata definition

```typescript
{
    type: "action",
    icon: "icon",
    title: "title",
    description: "description",
    actions: [
        {
           label: "Test Action 2",
           contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
           contractABI: exampleAbi,
           functionName: "safeTransferFrom",
           functionParamsLabel: ["From"],
           chainId: "fuji"
        },
        {
          label: "Test Action 2",
          contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
          contractABI: exampleAbi,
          functionName: "safeTransferFrom",
          chainId: "fuji"
        }
    ]
};
```

More details in [ours docs](https://docs.getsherry.app/guides)

## Documentation

For detailed documentation and API reference, please visit our [official documentation](https://docs.getsherry.app/).

## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

If you have any questions or need further assistance, feel free to reach out to our support team at support@getsherry.social.

Happy coding with Sherry SDK!