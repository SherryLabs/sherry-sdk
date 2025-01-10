import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from "../index";
import { ContractFunctionName, isAddress } from "../index";
import { Metadata, ValidatedMetadata } from "../interface/metadata";
import {
  FunctionNotFoundError,
  InvalidAddress,
  NoActionDefinedError,
  ActionsNumberError,
  InvalidTransactionParameters
} from "./customErrors";
import {
  BlockchainActionMetadata,
  BlockchainAction,
  TransferActionMetadata
} from "../interface/blockchainAction";

/**
 * Gets the parameters of a function in the ABI.
 * 
 * @param {BlockchainActionMetadata} action - The blockchain action.
 * @returns {AbiParameter[]} - The function parameters.
 */
export function getParameters(action: BlockchainActionMetadata): AbiParameter[] {
  const abi: Abi = action.contractABI;
  const functionName: ContractFunctionName = action.functionName;

  const abiFunction = getAbiFunction(abi, functionName);

  // Create a deep copy of the ABI parameters
  const abiParameters: AbiParameter[] = abiFunction!.inputs.map(param => ({ ...param }));
  return abiParameters;
}

/**
 * Gets a function from the ABI by its name.
 * 
 * @param {Abi} abi - The contract ABI.
 * @param {ContractFunctionName} functionName - The function name.
 * @returns {AbiFunction} - The ABI function.
 * @throws {FunctionNotFoundError} - If the function is not found in the ABI.
 */
export function getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction {
  const abiFunction = abi.find((item): item is AbiFunction => item.type === "function" && item.name === functionName);
  if (!abiFunction) {
    throw new FunctionNotFoundError(functionName);
  }
  return abiFunction;
}

/**
 * Checks if a function exists in the ABI.
 * 
 * @param {Abi} abi - The contract ABI.
 * @param {ContractFunctionName} functionName - The function name.
 * @returns {boolean} - True if the function exists in the ABI, false otherwise.
 */
export function isValidFunction(abi: Abi, functionName: ContractFunctionName): boolean {
  return abi.some((item): item is AbiFunction => item.type === "function" && item.name === functionName);
}

/**
 * Validates the parameters of a blockchain action.
 * 
 * @param {BlockchainAction} action - The blockchain action.
 * @returns {boolean} - True if the parameter lengths match, false otherwise.
 */
export function validateActionParameters(action: BlockchainAction): boolean {
  const params = getParameters(action);
  return params.length === action.transactionParameters.length;
}

/**
 * Gets the state mutability type of a function in the ABI.
 * 
 * @param {BlockchainActionMetadata} action - The blockchain action.
 * @returns {AbiStateMutability} - The state mutability type of the function.
 * @throws {Error} - If the function is not found in the ABI.
 */
export function getBlockchainActionType(action: BlockchainActionMetadata): AbiStateMutability {
  const abiFunction: AbiFunction | undefined = getAbiFunction(action.contractABI, action.functionName);
  if (!abiFunction) {
    throw new Error(action.functionName);
  }

  const blockAction: AbiStateMutability = abiFunction.stateMutability;
  return blockAction;
}

/**
 * Creates the validated metadata for a mini app.
 * 
 * @param {Metadata} metadata - The mini app metadata.
 * @returns {ValidatedMetadata} - The validated metadata with processed actions.
 * @throws {NoActionDefinedError} - If no actions are defined.
 * @throws {ActionsNumberError} - If more than 4 actions are defined.
 * @throws {InvalidAddress} - If an invalid address is provided.
 */
export function createMetadata(metadata: Metadata): ValidatedMetadata {
  validateMetadata(metadata);

  const originalActions = [...metadata.actions];
  const processedActions: (BlockchainAction | TransferActionMetadata)[] = originalActions.map(action => {
    if (isBlockchainActionMetadata(action)) {
      return processAction(action);
    } else if (isTransferActionMetadata(action)) {
      return action;
    } else {
      throw new Error("Invalid action type");
    }
  });

  return { ...metadata, actions: processedActions };
}

/**
 * Validates the metadata of a mini app.
 * 
 * @param {Metadata} metadata - The mini app metadata.
 * @throws {NoActionDefinedError} - If no actions are defined.
 * @throws {ActionsNumberError} - If more than 4 actions are defined.
 * @throws {InvalidAddress} - If an invalid address is provided.
 */
function validateMetadata(metadata: Metadata): void {
  if (metadata.actions.length === 0) {
    throw new NoActionDefinedError();
  }

  if (metadata.actions.length > 4) {
    throw new ActionsNumberError(metadata.actions.length);
  }

  for (const action of metadata.actions) {
    if (isBlockchainActionMetadata(action)) {
      if (!isAddress(action.contractAddress)) {
        throw new InvalidAddress(action.contractAddress);
      }
    }
  }
}

