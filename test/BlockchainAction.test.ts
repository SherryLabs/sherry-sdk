import { describe, expect, it } from "@jest/globals";
import {
  BlockchainActionMetadata,
  BlockchainAction,
  TransferAction,
} from "../src/interface/blockchainAction";
import { Metadata, ValidatedMetadata } from "../src/interface/metadata";
import {
  getParameters,
  getAbiFunction,
  isValidFunction,
  validateActionParameters,
  getBlockchainActionType,
  createMetadata,
  isTransferAction,
  isBlockchainAction,
  isBlockchainActionMetadata
} from "../src/utils/helpers";
import { simpleAbi } from "./abi";

describe('BlockchainAction Functions', () => {
  const exampleAbi = simpleAbi

  const actionMetadata: BlockchainActionMetadata = {
    label: "Test Action",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    abi: exampleAbi,
    functionName: "balanceOf",
    paramsValue: ["0x1234567890abcdef1234567890abcdef12345678"],
    chain: "fuji",
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
      params: [{ type: 'address' }],
      blockchainActionType: 'view',
    };

    const isValid = validateActionParameters(action);
    expect(isValid).toBe(true);

    const invalidAction: BlockchainAction = {
      ...actionMetadata,
      params: [],
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
      url: "google.com",
      icon: "https://ipfs.io/ipfs/bafybeifto4kwihaup53m5pzi4g7iuypm3oajj4rdcm6gywjvfcaqdh3zsm/10.png",
      title: "Sparkling Connector Token",
      description: "Mint a special NFT for Javier Salomon, who connects communities with the sparkle of Christmas.",
      actions: [
        {
          label: "NOT MINT",
          address: '0x1234567890abcdef1234567890abcdef12345678',
          abi: [],
          functionName: "mint",
          chain: "avalanche",
          paramsValue: [0, "sender"],
          paramsLabel: ["ID", "To"] // Si hay paramsLabel me da error
        }
      ]
    };

    expect(isTransferAction(metadataEleven.actions[0])).toBe(false);
    expect(isBlockchainActionMetadata(metadataEleven.actions[0])).toBe(true);
  })

  it('should return metadata formatted', () => {
    const actions: TransferAction[] = [
      {
        label: "0.01 AVAX",
        to: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 0.01,
        chain: "avalanche",
      },
      {
        label: "1 AVAX",
        to: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 1,
        chain: "avalanche",
      },
      {
        label: "SENT",
        to: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 1,
        chain: "avalanche",
      },
      {
        label: "Test Action",
        chain: "fuji",
        to: "0x1234567890abcdef1234567890abcdef12345678",
        amount: 1000000000000000000,
      }
    ]

    const metadata: Metadata = {
      type: "action",
      url: "google.com",
      icon: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM21kajk5ODVzMmV2bXUzNzN5dGluMWJsejNtN2ptejBqYnhxcjByZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5phvgzYzpqFL2N1lav/giphy.gif",
      title: "Sent me a tip",
      description: "Send me a tip to show your appreciation for my work",
      actions: actions
    };

    const formattedMetadata: ValidatedMetadata = {
      type: metadata.type,
      url: metadata.url,
      icon: metadata.icon,
      title: metadata.title,
      description: metadata.description,
      actions: actions
    };

    const m = createMetadata(metadata);
    expect(m).toEqual(formattedMetadata);
  });
})