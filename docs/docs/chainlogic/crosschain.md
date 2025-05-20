
# Cross-Chain

When using a Sherry Link to perform transfers from one chain to another, you are leveraging the power of cross-chain operations enabled by the Wormhole protocol. This advanced integration allows seamless communication and asset transfers between blockchains, breaking the barriers of isolated networks and enabling a unified decentralized experience.


# Introduction


When using a Sherry Link to perform transfers from one chain to another, you are leveraging the power of cross-chain operations enabled by the Wormhole protocol. This advanced integration allows seamless communication and asset transfers between blockchains, breaking the barriers of isolated networks and enabling a unified decentralized experience.

Cross-chain operations involve multiple components working together: from relaying messages securely across networks to ensuring accurate gas estimations and handling potential discrepancies in asset pricing. These complexities are abstracted within Sherry Links, providing developers and users a streamlined way to interact with different blockchains without the need to manage intricate technical details.

In this section, we will delve into the core concepts behind cross-chain operations, explain how costs are calculated, and guide you through configuring and executing transfers effectively. Whether you are sending assets, invoking smart contract functions, or combining both, understanding these foundations will empower you to optimize your cross-chain workflows.


## How it works


When sending cross-chain messages, it is important to consider certain aspects: the cost associated with the message, which includes executing a transaction on the destination blockchain, and any potential gas surplus that may occur.


Gas Cost: Cross-chain transfers require additional gas to facilitate the communication between chains. When specifying Celo (or any supported chain) as the chains, the transaction includes a gas cost which is more than standard transfers due to the complexity of cross-chain operations.
Excess Gas Refund: Any excess gas, after the transaction is completed, is refunded to the sender on the Avalanche chain, ensuring you only pay for what is necessary.



## Cross-Chain Message Costs

When sending messages through Wormhole, you can estimate the associated costs using the quoteEVMDeliveryPrice function provided by the Wormhole Relayer. This function requires several key parameters:

Destination blockchain: The network where the transaction will be executed.
Expected native cryptocurrency amount: If needed, specify the amount of native cryptocurrency the recipient will receive on the destination blockchain.
Gas limit: This parameter is crucial as it determines the maximum amount of gas that can be consumed during the transaction. Depending on the complexity of the function being executed, the gas limit may vary. Currently, we use values ranging from 100,000 to 800,000, and this must be specified by the creator of the Sherry Link.

# Verifying Cross-Chain Message Costs

If you want to verify the fee for sending a message via cross-chain sherry links for a cross-chain transfer, you can use the following function from our smart contract:

```typescript
function quoteCrossChainCost(
    uint16 _targetChain,
    uint256 _receiverValue,
    uint256 _gasLimit
) public view returns (uint256 cost) {
    (cost, ) = s_wormholeRelayer.quoteEVMDeliveryPrice(
        _targetChain,
        _receiverValue,
        _gasLimit
    );
}
```

+ _targetChain: The chain ID of the destination chain in Wormhole format (e.g., 14 for Celo).
+ _receiverValue: The amount in wei to be transferred to the recipient in the destination chain. This amount will be the amount the user will receive. If no native tokens are transferred, 0 will be set.
+ _gasLimit: An estimated gas limit for the transaction on the target chain.

# Cross-Chain TransferAction Example

This example demonstrates a `TransferAction` that facilitates a cross-chain transaction between two test networks: **Fuji** (Avalanche Testnet) and **Alfajores** (Celo Testnet).

Key Features:

+ **Functionality**: Invokes the `captureTheFlag` function on a smart contract.

+ **Cross-Chain Interaction**: Transfers tokens from the Fuji network to the Alfajores network.

+ **Fixed Amount**: Transfers a fixed amount of **0.1** tokens.

+ **User Input**: Prompts the user to input a recipient `address`.

This setup allows users to engage in a cross-chain `Capture the Flag` activity by specifying a recipient address and initiating the token transfer across networks.

Here's how the `TransferAction` is defined:

```typescript
{
  "url": "tuurl",
  "icon": "tuicon",
  "title": "Capture the flag Cross-Chain",
  "description": "Be the Best and Capture the Flag",
  "actions": [
    {
      "label": "CAPTURE FOR 0.1",
      "address": "0x812810512193d623a68e467cc314511a581E4546",
      "type": "blockchain",
      "abi": [ ... ],
      "functionName": "captureFlag",
      "chains": {
        "source": "fuji",
        "destination": "alfajores"
      },
      "amount": 0.1,
      "params": [
        {
          "name": "_participant",
          "label": "To",
          "value": "sender",
          "required": true,
          "type": "address"
        }
      ],
    }
  ]
}
```

:::  For a TransferAction corresponding to a transfer of native tokens from a blockchain to a source blockchain we send a gas_limit of **100_000**.
For Blockchain Actions, depending on the state of the network we send a maximum of **800_000**.
:::



This function interacts with the Wormhole Relayer to quote the cost of the cross-chain message delivery, helping you understand the exact fee before initiating the transfer. This is crucial for budgeting gas costs accurately in cross-chain operations facilitated by the Wormhole protocol.

## How to define cross-chain Sherry Link

The way to define a sherry link is very simple and is done through the metadata. In the chains property you must assign a different chain for source and destination, taking into account that this chain <u>*must be supported* </u>
  by Sherry.

A Sherry Link allows seamless operations across blockchains, simplifying both smart contract interactions and cryptocurrency transfers. Two main types of actions are supported: BlockchainAction and TransferAction. 

## BlockchainAction

This type of action allows interaction with a smart contract on the target blockchain, executing a specific function defined in its ABI. Additionally, native cryptocurrency can be sent along with the function execution if the function is payable.

