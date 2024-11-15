import { BlockchainAction, ChainId } from "../src/interfaces/BlockchainAction";
import { Abi, AbiParameter } from "abitype";
import { describe, expect, it } from "@jest/globals";

describe('BlockchainAction Interface', () => {
    const validAbi: Abi = []; // Simplified for testing purposes
    const validAbiParameter: AbiParameter = { name: 'param1', type: 'uint256' };

    it('should create a valid BlockchainAction object', () => {
        const action: BlockchainAction = {
            label: "Test Action",
            contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
            contractABI: validAbi,
            functionName: "testFunction",
            blockchainActionType: "read",
            transactionParameters: [validAbiParameter],
            chainId: "ethereum",
            data: {}
        };

        expect(action.label).toBe("Test Action");
        expect(action.contractAddress).toBe("0x1234567890abcdef1234567890abcdef12345678");
        expect(action.contractABI).toBe(validAbi);
        expect(action.functionName).toBe("testFunction");
        expect(action.blockchainActionType).toBe("read");
        expect(action.transactionParameters).toEqual([validAbiParameter]);
        expect(action.chainId).toBe("ethereum");
        expect(action.data).toEqual({});
    });

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
});