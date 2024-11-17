import { ChainId, BlockchainAction } from "../src/interfaces/BlockchainAction";
import { Abi, AbiParameter } from "abitype";
import { describe, expect, it } from "@jest/globals";
import { ExtractAbiFunctionNames } from 'abitype'

describe('BlockchainAction Interface', () => {
    const exampleAbi: Abi = [
        {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'owner', type: 'address' }],
            outputs: [{ name: 'balance', type: 'uint256' }],
        },
        {
            name: 'safeTransferFrom',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'tokenId', type: 'uint256' },
            ],
            outputs: [],
        },
    ];
    // Simplified for testing purposes

    //const validAbiParameter: AbiParameter = { name: 'param1', type: 'uint256' };

    it('should create a valid BlockchainAction object', () => {
        // Esto debería causar un error de tipo en TypeScript
        const invalidAction: BlockchainAction<typeof exampleAbi> = {
            label: "Invalid Action",
            contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
            contractABI: exampleAbi,
            functionName: "nonExistentFunction", // TypeScript debería marcar esto como error
            blockchainActionType: "read",
            transactionParameters: [],
            chainId: "ethereum",
            data: {}
        };

    });

    /*
    it('should fail when required fields are missing', () => {
        const createInvalidAction = () => {
            const action: BlockchainAction = {
                label: "Invalid Action",
                contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
                contractABI: validAbi,
                functionName: "testFunction",
                blockchainActionType: "read",
                transactionParameters: [validAbiParameter],
                chainId: "ethereum"
            } as BlockchainAction;
        };

        expect(createInvalidAction).toThrow();
    });

    it('should accept different chainIds', () => {
        const chainIds: ChainId[] = ["ethereum", "base", "optimism", "avalanche"];
        chainIds.forEach(chainId => {
            const action: BlockchainAction = {
                label: "Test Action",
                contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
                contractABI: validAbi,
                functionName: "testFunction",
                blockchainActionType: "read",
                transactionParameters: [validAbiParameter],
                chainId,
                data: {}
            };

            expect(action.chainId).toBe(chainId);
        });
    });

    it('should handle optional data field', () => {
        const actionWithData: BlockchainAction = {
            label: "Action with Data",
            contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
            contractABI: validAbi,
            functionName: "testFunction",
            blockchainActionType: "write",
            transactionParameters: [validAbiParameter],
            chainId: "base",
            data: { key: "value" }
        };

        expect(actionWithData.data).toEqual({ key: "value" });

        const actionWithoutData: BlockchainAction = {
            label: "Action without Data",
            contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
            contractABI: validAbi,
            functionName: "testFunction",
            blockchainActionType: "write",
            transactionParameters: [validAbiParameter],
            chainId: "base"
        };

        expect(actionWithoutData.data).toBeUndefined();
    });
    */
});