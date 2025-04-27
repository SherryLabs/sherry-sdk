import { createMetadata } from '../../src/utils/createMetadata';
import { Metadata } from '../../src/interface';
import { BlockchainActionMetadata } from '../../src/interface/actions/blockchainAction';
import { SherryValidationError } from '../../src/errors/customErrors';
import { Abi } from 'abitype';
import { describe, test, expect } from '@jest/globals';

describe('createMetadata', () => {
    // Sample ABI for testing
    const sampleAbi: Abi = [
        {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                {
                    name: 'recipient',
                    type: 'address',
                },
                {
                    name: 'amount',
                    type: 'uint256',
                },
            ],
            outputs: [
                {
                    name: '',
                    type: 'bool',
                },
            ],
        },
        {
            name: 'deposit',
            type: 'function',
            stateMutability: 'payable',
            inputs: [],
            outputs: [],
        },
    ];

    // Valid blockchain action
    const validBlockchainAction: BlockchainActionMetadata = {
        type: 'blockchain',
        label: 'Transfer Tokens',
        address: '0x1234567890123456789012345678901234567890',
        abi: sampleAbi,
        functionName: 'transfer',
        chains: {
            source: 'avalanche',
        },
        params: [
            {
                name: 'recipient',
                label: 'Recipient Address',
                description: 'Address to send tokens to',
                type: 'address',
                required: true,
            },
            {
                name: 'amount',
                label: 'Amount',
                description: 'Amount of tokens to transfer',
                type: 'number',
                required: true,
                min: 0,
            },
        ],
    };

    // Second valid blockchain action (using deposit - payable function)
    const validPayableAction: BlockchainActionMetadata = {
        type: 'blockchain',
        label: 'Deposit Funds',
        address: '0x1234567890123456789012345678901234567890',
        abi: sampleAbi,
        functionName: 'deposit',
        chains: {
            source: 'avalanche',
        },
        amount: 0.1, // ETH to send
    };

    // Valid metadata with a blockchain action
    const validMetadata: Metadata = {
        url: 'https://example.com',
        icon: 'https://example.com/icon.png',
        title: 'Test dApp',
        description: 'A test decentralized application',
        actions: [validBlockchainAction],
    };

    // Test for successful validation
    test('should validate and process valid metadata with blockchain action', () => {
        const result = createMetadata(validMetadata);

        expect(result).toEqual(
            expect.objectContaining({
                url: validMetadata.url,
                icon: validMetadata.icon,
                title: validMetadata.title,
                description: validMetadata.description,
            }),
        );

        expect(result.actions).toHaveLength(1);
        expect(result.actions[0]).toEqual(
            expect.objectContaining({
                label: validBlockchainAction.label,
                address: validBlockchainAction.address,
                functionName: validBlockchainAction.functionName,
                blockchainActionType: 'nonpayable', // From the ABI
            }),
        );
        expect(Array.isArray((result.actions[0] as any).abiParams)).toBe(true);
    });

    // Test with multiple blockchain actions
    test('should validate and process metadata with multiple blockchain actions', () => {
        const multiActionMetadata: Metadata = {
            ...validMetadata,
            actions: [validBlockchainAction, validPayableAction],
        };

        const result = createMetadata(multiActionMetadata);

        expect(result.actions).toHaveLength(2);
        // First action should be processed blockchain action with nonpayable type
        expect(result.actions[0]).toHaveProperty('blockchainActionType', 'nonpayable');
        // Second action should be payable blockchain action
        expect(result.actions[1]).toHaveProperty('blockchainActionType', 'payable');
        expect(result.actions[1]).toHaveProperty('amount', 0.1);
    });

    // Basic validation tests
    test('should throw error for missing URL', () => {
        const invalidMetadata = { ...validMetadata, url: '' };

        expect(() => {
            createMetadata(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadata(invalidMetadata);
        }).toThrow("Metadata missing required 'url' field");
    });

    test('should throw error for missing icon', () => {
        const invalidMetadata = { ...validMetadata, icon: '' };

        expect(() => {
            createMetadata(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadata(invalidMetadata);
        }).toThrow("Metadata missing required 'icon' field");
    });

    test('should throw error for too many actions', () => {
        const tooManyActions = [
            validBlockchainAction,
            validBlockchainAction,
            validBlockchainAction,
            validBlockchainAction,
            validBlockchainAction, // 5 actions
        ];

        const invalidMetadata = { ...validMetadata, actions: tooManyActions };

        expect(() => {
            createMetadata(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadata(invalidMetadata);
        }).toThrow('Maximum 4 actions allowed');
    });

    test('should throw error for invalid blockchain action', () => {
        const invalidBlockchainAction = {
            ...validBlockchainAction,
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc520x' as `0x${string}`, // Invalid address format
        };

        const invalidMetadata = {
            ...validMetadata,
            actions: [invalidBlockchainAction],
        };

        expect(() => {
            createMetadata(invalidMetadata);
        }).toThrow(SherryValidationError);
    });
});
