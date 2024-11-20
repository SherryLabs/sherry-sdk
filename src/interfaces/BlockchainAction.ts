import { Abi, AbiFunction, AbiParametersToPrimitiveTypes, ExtractAbiFunctionNames } from "abitype";
import { ExtractAbiFunction } from "abitype";
import { ChainId } from "./Chains";

/**
 * Interface representing a blockchain action.
 * 
 * This interface is used to define the structure of a blockchain action, including
 * the contract address, ABI, function name, and chain ID. It ensures that the 
 * function name is valid within the provided ABI.
 * 
 * @template ContractABI - The ABI of the contract. This should extend the `Abi` type.
 */
export interface BlockchainAction<ContractABI extends Abi> {
  /**
   * The label for the action, typically used for display purposes.
   */
  label: string;

  /**
   * The address of the contract on the blockchain.
   * This should be a valid Ethereum address.
   */
  contractAddress: `0x${string}`;

  /**
   * The ABI (Application Binary Interface) of the contract.
   * This defines the functions and events that the contract exposes.
   */
  contractABI: ContractABI;

  /**
   * The name of the function to be called on the contract.
   * This must be a valid function name within the provided ABI and can be of type
   * 'pure', 'view', 'payable', or 'nonpayable'.
   */
  functionName: ExtractAbiFunctionNames<ContractABI, 'pure' | 'view' | 'payable' | 'nonpayable'>;

  /**
   * The ID of the blockchain chain where the contract is deployed.
   * This helps in identifying the correct network (e.g., Ethereum, Base, Optimism).
   */
  chainId: ChainId;
}
/**
 * Function to perform a blockchain action.
 * 
 * @template abi - The ABI of the contract.
 * @template functionName - The name of the function to call.
 * @template abiFunction - The ABI function type.
 * 
 * @param config - The configuration object for the blockchain action.
 * @param config.abi - The ABI of the contract.
 * @param config.functionName - The name of the function to call.
 * @param config.args - The arguments to pass to the function.
 * 
 * @returns The output parameters of the function.
 */
declare function blockchainAction<
  abi extends Abi,
  functionName extends ExtractAbiFunctionNames<abi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<abi, functionName>
>(
  config: {
    abi: abi;
    functionName: functionName | ExtractAbiFunctionNames<abi, 'pure' | 'view'>;
    args: AbiParametersToPrimitiveTypes<
      ExtractAbiFunction<abi, functionName>['inputs'],
      'inputs'
    >;
  }): AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'> 

/**
 * Function to validate the types of the blockchain action function declaration.
 * 
 * @template abi - The ABI of the contract.
 * @template functionName - The name of the function to call.
 * @template abiFunction - The ABI function type.
 * 
 * @param config - The configuration object for the blockchain action.
 * @param config.abi - The ABI of the contract.
 * @param config.functionName - The name of the function to call.
 * @param config.args - The arguments to pass to the function.
 * 
 * @returns A boolean indicating whether the types are valid.
 */
function validateBlockchainActionTypes<
  abi extends Abi,
  functionName extends ExtractAbiFunctionNames<abi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<abi, functionName>
>(
  config: {
    abi: abi;
    functionName: functionName | ExtractAbiFunctionNames<abi, 'pure' | 'view'>;
    
  }
): boolean {
  return true
}
