import { BlockchainParameter } from "./BlockchainParameter";
import { Abi, AbiParameter } from "abitype";

export type ChainId = "ethereum" | "base" | "optimism" | "avalanche";

export interface BlockchainAction {
  label: string; // Button Label
  contractAddress: `0x${string}`;
  contractABI: Abi;
  functionName: string;
  blockchainActionType: "read" | "write";
  //transactionParameters: BlockchainParameter[];
  transactionParameters: AbiParameter[];
  chainId: ChainId;
  data?: any;
}