import { BlockchainParameter } from "./BlockchainParameter";
import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from "abitype";
import { ContractFunctionName } from "viem";

export type ChainId = "Ethereum" | "Base" | "Optimism";

// This interface is used for DEVs to define the metadata of a blockchain action
export interface BlockchainActionMetadata {
  label: string;
  contractAddress: `0x${string}`;
  contractABI: Abi;
  functionName: ContractFunctionName;
  chainId: ChainId;
}

// This interface is used internally to define the final blockchain action
export interface BlockchainAction extends BlockchainActionMetadata {
  transactionParameters: BlockchainParameter[];
  blockchainActionType: AbiStateMutability;
  //functionName: string;
  //chainId: ChainId;
}

export function getParameters(action: BlockchainActionMetadata): readonly AbiParameter[] {
  const abi: Abi = action.contractABI;
  const functionName: ContractFunctionName = action.functionName;

  const abiFunction = getAbiFunction(abi, functionName);
  if (!abiFunction) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  const abiParameters: readonly AbiParameter[] = abiFunction.inputs;
  return abiParameters;
}

export function getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction | undefined {
  if (!isValidFunction(abi, functionName)) {
    return undefined;
  }
  return abi.find((item): item is AbiFunction => item.type === "function" && item.name === functionName);
}

export function isValidFunction(abi: Abi, functionName: ContractFunctionName): boolean {
  return abi.some((item): item is AbiFunction => item.type === "function" && item.name === functionName);
}

export function validateActionParameters(
  action: BlockchainAction
): boolean {
  const params = getParameters(action);
  return params.length === action.transactionParameters.length;
}

export function getBlockchainActionType(action: BlockchainActionMetadata) {
  const abiFunction: AbiFunction | undefined = getAbiFunction(action.contractABI, action.functionName);
  if (!abiFunction) {
    throw new Error(`Function ${action.functionName} not found in ABI`);
  }

  const blockAction: AbiStateMutability = abiFunction.stateMutability;
  return blockAction;
}

export function getFinalBlockchainAction(action: BlockchainActionMetadata): BlockchainAction {
  if (!isValidFunction(action.contractABI, action.functionName)) {
    throw new Error(`Function ${action.functionName} not found in ABI`);
  }

  const blockchainActionType = getBlockchainActionType(action);

  const finalMetadata: BlockchainAction = { ...action, blockchainActionType, transactionParameters: [] };
  return finalMetadata;
}






