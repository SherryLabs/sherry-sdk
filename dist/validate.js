"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMetadata = void 0;
function validateMetadata(metadata) {
    metadata.actions.forEach((action) => {
        const { functionName, contractABI, transactionParameters } = action;
        validateActionFunction(functionName, contractABI);
        validateActionParameters(transactionParameters, functionName, contractABI);
    });
    return metadata;
}
exports.validateMetadata = validateMetadata;
function validateActionFunction(functionName, abi) {
    const abiFunction = abi.find((item) => item.type === "function" && item.name === functionName);
    if (!abiFunction) {
        throw new Error(`Function ${functionName} not found in ABI`);
    }
}
function validateActionParameters(providedParams, functionName, abi) {
    const abiFunction = abi.find((item) => item.type === "function" && item.name === functionName);
    if (!abiFunction) {
        throw new Error(`Function ${functionName} not found in ABI`);
    }
    const abiParams = abiFunction.inputs;
    if (abiParams.length !== providedParams.length) {
        throw new Error(`Parameter count mismatch for function ${functionName}: expected ${abiParams.length}, but got ${providedParams.length}`);
    }
    abiParams.forEach((abiParam, index) => {
        const providedParam = providedParams[index];
        if (abiParam.name !== providedParam.label ||
            abiParam.type !== providedParam.type) {
            throw new Error(`Parameter mismatch for function ${functionName}: expected ${abiParam.name} (${abiParam.type}), but got ${providedParam.label} (${providedParam.type})`);
        }
    });
}
