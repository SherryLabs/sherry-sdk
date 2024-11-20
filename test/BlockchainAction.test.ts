import { describe, expect, it } from "@jest/globals";
import { BlockchainActionMetadata, 
  BlockchainAction, 
  getParameters, 
  getAbiFunction, 
  isValidFunction, 
  validateActionParameters, 
  getBlockchainActionType } from "../src/interfaces/BlockchainActionV2";
import { Metadata } from "../src/interfaces/MetadataV2";
import { createMetadata } from "../src/interfaces/BlockchainActionV2";

describe('BlockchainActionV2 Functions', () => {
  const exampleAbi = [
    {
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [{ name: 'balance', type: 'uint256' }],
    },
    {
      name: 'safeTransferFrom',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
      ],
      outputs: [],
    },
  ] as const

  const metadata: Metadata = {
    type: "action",
    icon: "icon",
    title: "title",
    description: "description",
    actions: [
      {
        label: "Test Action",
        contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
        contractABI: exampleAbi,
        functionName: "balanceOf",
        chainId: "ethereum"
      },
      {
        label: "Test Action 2",
        contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
        contractABI: exampleAbi,
        functionName: "balanceOf",
        chainId: "ethereum"
      }
    ]
  };

  const actionMetadata: BlockchainActionMetadata = {
    label: "Test Action",
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    contractABI: exampleAbi,
    functionName: "balanceOf",
    chainId: "ethereum",
  };

  console.log("metadata");
  const m: Metadata = createMetadata(metadata);
  console.log("metadata con createMetadata() : ", m);

  it.skip('should get parameters of a function', () => {
    const parameters = getParameters(actionMetadata);
    expect(parameters).toEqual([{ name: 'owner', type: 'address' }]);
  });

  it.skip('should get the ABI function', () => {
    const abiFunction = getAbiFunction(exampleAbi, "balanceOf");
    expect(abiFunction).toEqual({
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [{ name: 'balance', type: 'uint256' }],
    });
  });

  it.skip('should validate if a function exists in the ABI', () => {
    const isValid = isValidFunction(exampleAbi, "balanceOf");
    expect(isValid).toBe(true);

    const isInvalid = isValidFunction(exampleAbi, "nonExistentFunction");
    expect(isInvalid).toBe(false);
  });

  it.skip('should validate action parameters', () => {
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

  it.skip('should get the blockchain action type', () => {
    const actionType = getBlockchainActionType(actionMetadata);
    expect(actionType).toBe('view');
  });

  /*
  it.skip('should get the final blockchain action', () => {
    const finalAction = getFinalBlockchainAction(actionMetadata);
    expect(finalAction).toEqual({
      ...actionMetadata,
      blockchainActionType: 'view',
      transactionParameters: [],
    });
  });
  */

  /*
  it.skip('should throw an error if function is not found in ABI', () => {
    const invalidActionMetadata: BlockchainActionMetadata = {
      ...actionMetadata,
      functionName: "nonExistentFunction",
    };
    expect(() => getFinalBlockchainAction(invalidActionMetadata)).toThrowError(`Function nonExistentFunction not found in ABI`);
  });
  */
});