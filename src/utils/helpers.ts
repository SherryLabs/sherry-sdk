import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from "../index";
import { ContractFunctionName, isAddress } from "../index";
import { Metadata, ValidatedMetadata } from "../interface/metadata";
import {
  FunctionNotFoundError,
  InvalidAddress,
  NoActionDefinedError,
  ActionsNumberError,
  Invalidparams,
  InvalidMetadataError
} from "./customErrors";
import {
  BlockchainActionMetadata,
  BlockchainAction,
  TransferAction
} from "../interface/blockchainAction";
import { Chain } from "../interface/chains";

/**
 * Gets the parameters of a function in the ABI.
 * 
 * @param {BlockchainActionMetadata} action - The blockchain action.
 * @returns {AbiParameter[]} - The function parameters.
 */
export function getParameters(action: BlockchainActionMetadata): AbiParameter[] {
  const abi: Abi = action.abi;
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
  return params.length === action.params.length;
}

/**
 * Gets the state mutability type of a function in the ABI.
 * 
 * @param {BlockchainActionMetadata} action - The blockchain action.
 * @returns {AbiStateMutability} - The state mutability type of the function.
 * @throws {Error} - If the function is not found in the ABI.
 */
export function getBlockchainActionType(action: BlockchainActionMetadata): AbiStateMutability {
  const abiFunction: AbiFunction | undefined = getAbiFunction(action.abi, action.functionName);
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
  const processedActions: (BlockchainAction | TransferAction)[] = originalActions.map(action => {
    if (isBlockchainActionMetadata(action)) {
      return processAction(action);
    } else if (isTransferAction(action)) {
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
 * @param {Metadata} metadata - The mini app metadata to validate.
 * @throws {NoActionDefinedError} - If no actions are defined.
 * @throws {ActionsNumberError} - If more than 4 actions are defined.
 * @throws {InvalidAddress} - If an invalid address is provided.
 * @throws {InvalidMetadataError} - If metadata is invalid.
 * @returns {void}
 */
function validateMetadata(metadata: Metadata): void {
  // Check if metadata exists and is an object
  if (!metadata || typeof metadata !== 'object') {
      throw new InvalidMetadataError('Metadata must be a valid object');
  }

  // Check required metadata properties
  if (typeof metadata.type !== 'string' || metadata.type !== 'action') {
      throw new InvalidMetadataError('Metadata type must be "action"');
  }

  if (typeof metadata.icon !== 'string' || !metadata.icon) {
      throw new InvalidMetadataError('Metadata must have a valid icon URL');
  }

  if (typeof metadata.title !== 'string' || !metadata.title) {
      throw new InvalidMetadataError('Metadata must have a title');
  }

  if (typeof metadata.description !== 'string' || !metadata.description) {
      throw new InvalidMetadataError('Metadata must have a description');
  }

  // Validate actions array
  if (!Array.isArray(metadata.actions)) {
      throw new NoActionDefinedError();
  }

  if (metadata.actions.length === 0) {
      throw new NoActionDefinedError();
  }

  if (metadata.actions.length > 4) {
      throw new ActionsNumberError(metadata.actions.length);
  }

  // Validate each action
  metadata.actions.forEach((action, index) => {
      // Check if action is either BlockchainActionMetadata or TransferAction
      if (!isBlockchainActionMetadata(action) && !isTransferAction(action)) {
          throw new InvalidMetadataError(`Invalid action at index ${index}`);
      }

      // Validate addresses in actions
      if ('address' in action && !isAddress(action.address)) {
          throw new InvalidAddress(action.address);
      }

      if ('to' in action && action.to && !isAddress(action.to)) {
          throw new InvalidAddress(action.to);
      }

      if (!isValidChain(action.chain)) {
          throw new InvalidMetadataError(`Invalid chain in action at index ${index}`);
      }
  });
}

export const helperValidateMetadata = (json: string): {
  isValid: boolean;
  type: "Metadata" | "ValidatedMetadata" | "Invalid";
  data?: Metadata | ValidatedMetadata;
} => {
  try {
    if (isValidatedMetadata(json)) {
      return {
        isValid: true,
        type: "ValidatedMetadata",
        data: json as ValidatedMetadata
      };
    } if (isMetadata(json)) {
      return {
        isValid: true,
        type: "Metadata",
        data: json as Metadata
      };
    }

    return {
      isValid: false,
      type: "Invalid"
    };
  } catch (error) {
    return {
      isValid: false,
      type: "Invalid"
    };
  }
};

/**
 * Processes a blockchain action.
 * 
 * @param {BlockchainActionMetadata} action - The blockchain action.
 * @returns {BlockchainAction} - The processed action.
 * @throws {FunctionNotFoundError} - If the function is not found in the ABI.
 */
function processAction(action: BlockchainActionMetadata): BlockchainAction {
  const fnc = getAbiFunction(action.abi, action.functionName);
  if (!fnc) {
    throw new FunctionNotFoundError(action.functionName);
  }

  const params: AbiParameter[] = getParameters(action).map(param => ({ ...param })); // Create a mutable copy

  if (action.paramsLabel) {
    replaceParameterNames(params, action.paramsLabel);
  }

  const actionType = getBlockchainActionType(action);

  return { ...action, params: params, blockchainActionType: actionType };
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
      throw new Invalidparams();
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
    if (!Array.isArray(action.params)) return false;
    if (typeof action.blockchainActionType !== 'string') return false;
  }
  return true;
}



export function isBlockchainActionMetadata(action: any): action is BlockchainActionMetadata {
  return (
    action &&
    typeof action === "object" &&
    typeof action.label === "string" &&
    typeof action.address === "string" &&
    Array.isArray(action.abi) &&
    typeof action.functionName === "string" &&
    typeof action.chain === "string"
  );
}

export function isBlockchainAction(action: any): action is BlockchainAction {
  return (
    action &&
    typeof action === "object" &&
    typeof action.label === "string" &&
    typeof action.address === "string" &&
    action.address.startsWith("0x") && action.address.length === 42 &&
    Array.isArray(action.abi) &&
    typeof action.functionName === "string" &&
    isValidChain(action.chain) &&
    (action.amount === undefined || typeof action.amount === "number") &&
    (action.paramsLabel === undefined ||
      (Array.isArray(action.paramsLabel) &&
        action.paramsLabel.every((label: any) => typeof label === "string"))) &&
    (action.paramsValue === undefined ||
      (Array.isArray(action.paramsValue) &&
        action.paramsValue.every((value: any) =>
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "bigint" ||
          value === null ||
          typeof value === "boolean"))) &&
    Array.isArray(action.params) &&
    action.params.every((param: any) =>
      typeof param === "object" &&
      typeof param.type === "string") &&
    typeof action.blockchainActionType === "string"
  );
}

export function isTransferAction(action: any): action is TransferAction {
  // First check if it has BlockchainActionMetadata specific properties
  if (action.abi !== undefined ||
    action.functionName !== undefined ||
    action.paramsValue !== undefined ||
    action.paramsLabel !== undefined) {
    return false;
  }

  // Then check TransferAction properties
  if (!action || typeof action !== 'object') return false;
  if (typeof action.label !== 'string') return false;
  if (!isValidChain(action.chain)) return false;
  if (action.to !== undefined && (typeof action.to !== 'string' || !action.to.startsWith('0x'))) return false;
  if (action.amount !== undefined && typeof action.amount !== 'number') return false;

  return true;
}

export function isMetadata(json: any): json is Metadata {
  return (
    json &&
    typeof json === "object" &&
    typeof json.type === "string" &&
    typeof json.icon === "string" &&
    typeof json.title === "string" &&
    typeof json.description === "string" &&
    Array.isArray(json.actions) &&
    json.actions.every((action: any) =>
      isBlockchainActionMetadata(action) || isTransferAction(action)
    )
  );
}

export function isValidatedMetadata(json: any): json is ValidatedMetadata {
  return (
    json &&
    typeof json === "object" &&
    typeof json.type === "string" &&
    typeof json.icon === "string" &&
    typeof json.title === "string" &&
    typeof json.description === "string" &&
    Array.isArray(json.actions) &&
    json.actions.every((action: any) => isBlockchainAction(action))
  );
}

const isValidChain = (chain: any): chain is Chain => {
  return typeof chain === "string" && [
    "avalanche",
    "fuji",
    "celo",
    "alfajores"
  ].includes(chain);
};

