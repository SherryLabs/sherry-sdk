# Supported Chains

All Sherry Links use Avalanche as their origin blockchain. Additionally, we support cross-chain Sherry Links through our Wormhole integration. This integration enables:

+ Transferring native token across chains.
+ Executing smart contract functions in a cross-chain manner.


All configurations or function executions involving cross-chain interactions will use a Wormhole-specific Chain ID, which differs from the standard Chain IDs of individual blockchains. You can learn more about this in the [Wormhole documentation](https://wormhole.com/docs/build/reference/chain-ids/#__tabbed_1_2).


This Wormhole Chain ID is used in the `sendMessage` and `quoteCrossChainCost` functions. Therefore, if you want to interact directly with the [contract](https://github.com/SherryLabs/sherry-contracts/blob/main/contracts/wormhole/SL1MessageSender.sol), you must provide the corresponding value of our supported blockchains in the `uint16 _targetChainparameter`.


In the metadata you only assign to Chains the value of `celo` or `alfajores` for example, as appropriate.


The current list of supported destination blockchains is provided in the following table.

# Origin Chain

Avalanche will always be the origin chain.


::: In the metadata as chain if you define a blockchain other than Avalanche or Fuji, it is considered a cross-chain Sherry Link. :::

## Mainnet

| Name      | Wormhole Chain ID  | Chain ID |
| ------------- | -------:| :--------: |
| Avalanche     |   6     |   43114    |

## Testnet

| Name      | Wormhole Chain ID  | Chain ID |
| ------------- | -------:| :--------: |
| Avalanche fuji     |   6     |   43113    |

## Destination Chain

The following blockchains are currently supported as destinations, more blockchains will be added in the future 

## Mainnet

| Name      | Wormhole Chain ID  | Chain ID |
| ------------- | -------:| :--------: |
| Celo     |   14     |   42220    |

## Testnet

| Name      | Wormhole Chain ID  | Chain ID |
| ------------- | -------:| :--------: |
| Celo Alfajores     |   14     |   44787   |