/**
 * Processes a blockchain action.
 * 
 * @param {BlockchainActionMetadata} action - The blockchain action.
 * @returns {BlockchainAction} - The processed action.
 * @throws {FunctionNotFoundError} - If the function is not found in the ABI.
 */
function processAction(action: BlockchainActionMetadata): BlockchainAction {
  const fnc = getAbiFunction(action.contractABI, action.functionName);
  if (!fnc) {
    throw new FunctionNotFoundError(action.functionName);
  }

  const params: AbiParameter[] = getParameters(action).map(param => ({ ...param })); // Create a mutable copy

  if (action.functionParamsLabel) {
    replaceParameterNames(params, action.functionParamsLabel);
  }

  const actionType = getBlockchainActionType(action);

  return { ...action, transactionParameters: params, blockchainActionType: actionType };
}

/**
 * Replace param names in tuples
 * @params {AbiParameter[]} params - Array of parameters
 * @params {string[]} labels - Array of names
 */
function replaceParameterNames(params: AbiParameter[], labels: string[]): void {
  for (let i = 0; i < params.length; i++) {
    if (params[i]) {
      const tupleParam = isTupleType(params[i]!);

      if (tupleParam) {
        replaceParameterNames(tupleParam.components, labels);
      } else {
        params[i]!.name = labels[i] ?? (params[i]!.name || "");
      }
    } else {
      throw new InvalidTransactionParameters();
    }
  }
}

/**
 * Checks if an `AbiParameter` is of type `tuple` or `tuple[]` and has components.
 * 
 * @param {AbiParameter} param - The ABI parameter.
 * @returns {AbiParameter & { components: AbiParameter[] } | null} - The parameter with components if it is of type `tuple` or `tuple[]`, otherwise `null`.
 */
function isTupleType(param: AbiParameter): (AbiParameter & { components: AbiParameter[] }) | null {
  if ((param.type === 'tuple' || param.type === 'tuple[]') && 'components' in param) {
    return param as AbiParameter & { components: AbiParameter[] };
  }
  return null;
}

/**
 * Validates that an object conforms to the types of `ValidatedMetadata`.
 * 
 * @param {any} obj - The object to validate.
 * @returns {boolean} - True if the object conforms to the types of `ValidatedMetadata`, false otherwise.
 */
export function isValidValidatedMetadata(obj: any): obj is ValidatedMetadata {
  if (typeof obj !== 'object' || obj === null) return false;
  if (!Array.isArray(obj.actions)) return false;
  for (const action of obj.actions) {
    if (!Array.isArray(action.transactionParameters)) return false;
    if (typeof action.blockchainActionType !== 'string') return false;
  }
  return true;
}

/**
 * Type guard to check if an object is of type `BlockchainActionMetadata`.
 * 
 * @param obj - The object to check.
 * @returns `true` if the object is of type `BlockchainActionMetadata`, otherwise `false`.
 */
export function isBlockchainActionMetadata(obj: any): obj is BlockchainActionMetadata {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.label === 'string' &&
    typeof obj.contractAddress === 'string' &&
    typeof obj.contractABI === 'object' &&
    typeof obj.functionName === 'string' &&
    typeof obj.chainId === 'string'
  );
}


/**
 * Type guard to check if an object is of type `BlockchainAction`.
 * 
 * @param obj - The object to check.
 * @returns `true` if the object is of type `BlockchainAction`, otherwise `false`.
 */
export function isBlockchainAction(obj: any): obj is BlockchainAction {
  return (
    Array.isArray(obj.transactionParameters) &&
    obj.transactionParameters.every((param: any) => typeof param === 'object') &&
    typeof obj.blockchainActionType === 'string'
  );
}

/**
 * Type guard to check if an object is of type `TransferActionMetadata`.
 * 
 * @param obj - The object to check.
 * @returns `true` if the object is of type `TransferActionMetadata`, otherwise `false`.
 */
export function isTransferActionMetadata(obj: any): obj is TransferActionMetadata {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.label === 'string' &&
    (typeof obj.recipientAddress === 'undefined' || typeof obj.recipientAddress === 'string') &&
    (typeof obj.amount === 'undefined' || typeof obj.amount === 'number') &&
    typeof obj.chainId === 'string' &&
    typeof obj.contractABI === 'undefined' &&
    typeof obj.functionName === 'undefined' &&
    typeof obj.functionParamsValue === 'undefined' &&
    typeof obj.functionParamsLabel === 'undefined'
  );
}

