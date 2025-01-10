import {
    TransferActionMetadata
} from "../src/interface/blockchainAction";
import {
    isTransferActionMetadata
} from "../src/utils/helpers";
import { describe, expect, it } from "@jest/globals";

describe("Type Guards", () => {
    it("should identify TransferActionMetadata", () => {
        const action: TransferActionMetadata = {
            label: "Transfer Action",
            chainId: "avalanche",
            recipientAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdef",
            amount: 1000
        };

        expect(isTransferActionMetadata(action)).toBe(true);
    });
});