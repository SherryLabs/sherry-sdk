import { Abi, AbiFunction, AbiParametersToPrimitiveTypes, ExtractAbiFunctionNames } from "abitype";
import { ExtractAbiFunction } from "abitype";
import { ChainId } from "./Chains";

export interface BlockchainAction<ContractABI extends Abi> {
  label: string;
  contractAddress: `0x${string}`;
  contractABI: ContractABI;
  functionName: ExtractAbiFunctionNames<ContractABI, 'pure' | 'view' | 'payable' | 'nonpayable'>;
  chainId: ChainId;
}

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





