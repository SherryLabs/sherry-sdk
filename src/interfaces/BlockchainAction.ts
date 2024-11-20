import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from "abitype";
import { ContractFunctionName, isAddress } from "viem";
import { ChainId } from "./Chains";
import { Metadata } from "./Metadata";
import { FunctionNotFoundError, InvalidAddress, NoActionDefinedError, ActionsNumberError } from "../errors/CustomErrors";


// This interface is used for DEVs to define the metadata of a blockchain action
export interface BlockchainActionMetadata {
  label: string;
  contractAddress: `0x${string}`;
  contractABI: Abi;
  functionName: ContractFunctionName;
  functionParamsLabel?: string[];
  chainId: ChainId;
}

// This interface is used internally to define the final blockchain action
export interface BlockchainAction extends BlockchainActionMetadata {
  transactionParameters: AbiParameter[];
  blockchainActionType: AbiStateMutability;
}

export function getParameters(action: BlockchainActionMetadata): AbiParameter[] {
  const abi: Abi = action.contractABI;
  const functionName: ContractFunctionName = action.functionName;

  const abiFunction = getAbiFunction(abi, functionName);

  // Crear una copia profunda de los parámetros del ABI
  const abiParameters: AbiParameter[] = abiFunction!.inputs.map(param => ({ ...param }));
  return abiParameters;
}

export function getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction {
  const abiFunction = abi.find((item): item is AbiFunction => item.type === "function" && item.name === functionName);
  if (!abiFunction) {
    throw new FunctionNotFoundError(functionName);
  }
  return abiFunction;
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
    throw new Error(action.functionName);
  }

  const blockAction: AbiStateMutability = abiFunction.stateMutability;
  return blockAction;
}

/*
export function createMetadata(metadata: Metadata): Metadata {
  if (metadata.actions.length === 0) {
    throw new NoActionDefinedError();
  }

  if (metadata.actions.length > 4) {
    throw new ActionsNumberError(metadata.actions.length);
  }

  for (const ac of metadata.actions) {
    if (!isAddress(ac.contractAddress)) {
      throw new InvalidAddress(ac.contractAddress);
    }
  }

  // Create a copy of the metadata to avoid reference issues
  const originalActions = [...metadata.actions];
  let resultMetadata: Metadata = { ...metadata, actions: [] };

  for (const ac of originalActions) {
    const fnc = getAbiFunction(ac.contractABI, ac.functionName);
    if (!fnc) {
      throw new FunctionNotFoundError(ac.functionName);
    }

    const params: readonly AbiParameter[] = getParameters(ac);

    const paramsLength = params.length;

    if (params.length > 0) {
      for (let i = 0; i < paramsLength; i++) {
        if (ac.transactionParamsLabel) {
          if (params[i]) {
            params[i]!.name = ac.transactionParamsLabel[i] ?? (params[i]!.name || "");
          }
        }
      }
    }


    const actionType = getBlockchainActionType(ac);
    const blAction: BlockchainAction = { ...ac, transactionParameters: [...params], blockchainActionType: actionType };
    resultMetadata.actions.push(blAction);
  }

  return resultMetadata;
}
  */

export function createMetadata(metadata: Metadata): Metadata {
  validateMetadata(metadata);

  const originalActions = [...metadata.actions];
  const processedActions = originalActions.map(processAction);

  return { ...metadata, actions: processedActions };
}

function validateMetadata(metadata: Metadata): void {
  if (metadata.actions.length === 0) {
    throw new NoActionDefinedError();
  }

  if (metadata.actions.length > 4) {
    throw new ActionsNumberError(metadata.actions.length);
  }

  for (const action of metadata.actions) {
    if (!isAddress(action.contractAddress)) {
      throw new InvalidAddress(action.contractAddress);
    }
  }
}

function processAction(action: BlockchainActionMetadata): BlockchainAction {
  const fnc = getAbiFunction(action.contractABI, action.functionName);
  if (!fnc) {
    throw new FunctionNotFoundError(action.functionName);
  }

  const params: readonly AbiParameter[] = getParameters(action);

  if (action.functionParamsLabel) {
    for (let i = 0; i < params.length; i++) {
      if (params[i]) {
        params[i]!.name = action.functionParamsLabel[i] ?? (params[i]!.name || "");
      }
    }
  }

  const actionType = getBlockchainActionType(action);
  return { ...action, transactionParameters: [...params], blockchainActionType: actionType };
}








