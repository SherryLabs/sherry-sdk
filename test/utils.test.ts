/* 

import { describe, expect, it } from "@jest/globals";
import { Abi, AbiFunction } from "../src/interface/index";
import { ContractFunctionName } from "../src/interface/index";
import { Metadata } from "../src/interface/metadata";
import { BlockchainActionMetadata, BlockchainAction } from "../src/interface/blockchainAction";
import {
    FunctionNotFoundError,
    InvalidAddress,
    NoActionDefinedError,
    ActionsNumberError
} from "../src/customErrors";
import {
    getParameters,
    getAbiFunction,
    isValidFunction,
    validateActionParameters,
    getBlockchainActionType,
    createMetadata
} from "../src/utils";

describe("utils", () => {
    const mockAbi = [
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
    ] as const

    const mockAction: BlockchainActionMetadata = {
        contractABI: mockAbi,
        functionName: "balanceOf",
        contractAddress: "0x123",
        functionParamsLabel: ["param1"],
        label: "Test Action",
        chainId: "fuji"
    };

    describe("getParameters", () => {
        it("should return the parameters of the function", () => {
            const params = getParameters(mockAction);
            expect(params).toEqual([{ name: "param1", type: "uint256" }]);
        });
    });

    describe("getAbiFunction", () => {
        it("should return the ABI function", () => {
            const abiFunction = getAbiFunction(mockAbi, "testFunction");
            expect(abiFunction).toEqual(mockAbi[0]);
        });

        it("should throw FunctionNotFoundError if function is not found", () => {
            expect(() => getAbiFunction(mockAbi, "nonExistentFunction")).toThrow(FunctionNotFoundError);
        });
    });

    describe("isValidFunction", () => {
        it("should return true if function exists in ABI", () => {
            expect(isValidFunction(mockAbi, "testFunction")).toBe(true);
        });

        it("should return false if function does not exist in ABI", () => {
            expect(isValidFunction(mockAbi, "nonExistentFunction")).toBe(false);
        });
    });

    describe("validateActionParameters", () => {
        it("should return true if parameters length matches", () => {
            const action: BlockchainAction = {
                ...mockAction,
                transactionParameters: [{ name: "param1", type: "uint256" }]
            };
            expect(validateActionParameters(action)).toBe(true);
        });

        it("should return false if parameters length does not match", () => {
            const action: BlockchainAction = {
                ...mockAction,
                transactionParameters: []
            };
            expect(validateActionParameters(action)).toBe(false);
        });
    });

    describe("getBlockchainActionType", () => {
        it("should return the state mutability of the function", () => {
            const actionType = getBlockchainActionType(mockAction);
            expect(actionType).toBe("nonpayable");
        });

        it("should throw an error if function is not found", () => {
            const invalidAction = { ...mockAction, functionName: "nonExistentFunction" };
            expect(() => getBlockchainActionType(invalidAction)).toThrow(Error);
        });
    });

    describe("createMetadata", () => {
        it("should create metadata with processed actions", () => {
            const metadata: Metadata = {
                actions: [mockAction]
            };
            const result = createMetadata(metadata);
            expect(result.actions[0].transactionParameters).toEqual([{ name: "param1", type: "uint256" }]);
        });

        it("should throw NoActionDefinedError if no actions are defined", () => {
            const metadata: Metadata = { actions: [] };
            expect(() => createMetadata(metadata)).toThrow(NoActionDefinedError);
        });

        it("should throw ActionsNumberError if more than 4 actions are defined", () => {
            const metadata: Metadata = { actions: [mockAction, mockAction, mockAction, mockAction, mockAction] };
            expect(() => createMetadata(metadata)).toThrow(ActionsNumberError);
        });

        it("should throw InvalidAddress if an invalid address is provided", () => {
            const invalidAction = { ...mockAction, contractAddress: "invalidAddress" };
            const metadata: Metadata = { actions: [invalidAction] };
            expect(() => createMetadata(metadata)).toThrow(InvalidAddress);
        });
    });
});
*/