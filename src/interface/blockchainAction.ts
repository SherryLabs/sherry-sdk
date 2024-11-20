import { Abi, AbiParameter, AbiStateMutability } from "./index";
import { ContractFunctionName } from "./index";
import { ChainId } from "./chains";

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









