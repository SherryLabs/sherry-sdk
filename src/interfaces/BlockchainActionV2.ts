import { BlockchainParameter } from "./BlockchainParameter";
import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from "abitype";
import { ContractFunctionName, isAddress } from "viem";
import { ExtractAbiFunctionNames, ExtractAbiFunction } from "abitype";
import { ChainId } from "./Chains";
import { Metadata } from "./MetadataV2";
import { FunctionNotFoundError, InvalidAddress, NoActionDefinedError, ActionsNumberError } from "../errors/CustomErrors";

/*
  * Date: 17-11-2024:
  * By: Gilberts Ahumada
  * This code is under development in order to improve the blockchain action interface.
  * In order to facilitate the creation of blockchain actions, we are defining a new interface
  * and some utility functions to help with the validation of the blockchain action.
  * This file is used to define the metadata of a blockchain action and the final blockchain action
  * that will be executed. It also defines some utility functions to help with the validation of the
  * blockchain action.
  */

// This interface is used for DEVs to define the metadata of a blockchain action
export interface BlockchainActionMetadata {
  label: string;
  contractAddress: `0x${string}`;
  contractABI: Abi;
  functionName: ContractFunctionName;
  transactionParamsLabel?: string[];
  chainId: ChainId;
}

// This interface is used internally to define the final blockchain action
export interface BlockchainAction extends BlockchainActionMetadata {
  transactionParameters: AbiParameter[];
  blockchainActionType: AbiStateMutability;
}

export function getParameters(action: BlockchainActionMetadata): readonly AbiParameter[] {
  const abi: Abi = action.contractABI;
  const functionName: ContractFunctionName = action.functionName;

  const abiFunction = getAbiFunction(abi, functionName);

  const abiParameters: readonly AbiParameter[] = abiFunction!.inputs;
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
export function getFinalBlockchainAction(action: BlockchainActionMetadata): BlockchainAction {
  if (!isValidFunction(action.contractABI, action.functionName)) {
    throw new Error(`Function ${action.functionName} not found in ABI`);
  }

  const blockchainActionType = getBlockchainActionType(action);

  const finalMetadata: BlockchainAction = { ...action, blockchainActionType, transactionParameters: [] };
  return finalMetadata;
}
*/

/**
 * Function to validate the types of the blockchain action function declaration.
 * 
 * @template abi - The ABI of the contract.
 * @template functionName - The name of the function to call.
 * @template abiFunction - The ABI function type.
 * 
 * @param config - The configuration object for the blockchain action.
 * @param config.abi - The ABI of the contract.
 * @param config.functionName - The name of the function to call.
 * @param config.args - The arguments to pass to the function.
 * 
 * @returns A boolean indicating whether the types are valid.
 */
function validateBlockchainActionTypes<
  abi extends Abi,
  functionName extends ExtractAbiFunctionNames<abi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<abi, functionName>
>(
  config: {
    abi: abi;
    functionName: functionName | ExtractAbiFunctionNames<abi, 'pure' | 'view'>;
    action: BlockchainActionMetadata;

  }
): BlockchainAction {
  const params = getParameters(config.action);
  const action: BlockchainAction = {
    ...config.action,
    transactionParameters: [...params],
    blockchainActionType: getBlockchainActionType(config.action),
  }

  return action;
}

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

        console.log("params[i] : ", params[i]);
      }
    }

    console.log("params : ", params);

    const actionType = getBlockchainActionType(ac);

    //console.log("theType : ", actionType);

    const blAction: BlockchainAction = { ...ac, transactionParameters: [...params], blockchainActionType: actionType };

    //console.log("blAction : ", blAction);

    resultMetadata.actions.push(blAction);
  }

  return resultMetadata;
}








