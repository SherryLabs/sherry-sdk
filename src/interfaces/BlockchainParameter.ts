/**
 * @file BlockchainParameter.ts
 * @class BlockchainParameter
 * @description This file contains the interface for the BlockchainParameter object
 * @note We're about to stop using this interface in the future as long as we're using 
 * the AbiParameter from the abitype package to fetch the parameters of the function
 * from the ABI.
 * */
export interface BlockchainParameter {
    label: string;
    type: "string" | "uint256" | "boolean" | "address";
    value?: string | bigint | boolean;
}