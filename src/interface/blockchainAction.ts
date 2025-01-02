import { Abi, AbiStateMutability, AbiParameter } from "./index";
import { ContractFunctionName } from "./index";
import { ChainId } from "./chains";

// This interface is used for DEVs to define the metadata of a blockchain action
// Amount will be transfered to the contract
// be aware that the amount is in WEI
// be aware that the function should be payable in the contract
// be aware to have a mechanism to transfer that amount to the contract
export interface BlockchainActionMetadata {
  label: string;
  contractAddress: `0x${string}`;
  contractABI: Abi;
  functionName: ContractFunctionName;
  amount?: string; // Optional for DEVs to define the amount of the transaction - msg.value to be sent
  functionParamsLabel?: string[]; // Optional for DEVs to define the label of the parameters
  functionParamsValue?: (string | number | bigint | null | boolean)[]; // Optional for DEVs to define the value of the parameters
  chainId: ChainId;
}

// This interface is used internally to define the final blockchain action
export interface BlockchainAction extends BlockchainActionMetadata {
  transactionParameters: AbiParameter[];
  blockchainActionType: AbiStateMutability;
}











