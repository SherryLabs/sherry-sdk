"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const BlockchainAction_1 = require("../interfaces/BlockchainAction");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const exampleAbi = [
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
        const metadata = {
            type: "action",
            icon: "icon",
            title: "title",
            description: "description",
            actions: [
                {
                    label: "Test Action 2",
                    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
                    contractABI: exampleAbi,
                    functionName: "safeTransferFrom",
                    functionParamsLabel: ["From"],
                    chainId: "fuji"
                },
                {
                    label: "Test Action 2",
                    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
                    contractABI: exampleAbi,
                    functionName: "safeTransferFrom",
                    chainId: "fuji"
                }
            ]
        };
        try {
            const result = yield (0, BlockchainAction_1.createMetadata)(metadata);
            console.log('Metadata:', JSON.stringify(result, null, 2));
        }
        catch (error) {
            console.error('Error creating metadata:', error);
            throw error;
        }
    });
}
main();
