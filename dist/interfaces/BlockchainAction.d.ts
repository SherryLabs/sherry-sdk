import { Abi, AbiFunction, AbiParameter, AbiStateMutability } from "abitype";
import { ContractFunctionName } from "viem";
import { ChainId } from "./Chains";
import { Metadata } from "./Metadata";
export interface BlockchainActionMetadata {
    label: string;
    contractAddress: `0x${string}`;
    contractABI: Abi;
    functionName: ContractFunctionName;
    functionParamsLabel?: string[];
    chainId: ChainId;
}
export interface BlockchainAction extends BlockchainActionMetadata {
    transactionParameters: AbiParameter[];
    blockchainActionType: AbiStateMutability;
}
export declare function getParameters(action: BlockchainActionMetadata): AbiParameter[];
export declare function getAbiFunction(abi: Abi, functionName: ContractFunctionName): AbiFunction;
export declare function isValidFunction(abi: Abi, functionName: ContractFunctionName): boolean;
export declare function validateActionParameters(action: BlockchainAction): boolean;
export declare function getBlockchainActionType(action: BlockchainActionMetadata): AbiStateMutability;
export declare function createMetadata(metadata: Metadata): Metadata;
