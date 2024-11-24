
import { describe, expect, it } from "@jest/globals";
import { Metadata, ValidatedMetadata } from "../src/interface/metadata";
import { BlockchainActionMetadata, BlockchainAction } from "../src/interface/blockchainAction";
import {
    FunctionNotFoundError,
    InvalidAddress,
    NoActionDefinedError,
    ActionsNumberError
} from "../src/index";
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
        contractAddress: "0x0123456789012345678901234567890123456789",
        functionParamsLabel: ["param1"],
        label: "Test Action",
        chainId: "fuji"
    };

    const mockActionv2: BlockchainAction = {
        contractABI: mockAbi,
        functionName: "balanceOf",
        contractAddress: "0x0123456789012345678901234567890123456789",
        functionParamsLabel: ["param1"],
        label: "Test Action",
        chainId: "fuji",
        transactionParameters: [{ name: "owner", type: "address" }],
        blockchainActionType: "view"
    };

    describe("getParameters", () => {
        it("should return the parameters of the function", () => {
            const params = getParameters(mockAction);
            expect(params).toEqual([{ name: "owner", type: "address" }]);
        });
    });

    describe("getAbiFunction", () => {
        it("should return the ABI function", () => {
            const abiFunction = getAbiFunction(mockAbi, "balanceOf");
            expect(abiFunction).toEqual(mockAbi[0]);
        });

        it("should throw FunctionNotFoundError if function is not found", () => {
            expect(() => getAbiFunction(mockAbi, "nonExistentFunction")).toThrow(FunctionNotFoundError);
        });
    });

    describe("isValidFunction", () => {
        it("should return true if function exists in ABI", () => {
            expect(isValidFunction(mockAbi, "balanceOf")).toBe(true);
        });

        it("should return false if function does not exist in ABI", () => {
            expect(isValidFunction(mockAbi, "nonExistentFunction")).toBe(false);
        });
    });

    describe("validateActionParameters", () => {
        it("should return true if parameters length matches", () => {
            const action: BlockchainAction = {
                ...mockAction,
                transactionParameters: [{ name: "param1", type: "uint256" }],
                blockchainActionType: "nonpayable"
            };
            expect(validateActionParameters(action)).toBe(true);
        });

        it("should return false if parameters length does not match", () => {
            const action: BlockchainAction = {
                ...mockAction,
                transactionParameters: [],
                blockchainActionType: "pure"
            };
            expect(validateActionParameters(action)).toBe(false);
        });
    });

    describe("getBlockchainActionType", () => {
        it("should return the state mutability of the function", () => {
            const actionType = getBlockchainActionType(mockAction);
            expect(actionType).toBe("view");
        });

        it("should throw an error if function is not found", () => {
            const invalidAction = { ...mockAction, functionName: "nonExistentFunction" };
            expect(() => getBlockchainActionType(invalidAction)).toThrow(Error);
        });
    });

    describe("createMetadata", () => {
        it("should create metadata with processed actions", () => {
            const metadata: Metadata = {
                type: "action",
                title: "title",
                description: "description",
                icon: "icon",
                actions: [mockActionv2]
            };

            const result: ValidatedMetadata = createMetadata(metadata);
            expect(result.actions[0].transactionParameters[0]!).toEqual({ name: "param1", type: "address" });
        });

        it("should throw NoActionDefinedError if no actions are defined", () => {
            const metadata: Metadata = {
                type: "action",
                title: "title",
                description: "description",
                icon: "icon",
                actions: []
            };
            expect(() => createMetadata(metadata)).toThrow(NoActionDefinedError);
        });

        it("should throw ActionsNumberError if more than 4 actions are defined", () => {
            const metadata: Metadata = {
                type: "action",
                title: "title",
                description: "description",
                icon: "icon",
                actions: [mockAction, mockAction, mockAction, mockAction, mockAction]
            };
            expect(() => createMetadata(metadata)).toThrow(ActionsNumberError);
        });
    });
});