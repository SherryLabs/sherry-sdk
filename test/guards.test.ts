import {
    TransferAction
} from "../src/interface/blockchainAction";
import {
    isTransferAction
} from "../src/utils/helpers";
import { describe, expect, it } from "@jest/globals";

describe("Type Guards", () => {
    it("should identify TransferAction", () => {
        const action: TransferAction = {
            label: "Transfer Action",
            chains: { source: "avalanche"},
            to: "0xabcdefabcdefabcdefabcdefabcdefabcdef",
            amount: 1000
        };

        expect(isTransferAction(action)).toBe(true);
    });
});