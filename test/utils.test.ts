
import { describe, expect, it } from "@jest/globals";
import { Metadata, ValidatedMetadata } from "../src/interface/metadata";
import { BlockchainActionMetadata, BlockchainAction } from "../src/interface/blockchainAction";
import {
    FunctionNotFoundError,
    NoActionDefinedError,
    ActionsNumberError
} from "../src/index";
import {
    getParameters,
    getAbiFunction,
    isValidFunction,
    validateActionParameters,
    getBlockchainActionType,
    createMetadata,
    isValidValidatedMetadata
} from "../src/utils";
import { complexAbi, simpleAbi } from "./abi";

describe("utils", () => {
    const mockAbi = simpleAbi;

    // This action has the same params as the mockAction
    const mockAction: BlockchainActionMetadata = {
        abi: mockAbi,
        functionName: "balanceOf",
        address: "0x0123456789012345678901234567890123456789",
        paramsLabel: ["param1"],
        label: "Test Action",
        chain: "fuji"
    };

    // This action has a different params than the mockAction
    const mockActionv2: BlockchainAction = {
        abi: mockAbi,
        functionName: "balanceOf",
        address: "0x0123456789012345678901234567890123456789",
        paramsLabel: ["param1"],
        label: "Test Action",
        chain: "fuji",
        params: [{ name: "owner", type: "address" }],
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
                params: [{ name: "param1", type: "uint256" }],
                blockchainActionType: "nonpayable"
            };
            expect(validateActionParameters(action)).toBe(true);
        });

        it("should return false if parameters length does not match", () => {
            const action: BlockchainAction = {
                ...mockAction,
                params: [],
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
                url: "google.com",
                title: "title",
                description: "description",
                icon: "icon",
                actions: [mockActionv2]
            };

            const result: ValidatedMetadata = createMetadata(metadata);
            expect((result.actions[0] as BlockchainAction).params[0]!).toEqual({ name: "param1", type: "address" });
        });

        it("should create metadata with complex Abi", () => {
            const metadata: Metadata = {
                type: "action",
                url: "google.com",
                title: "title",
                description: "description",
                icon: "icon",
                actions: [{
                    abi: complexAbi,
                    functionName: "updatePersonStruct",
                    address: "0x0123456789012345678901234567890123456789",
                    paramsLabel: ["param1"],
                    label: "Test Action",
                    chain: "fuji"
                }]
            };

            const result: ValidatedMetadata = createMetadata(metadata);
            //console.log("result: ", JSON.stringify(result, null, 2));
            expect((result.actions[0] as BlockchainAction).params[0]!).toEqual(
                {
                    components: [
                        {
                            internalType: "string",
                            name: "param1",
                            type: "string"
                        },
                        {
                            internalType: "uint256",
                            name: "age",
                            type: "uint256"
                        }
                    ],
                    internalType: "struct TestContract.Person",
                    name: "newPerson",
                    type: "tuple"
                }
            );
        });

        it("should throw NoActionDefinedError if no actions are defined", () => {
            const metadata: Metadata = {
                type: "action",
                url: "url",
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
                url: "google.com",
                title: "title",
                description: "description",
                icon: "icon",
                actions: [mockAction, mockAction, mockAction, mockAction, mockAction]
            };
            expect(() => createMetadata(metadata)).toThrow(ActionsNumberError);
        });

        it("shouls return true if is valid validatedMetadata", () => {
            const metadata: Metadata = {
                type: "action",
                url: "google.com",
                title: "title",
                description: "description",
                icon: "icon",
                actions: [mockAction]
            };
            const result = createMetadata(metadata);
            const isValid = isValidValidatedMetadata(result);
            expect(isValid).toBe(true);
        });

        it("shouls return false if is not valid validatedMetadata", () => {
            const metadata: Metadata = {
                type: "action",
                url: "google.com",
                title: "title",
                description: "description",
                icon: "icon",
                actions: [mockAction]
            };

            const myOwnMetadata = {
                tipo: "action",
                titulo: "title",
                describe: "description",
                icono: "icon",
                acciones: []
            }

            const result = createMetadata(metadata);
            (result.actions[0] as BlockchainAction).params = [];

            const isValid2 = isValidValidatedMetadata(metadata);
            const isValid3 = isValidValidatedMetadata(myOwnMetadata);

            expect(isValid2).toBe(false)
            expect(isValid3).toBe(false);
        });
    });
});
