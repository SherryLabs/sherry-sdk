import { Metadata, BlockchainAction, BlockchainParameter } from "./interfaces";

interface AbiParameter {
  name: string;
  type: string;
}

interface AbiFunction {
  type: "function";
  name: string;
  inputs: AbiParameter[];
}

type ContractABI = AbiFunction[];

export function validateMetadata(metadata: Metadata): Metadata {
  metadata.actions.forEach((action) => {
    const { functionName, contractABI, transactionParameters } = action;
    validateActionFunction(functionName, contractABI);
    validateActionParameters(transactionParameters, functionName, contractABI);
  });
  return metadata;
}
function validateActionFunction(functionName: string, abi: ContractABI): void {
  const abiFunction = abi.find(
    (item) => item.type === "function" && item.name === functionName
  );

  if (!abiFunction) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }
}
function validateActionParameters(
  providedParams: BlockchainParameter[],
  functionName: string,
  abi: ContractABI
): void {
  const abiFunction = abi.find(
    (item) => item.type === "function" && item.name === functionName
  );

  if (!abiFunction) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  const abiParams = abiFunction.inputs;

  if (abiParams.length !== providedParams.length) {
    throw new Error(
      `Parameter count mismatch for function ${functionName}: expected ${abiParams.length}, but got ${providedParams.length}`
    );
  }

  abiParams.forEach((abiParam, index) => {
    const providedParam = providedParams[index];

    if (
      abiParam.name !== providedParam.label ||
      abiParam.type !== providedParam.type
    ) {
      throw new Error(
        `Parameter mismatch for function ${functionName}: expected ${abiParam.name} (${abiParam.type}), but got ${providedParam.label} (${providedParam.type})`
      );
    }
  });
}