```typescript
const actionMetadata: BlockchainActionMetadata = {
  label: "Cross-Chain Action",
  address: "0x1234567890abcdef1234567890abcdef12345678",
  abi: exampleAbi,
  functionName: "mint",
  chains: { source: "avalanche", destination : "celo" },
  amount: 0.01 // Optional: amount of native cryptocurrency to send
};
```

::: As you can see, celo has been defined as destination, this will be interpreted as cross-chain by Sherry (from Avalanche to Celo). :::

+ label: Text displayed on the Sherry Link button.
+ address: The smart contract’s address on the target blockchain.
+ abi: The ABI of the contract required to interact with its functions.
+ functionName: The function in the contract to be executed (e.g., mint).
+ chains: The blockchains where the action will take place (e.g., avalanche - celo).
+ amount: (Optional) Amount of native cryptocurrency to send to the function. If specified, the function must be payable.

Additionally, the ABI is validated to check if the mint function requires parameters. If so, the corresponding input fields are dynamically generated for the user.

## TransferAction

This type of action is designed for transferring native cryptocurrency between addresses on specific blockchains. Both the recipient (to) and the amount (amount) are optional.

```typescript
const actions: TransferAction[] = [
  {
    label: "0.01 CELO",
    to: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
    amount: 0.01,
    chains: { source: "avalanche", destination : "celo" },
  },
  {
    label: "Manual Transfer",
    chains: { source: "avalanche", destination : "celo" },
  },
];
```

# Understanding BlockchainAction Execution

When a BlockchainAction is executed in the context of a Sherry Link, it triggers a series of operations designed to facilitate cross-chain communication and smart contract interactions. Below, we detail how the sendMessage function works and how the data is handled throughout the process.

## Function Overview - sendMessage

The core of the BlockchainAction lies in the sendMessage function, which is responsible for encoding and sending the necessary information to execute a contract function on the target blockchain. The function signature is as follows:

```typescript
function sendMessage(
    uint16 _targetChain,
    address _receiverAddress,
    address _contractToBeCalled,
    bytes memory _encodedFunctionCall,
    uint256 _gasLimit,
    uint256 _receiverValue
) external payable {
    require(_gasLimit <= GAS_LIMIT, "Gas limit exceeds the maximum limit");
    
    bytes memory encodedData = encodeMessage(
        _contractToBeCalled,
        _encodedFunctionCall
    );

    uint256 cost = quoteCrossChainCost(
        _targetChain,
        _receiverValue,
        _gasLimit
    );
    require(msg.value >= cost, "Insufficient funds to send the message");

    s_wormholeRelayer.sendPayloadToEvm{value: cost}(
        _targetChain,
        _receiverAddress,
        encodedData,
        _receiverValue,
        _gasLimit,
        ORIGIN_CHAIN,
        msg.sender
    );
}
```
## Parameters Explanation


+ _targetChain: The chain to which the message will be sent.
+ _receiverAddress: The address of the smart contract that will handle the message on the target blockchain (SL1MessageReceiver).
+ _contractToBeCalled: The address of the contract function to be executed.
+ _encodedFunctionCall: The encoded data containing the function call and its parameters.
+ _gasLimit: The maximum gas limit for the transaction on the target chain.
+ _receiverValue: The amount of native cryptocurrency to be sent along with the message.

Upon invocation, the function first encodes the contract address and the function call using encodeMessage. This encoding is crucial, as it transforms the data into a format that can be interpreted by the receiving contract.

Next, it calculates the cost associated with sending the message across chains using quoteCrossChainCost, ensuring the sender has provided sufficient funds. If the conditions are met, it proceeds to call s_wormholeRelayer.sendPayloadToEvm, sending the encoded data to the target chain.

## Message Reception and Execution

On the target blockchain, the receiving contract will execute the receiveWormholeMessages function when a message is received. This function is designed to handle the incoming payload and trigger the appropriate contract function. Here’s an outline of how it operates:

```typescript
function receiveWormholeMessages(
    bytes memory payload,
    bytes[] memory,
    bytes32 sourceAddress,
    uint16 sourceChain,
    bytes32
) public payable override isRegisteredSender(sourceChain, sourceAddress) {
    require(
        msg.sender == address(s_wormholeRelayer),
        "Only the Wormhole Relayer can call this function"
    );

    s_payload = payload;

    emit MessageInfoReceived(sourceAddress, payload);

    (
        address contractToBeCalled,
        address sender,
        bytes memory encodedFunctionCall
    ) = abi.decode(payload, (address, address, bytes));

    s_lastSender = sender;
    s_lastEncodedFunctionCall = encodedFunctionCall;
    s_lastContractToBeCalled = contractToBeCalled;
    s_sourceAddress = sourceAddress;

    (bool success, ) = contractToBeCalled.call{value: msg.value}(
        encodedFunctionCall
    );

    if (!success) {
        emit FunctionCallError("Error executing function call");
    } else {
        emit FunctionExecuted(contractToBeCalled, encodedFunctionCall);
    }
}
```
## Key Operations

+ The function checks if it was called by the Wormhole Relayer, ensuring only authorized entities can execute it.
+ It decodes the incoming payload to retrieve the original function call parameters.
+ The contract then uses call to execute the specified function on the target contract, transferring any native cryptocurrency value that was included in the message.

## Important Considerations

+ The msg.sender during cross-chain operations will always refer to the Sherry Receiver contract on the target blockchain. This is critical for ensuring that permissions and function calls are handled correctly.
+ Any functions utilizing msg.sender will operate under the assumption that it refers to the Sherry Receiver, thus impacting access controls and function logic.


























