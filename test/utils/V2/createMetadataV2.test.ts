import { createMetadataV2, MetadataV2 } from '../../../src/utils/V2/createMetadataV2';
import { BlockchainActionMetadataV2 } from '../../../src/interface/V2/blockchainActionV2';
import { SherryValidationError } from '../../../src/utils/customErrors';
import { Abi } from 'abitype';
import { describe, test, expect } from '@jest/globals';

describe('createMetadataV2', () => {
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
    const validBlockchainAction: BlockchainActionMetadataV2 = {
        label: 'Transfer Tokens',
        description: 'Transfer tokens to another address',
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
    const validPayableAction: BlockchainActionMetadataV2 = {
        label: 'Deposit Funds',
        description: 'Deposit ETH to the contract',
        address: '0x1234567890123456789012345678901234567890',
        abi: sampleAbi,
        functionName: 'deposit',
        chains: {
            source: 'avalanche',
        },
        amount: 0.1, // ETH to send
    };

    // Valid metadata with a blockchain action
    const validMetadata: MetadataV2 = {
        url: 'https://example.com',
        icon: 'https://example.com/icon.png',
        title: 'Test dApp',
        description: 'A test decentralized application',
        actions: [validBlockchainAction],
    };

    // Test for successful validation
    test('should validate and process valid metadata with blockchain action', () => {
        const result = createMetadataV2(validMetadata);

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
        const multiActionMetadata: MetadataV2 = {
            ...validMetadata,
            actions: [validBlockchainAction, validPayableAction],
        };

        const result = createMetadataV2(multiActionMetadata);

        expect(result.actions).toHaveLength(2);
        // First action should be processed blockchain action with nonpayable type
        expect(result.actions[0]).toHaveProperty('blockchainActionType', 'nonpayable');
        // Second action should be payable blockchain action
        expect(result.actions[1]).toHaveProperty('blockchainActionType', 'payable');
        expect(result.actions[1]).toHaveProperty('amount', 0.1);
    });

    // Test for missing URL
    test('should throw error for missing URL', () => {
        const invalidMetadata = { ...validMetadata, url: '' };

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow("Metadata missing required 'url' field");
    });

    // Test for missing icon
    test('should throw error for missing icon', () => {
        const invalidMetadata = { ...validMetadata, icon: '' };

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow("Metadata missing required 'icon' field");
    });

    // Test for missing title
    test('should throw error for missing title', () => {
        const invalidMetadata = { ...validMetadata, title: '' };

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow("Metadata missing required 'title' field");
    });

    // Test for missing description
    test('should throw error for missing description', () => {
        const invalidMetadata = { ...validMetadata, description: '' };

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow("Metadata missing required 'description' field");
    });

    // Test for missing actions
    test('should throw error for missing actions', () => {
        const invalidMetadata = { ...validMetadata, actions: [] };

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow('Metadata must include at least one action');
    });

    // Test for too many actions
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
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow('Maximum 4 actions allowed');
    });

    // Test for invalid blockchain action
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
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);
    });

    // Test for non-existent function in ABI
    test('should throw error for non-existent function in ABI', () => {
        const invalidBlockchainAction = {
            ...validBlockchainAction,
            functionName: 'nonExistentFunction', // Function not in ABI
        };

        const invalidMetadata = {
            ...validMetadata,
            actions: [invalidBlockchainAction],
        };

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(/Function.*not found/);
    });

    // Test for invalid parameter type compatibility
    test('should throw error for invalid parameter type compatibility', () => {
        const invalidBlockchainAction: BlockchainActionMetadataV2 = {
            label: 'Transfer Tokens',
            description: 'Transfer tokens to another address',
            address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
            abi: sampleAbi,
            functionName: 'transfer',
            chains: {
                source: 'avalanche',
            },
            params: [
                {
                    name: 'recipient',
                    label: 'Recipient Address',
                    //description: 'Address to send tokens to',
                    type: 'number', // Incompatible with 'number' type in ABI
                    required: true,
                },
                {
                    name: 'amount',
                    label: 'Amount',
                    //description: 'Address to send token to',
                    type: 'number',
                    required: true,
                },
            ],
        };

        const invalidMetadata = {
            ...validMetadata,
            actions: [invalidBlockchainAction],
        };

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(/not compatible with ABI type/);
    });

    // Test for amount with non-payable function
    test('should throw error when amount is specified for non-payable function', () => {
        const invalidBlockchainAction = {
            ...validBlockchainAction, // Using the transfer function which is non-payable
            amount: 0.1, // Cannot specify amount for non-payable
        };

        const invalidMetadata = {
            ...validMetadata,
            actions: [invalidBlockchainAction],
        };

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(SherryValidationError);

        expect(() => {
            createMetadataV2(invalidMetadata);
        }).toThrow(/amount.*specified for non-payable function/);
    });
});
