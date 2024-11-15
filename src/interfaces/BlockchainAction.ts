import { BlockchainParameter } from "./BlockchainParameter";

export type ChainId = "Ethereum" | "Base" | "Optimism";

export interface BlockchainAction {
  label: string;
  contractAddress: `0x${string}`;
  contractABI: any;
  transactionParameters: BlockchainParameter[];
  blockchainActionType: "read" | "write";
  functionName: string;
  chainId: ChainId;
  data?: any;
}