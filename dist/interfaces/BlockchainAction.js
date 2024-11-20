"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParameters = getParameters;
exports.getAbiFunction = getAbiFunction;
exports.isValidFunction = isValidFunction;
exports.validateActionParameters = validateActionParameters;
exports.getBlockchainActionType = getBlockchainActionType;
exports.createMetadata = createMetadata;
const viem_1 = require("viem");
const CustomErrors_1 = require("../errors/CustomErrors");
function getParameters(action) {
    const abi = action.contractABI;
    const functionName = action.functionName;
    const abiFunction = getAbiFunction(abi, functionName);
    // Crear una copia profunda de los parámetros del ABI
    const abiParameters = abiFunction.inputs.map(param => (Object.assign({}, param)));
    return abiParameters;
}
function getAbiFunction(abi, functionName) {
    const abiFunction = abi.find((item) => item.type === "function" && item.name === functionName);
    if (!abiFunction) {
        throw new CustomErrors_1.FunctionNotFoundError(functionName);
    }
    return abiFunction;
}
function isValidFunction(abi, functionName) {
    return abi.some((item) => item.type === "function" && item.name === functionName);
}
function validateActionParameters(action) {
    const params = getParameters(action);
    return params.length === action.transactionParameters.length;
}
function getBlockchainActionType(action) {
    const abiFunction = getAbiFunction(action.contractABI, action.functionName);
    if (!abiFunction) {
        throw new Error(action.functionName);
    }
    const blockAction = abiFunction.stateMutability;
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
function createMetadata(metadata) {
    validateMetadata(metadata);
    const originalActions = [...metadata.actions];
    const processedActions = originalActions.map(processAction);
    return Object.assign(Object.assign({}, metadata), { actions: processedActions });
}
function validateMetadata(metadata) {
    if (metadata.actions.length === 0) {
        throw new CustomErrors_1.NoActionDefinedError();
    }
    if (metadata.actions.length > 4) {
        throw new CustomErrors_1.ActionsNumberError(metadata.actions.length);
    }
    for (const action of metadata.actions) {
        if (!(0, viem_1.isAddress)(action.contractAddress)) {
            throw new CustomErrors_1.InvalidAddress(action.contractAddress);
        }
    }
}
function processAction(action) {
    var _a;
    const fnc = getAbiFunction(action.contractABI, action.functionName);
    if (!fnc) {
        throw new CustomErrors_1.FunctionNotFoundError(action.functionName);
    }
    const params = getParameters(action);
    if (action.functionParamsLabel) {
        for (let i = 0; i < params.length; i++) {
            if (params[i]) {
                params[i].name = (_a = action.functionParamsLabel[i]) !== null && _a !== void 0 ? _a : (params[i].name || "");
            }
        }
    }
    const actionType = getBlockchainActionType(action);
    return Object.assign(Object.assign({}, action), { transactionParameters: [...params], blockchainActionType: actionType });
}
