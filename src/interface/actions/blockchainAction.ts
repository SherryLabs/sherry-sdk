import { Abi, AbiStateMutability, AbiParameter } from '../index';
import { ContractFunctionName } from '../index';
import { BaseAction } from './action';
import { Parameter } from '../inputs';

export interface BlockchainActionMetadata extends BaseAction {
    type: 'blockchain';
    address: `0x${string}`; // Dirección del contrato
    abi: Abi; // ABI del contrato
    functionName: ContractFunctionName; // Nombre de la función
    amount?: number; // If function is payable, amount to send, set proper value as number - will be converted to WEI
    params?: Parameter[]; // Array de parámetros configurados - DEBES ENVIARLOS EN EL MISMO ORDEN QUE EN EL ABI
}

export interface BlockchainAction extends BlockchainActionMetadata {
    abiParams: AbiParameter[]; // Processed ABI parameters
    blockchainActionType: AbiStateMutability; // Function mutability
}
