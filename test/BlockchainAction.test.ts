import { describe, expect, it } from "@jest/globals";
import {
  BlockchainActionMetadata,
  BlockchainAction,
  TransferActionMetadata,
} from "../src/interface/blockchainAction";
import { Metadata, ValidatedMetadata } from "../src/interface/metadata";
import {
  getParameters,
  getAbiFunction,
  isValidFunction,
  validateActionParameters,
  getBlockchainActionType,
  createMetadata,
  isTransferActionMetadata,
  isBlockchainAction
} from "../src/utils/helpers";
import { simpleAbi } from "./abi";

describe('BlockchainAction Functions', () => {
  const exampleAbi = simpleAbi

  const actionMetadata: BlockchainActionMetadata = {
    label: "Test Action",
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    contractABI: exampleAbi,
    functionName: "balanceOf",
    functionParamsValue: ["0x1234567890abcdef1234567890abcdef12345678"],
    chainId: "fuji",
  };


  it('should get parameters of a function', () => {
    const parameters = getParameters(actionMetadata);
    expect(parameters).toEqual([{ name: 'owner', type: 'address' }]);
  });

  it('should get the ABI function', () => {
    const abiFunction = getAbiFunction(exampleAbi, "balanceOf");
    expect(abiFunction).toEqual({
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [{ name: 'balance', type: 'uint256' }],
    });
  });

  it('should validate if a function exists in the ABI', () => {
    const isValid = isValidFunction(exampleAbi, "balanceOf");
    expect(isValid).toBe(true);

    const isInvalid = isValidFunction(exampleAbi, "nonExistentFunction");
    expect(isInvalid).toBe(false);
  });

  it('should validate action parameters', () => {
    const action: BlockchainAction = {
      ...actionMetadata,
      transactionParameters: [{ type: 'address' }],
      blockchainActionType: 'view',
    };

    const isValid = validateActionParameters(action);
    expect(isValid).toBe(true);

    const invalidAction: BlockchainAction = {
      ...actionMetadata,
      transactionParameters: [],
      blockchainActionType: 'view',
    };
    const isInvalid = validateActionParameters(invalidAction);
    expect(isInvalid).toBe(false);
  });

  it('should get the blockchain action type', () => {
    const actionType = getBlockchainActionType(actionMetadata);
    expect(actionType).toBe('view');
  });

});

describe('Metadata Functions', () => {
  it('should return and false when metadata is invalid', () => {
    const metadataEleven: Metadata = {
      type: "action",
      icon: "https://ipfs.io/ipfs/bafybeifto4kwihaup53m5pzi4g7iuypm3oajj4rdcm6gywjvfcaqdh3zsm/10.png",
      title: "Sparkling Connector Token",
      description: "Mint a special NFT for Javier Salomon, who connects communities with the sparkle of Christmas.",
      actions: [
        {
          label: "NOT MINT",
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          contractABI: [],
          functionName: "mint",
          chainId: "avalanche",
          functionParamsValue: [0, "sender"],
          functionParamsLabel: ["ID", "To"] // Si hay functionParamsLabel me da error
        }
      ]
    };

    expect(isTransferActionMetadata(metadataEleven.actions[0])).toBe(false);
    expect(isBlockchainAction(metadataEleven.actions[0])).toBe(false);
  })

  it('should return metadata formatted', () => {
    const actions: TransferActionMetadata[] = [
      {
        label: "0.01 AVAX",
        recipientAddress: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 0.01,
        chainId: "avalanche",
      },
      {
        label: "1 AVAX",
        recipientAddress: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 1,
        chainId: "avalanche",
      },
      {
        label: "SENT",
        recipientAddress: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 1,
        chainId: "avalanche",
      },
      {
        label: "Test Action",
        chainId: "fuji",
        recipientAddress: "0x1234567890abcdef1234567890abcdef12345678",
        amount: 1000000000000000000,
      }
    ]

    const metadata: Metadata = {
      type: "action",
      icon: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM21kajk5ODVzMmV2bXUzNzN5dGluMWJsejNtN2ptejBqYnhxcjByZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5phvgzYzpqFL2N1lav/giphy.gif",
      title: "Sent me a tip",
      description: "Send me a tip to show your appreciation for my work",
      actions: actions
    };

    const formattedMetadata: ValidatedMetadata = {
      type: metadata.type,
      icon: metadata.icon,
      title: metadata.title,
      description: metadata.description,
      actions: actions
    };

    const m = createMetadata(metadata);
    expect(m).toEqual(formattedMetadata);
  });
})