import { Abi, AbiStateMutability, AbiParameter } from './index';
import { ContractFunctionName } from './index';
import { ChainContext } from './chains';

export interface UIParameter {
    label: string;
    description?: string;
    minValue?: number;
    maxValue?: number;
    defaultValue?: any;
}

export interface BlockchainUIConfig {
    title?: string;
    description?: string;
    parameters?: Record<string, UIParameter>;
}

export interface BlockchainActionMetadata {
    label: string;
    address: `0x${string}`;
    abi: Abi;
    functionName: ContractFunctionName;
    amount?: number; // Optional for DEVs to define the amount of the transaction - msg.value to be sent
    paramsLabel?: string[]; // Optional for DEVs to define the label of the parameters
    paramsValue?: (string | number | bigint | null | boolean)[]; // Optional for DEVs to define the value of the parameters
    chains: ChainContext; // [sourceChain, destinationChain | null]
    ui?: BlockchainUIConfig;
}

// This interface is used internally to define the final blockchain action
export interface BlockchainAction extends BlockchainActionMetadata {
    params: AbiParameter[];
    blockchainActionType: AbiStateMutability;
}

export interface TransferUIConfig {
    title?: string;
    description?: string;
    successMessage?: string;
    errorMessage?: string;
    amountConfig?: {
        label?: string;
        description?: string;
        placeholder?: string;
        minValue?: number;
        maxValue?: number;
        step?: number;
        errorMessage?: string;
    };
    addressConfig?: {
        label?: string;
        description?: string;
        placeholder?: string;
        errorMessage?: string;
    };
}

export interface TransferAction {
    label: string;
    to?: `0x${string}`;
    amount?: number;
    chains: ChainContext; // [sourceChain, destinationChain | null]
    // New optional UI configuration
    ui?: TransferUIConfig;
}

// Plantillas predefinidas para configuraciones UI comunes
export const UI_TEMPLATES = {
    TOKEN_TRANSFER: {
        title: 'Token Transfer',
        description: 'Transfer tokens to another address',
        successMessage: 'Transfer successful!',
        errorMessage: 'Transfer failed. Please try again.',
        parameters: {
            to: {
                label: 'Recipient Address',
                description: "Enter the recipient's wallet address",
                placeholder: '0x...',
                pattern: '^0x[a-fA-F0-9]{40}$',
                errorMessage: 'Invalid ethereum address',
            },
            amount: {
                label: 'Amount',
                description: 'Enter the amount to transfer',
                placeholder: '0.0',
                minValue: 0,
                errorMessage: 'Amount must be greater than 0',
            },
        },
    },
    NFT_MINT: {
        title: 'Mint NFT',
        description: 'Mint a new NFT',
        successMessage: 'NFT minted successfully!',
        errorMessage: 'Minting failed. Please try again.',
        parameters: {
            tokenId: {
                label: 'Token ID',
                description: 'Enter the token ID to mint',
                placeholder: '1',
                minValue: 1,
                errorMessage: 'Token ID must be greater than 0',
            },
        },
    },
} as const;
