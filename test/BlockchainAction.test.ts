import { describe, expect, it } from "@jest/globals";
import {
  BlockchainActionMetadata,
  BlockchainAction,
} from "../src/interface/blockchainAction";
import {
  getParameters,
  getAbiFunction,
  isValidFunction,
  validateActionParameters,
  getBlockchainActionType
} from "../src/utils/helpers";
import { simpleAbi } from "./abi";

describe('BlockchainAction Functions', () => {
  const exampleAbi = simpleAbi

  const actionMetadata: BlockchainActionMetadata = {
    label: "Test Action",
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    contractABI: exampleAbi,
    functionName: "balanceOf",
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