import { describe, expect, it } from "@jest/globals";
import { Abi } from "abitype";
import { BlockchainActionMetadata, BlockchainAction, getParameters, getAbiFunction, isValidFunction, validateActionParameters, getBlockchainActionType, getFinalBlockchainAction } from "../src/interfaces/BlockchainActionV2";
import { Metadata } from "../src/interfaces/Metadata";
import { readContract } from "../src/interfaces/BlockchainActionV2";

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

  const metadata: Metadata<"action", typeof exampleAbi> = {
    type: "action",
    icon: "icon",
    title: "title",
    description: "description",
    label: "label",
    actions: [
      {
        label: "Test Action",
        contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
        contractABI: exampleAbi,
        functionName: "safeTransferFrom",
        chainId: "ethereum"
      }
    ]
  };

  const actionMetadata: BlockchainActionMetadata = {
    label: "Test Action",
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    contractABI: exampleAbi,
    functionName: "balanceOf",
    chainId: "Ethereum",
  };

  it('should get parameters of a function', () => {
    // Only Readable Actions
    const res = readContract({
      abi: exampleAbi,
      functionName: 'balanceOf',
      args: ['0x'],
    })

  })

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
      transactionParameters: [{ label: 'owner', type: 'address' }],
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

  it('should get the final blockchain action', () => {
    const finalAction = getFinalBlockchainAction(actionMetadata);
    expect(finalAction).toEqual({
      ...actionMetadata,
      blockchainActionType: 'view',
      transactionParameters: [],
    });
  });

  it('should throw an error if function is not found in ABI', () => {
    const invalidActionMetadata: BlockchainActionMetadata = {
      ...actionMetadata,
      functionName: "nonExistentFunction",
    };
    expect(() => getFinalBlockchainAction(invalidActionMetadata)).toThrowError(`Function nonExistentFunction not found in ABI`);
  });
});