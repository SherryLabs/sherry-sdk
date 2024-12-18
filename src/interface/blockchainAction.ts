import { Abi, AbiStateMutability, AbiParameter } from "./index";
import { ContractFunctionName } from "./index";
import { ChainId } from "./chains";

// This interface is used for DEVs to define the metadata of a blockchain action
export interface BlockchainActionMetadata {
  label: string;
  contractAddress: `0x${string}`;
  contractABI: Abi;
  functionName: ContractFunctionName;
  functionParamsLabel?: string[]; // Optional for DEVs to define the label of the parameters
  functionParamsValue?: (string | number | BigInt | null | boolean)[]; // Optional for DEVs to define the value of the parameters
  chainId: ChainId;
}

// This interface is used internally to define the final blockchain action
export interface BlockchainAction extends BlockchainActionMetadata {
  transactionParameters: AbiParameter[];
  blockchainActionType: AbiStateMutability;
}











