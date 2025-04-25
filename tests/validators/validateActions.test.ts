import { describe, expect, it } from '@jest/globals';
import { BlockchainActionValidator } from '../../src/validators/blockchainActionValidator';
import { isTransferAction, isHttpAction, createMetadata } from '../../src/validators/validator';
import { BlockchainActionMetadata } from '../../src/interface/actions/blockchainAction';
import { Metadata } from '../../src/interface';

describe('Action Validators', () => {
    it('should correctly identify blockchain actions', () => {
        const blockchainAction = {
            type: 'blockchain',
            label: 'Approve Token',
            title: 'Approve Token for Swap',
            description: 'Approve tokens to be used by the swap router',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`,
            abi: [
                {
                    name: 'approve',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [
                        { name: 'spender', type: 'address' },
                        { name: 'amount', type: 'uint256' },
                    ],
                    outputs: [{ name: '', type: 'bool' }],
                },
            ],
            functionName: 'approve',
            chains: {
                source: 'fuji',
                destination: 'alfajores',
            },
            params: [
                {
                    type: 'address',
                    label: 'Router Address',
                    required: true,
                    name: 'spender',
                    value: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
                    fixed: true,
                },
                {
                    type: 'number',
                    label: 'Amount to Approve',
                    required: true,
                    name: 'amount',
                    value: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                    fixed: true,
                },
            ],
        } as BlockchainActionMetadata;

        const metadata: Metadata = {
            title: 'Example Metadata',
            url: 'https://example.com',
            icon: 'https://example.com/icon.png',
            description: 'Example metadata',
            actions: [blockchainAction],
        };

        const validated = createMetadata(metadata);

        // This should be true - it's a blockchain action
        expect(BlockchainActionValidator.isBlockchainAction(validated.actions[0])).toBe(true);

        // These should be false - it's NOT a transfer or HTTP action
        expect(isTransferAction(blockchainAction)).toBe(false);
        expect(isHttpAction(blockchainAction)).toBe(false);
    });

    it('should correctly identify transfer actions', () => {
        const transferAction = {
            label: 'Send AVAX',
            description: 'Transfer AVAX to another address',
            chains: { source: 'fuji', destination: 'alfajores' },
            to: '0x1234567890123456789012345678901234567890',
            amount: 0.1,
        };

        // This should be true - it's a transfer action
        expect(isTransferAction(transferAction)).toBe(true);

        // These should be false - it's NOT a blockchain or HTTP action
        expect(BlockchainActionValidator.isBlockchainAction(transferAction)).toBe(false);
        expect(isHttpAction(transferAction)).toBe(false);
    });
});
