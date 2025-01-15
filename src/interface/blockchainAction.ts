import { Abi, AbiStateMutability, AbiParameter } from "./index";
import { ContractFunctionName } from "./index";
import { Chain } from "./chains";

// This interface is used for DEVs to define the metadata of a blockchain action
// Amount will be transfered to the contract
// be aware that the amount is in WEI
// be aware that the function should be payable in the contract
// be aware to have a mechanism to transfer that amount to the contract
export interface BlockchainActionMetadata {
  label: string;
  address: `0x${string}`;
  abi: Abi;
  functionName: ContractFunctionName;
  amount?: number; // Optional for DEVs to define the amount of the transaction - msg.value to be sent
  paramsLabel?: string[]; // Optional for DEVs to define the label of the parameters
  paramsValue?: (string | number | bigint | null | boolean)[]; // Optional for DEVs to define the value of the parameters
  chain: Chain;
}

// This interface is used internally to define the final blockchain action
export interface BlockchainAction extends BlockchainActionMetadata {
  params: AbiParameter[];
  blockchainActionType: AbiStateMutability;
}

export interface TransferAction {
  label: string;
  to?: `0x${string}`;
  amount?: number;
  chain: Chain;
}











