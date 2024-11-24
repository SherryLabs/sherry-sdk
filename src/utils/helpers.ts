import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from "../index";
import { ContractFunctionName, isAddress } from "../index";
import { Metadata, ValidatedMetadata } from "../interface/metadata";
import {
  FunctionNotFoundError,
  InvalidAddress,
  NoActionDefinedError,
  ActionsNumberError
} from "./customErrors";
import { BlockchainActionMetadata, BlockchainAction } from "../interface/blockchainAction";

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

export function createMetadata(metadata: Metadata): ValidatedMetadata {
  validateMetadata(metadata);

  const originalActions = [...metadata.actions];
  const processedActions: BlockchainAction[] = originalActions.map(processAction);

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

  const params: AbiParameter[] = getParameters(action).map(param => ({ ...param })); // Crear una copia mutable
  const transactionParameters: AbiParameter[] = params;

  if (action.functionParamsLabel) {
    for (let i = 0; i < params.length; i++) {
      if (params[i]) {
        params[i]!.name = action.functionParamsLabel[i] ?? (params[i]!.name || "");
      }
    }
  }

  const actionType = getBlockchainActionType(action);

  let finalAction: BlockchainAction = {
    label: action.label,
    contractAddress: action.contractAddress,
    contractABI: action.contractABI,
    functionName: action.functionName,
    functionParamsLabel: action.functionParamsLabel,
    chainId: action.chainId,
    transactionParameters,
    blockchainActionType: actionType
  }
  //return { ...action, transactionParameters, blockchainActionType: actionType };
  return finalAction;
}