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
            source: 43114,
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
            source: 43114,
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

    // Test for Base Sepolia (84532) metadata validation
    test('should validate Base Sepolia metadata with transfer actions', () => {
        const baseSepoliaMetadata: Metadata = {
            url: "https://tips.sherry.link/baseSepolia/0x75765f035c4471250dcD36e8C20d0a3EEd506ADc",
            icon: "https://kfrzkvoejzjkugwosqxx.supabase.co/storage/v1/object/public/images//BuyCoffee-Miniapp.png",
            title: "🔵 Tip with ETH on Base (Testnet)",
            actions: [
                {
                    to: "0x75765f035c4471250dcD36e8C20d0a3EEd506ADc",
                    type: "transfer",
                    label: "Send Tip",
                    chains: {
                        source: 84532
                    },
                    amountConfig: {
                        type: "select",
                        label: "Amount",
                        options: [
                            {
                                label: "0.001 AVAX",
                                value: 0.001,
                                description: "0.001 AVAX"
                            },
                            {
                                label: "0.01 AVAX",
                                value: 0.01,
                                description: "0.01 AVAX"
                            },
                            {
                                label: "0.1 AVAX",
                                value: 0.1,
                                description: "0.1 AVAX"
                            }
                        ],
                        required: true
                    }
                },
                {
                    to: "0x75765f035c4471250dcD36e8C20d0a3EEd506ADc",
                    type: "transfer",
                    label: "Send Tip",
                    chains: {
                        source: 84532
                    }
                }
            ],
            baseUrl: "https://api.sherry.social",
            description: "Send ETH tips on Base Sepolia Testnet - Test Base's L2 features"
        };

        const result = createMetadata(baseSepoliaMetadata);

        expect(result).toEqual(
            expect.objectContaining({
                url: baseSepoliaMetadata.url,
                icon: baseSepoliaMetadata.icon,
                title: baseSepoliaMetadata.title,
                description: baseSepoliaMetadata.description,
                baseUrl: baseSepoliaMetadata.baseUrl,
            }),
        );

        expect(result.actions).toHaveLength(2);
        
        // Verify first action with amountConfig
        expect(result.actions[0]).toEqual(
            expect.objectContaining({
                type: "transfer",
                label: "Send Tip",
                to: "0x75765f035c4471250dcD36e8C20d0a3EEd506ADc",
                chains: {
                    source: 84532
                },
                amountConfig: expect.objectContaining({
                    type: "select",
                    label: "Amount",
                    required: true,
                    options: expect.arrayContaining([
                        expect.objectContaining({
                            label: "0.001 AVAX",
                            value: 0.001,
                            description: "0.001 AVAX"
                        })
                    ])
                })
            }),
        );

        // Verify second action without amountConfig
        expect(result.actions[1]).toEqual(
            expect.objectContaining({
                type: "transfer",
                label: "Send Tip",
                to: "0x75765f035c4471250dcD36e8C20d0a3EEd506ADc",
                chains: {
                    source: 84532
                }
            }),
        );

        // Verify Base Sepolia chain ID is properly validated
        expect((result.actions[0] as any).chains.source).toBe(84532);
        expect((result.actions[1] as any).chains.source).toBe(84532);
    });

    // Test for cross-chain transfer metadata validation
    test('should validate cross-chain TIP_CROSS_CHAIN metadata', () => {
        const TIP_CROSS_CHAIN: Metadata = {
            title: 'Send a Cross-Chain Tip – ETH to AVAX',
            description:
                "Show appreciation across networks! Enter the recipient's avalanche address and send a crypto tip from base to avalanche in seconds.",
            icon: 'https://kfrzkvoejzjkugwosqxx.supabase.co/storage/v1/object/public/images//whtip.png',
            url: 'https://tips.sherry.link/crosschain/base/avalanche/0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
            baseUrl: 'https://api.sherry.social',
            actions: [
                {
                    label: 'Custom Amount',
                    type: 'transfer',
                    chains: {
                        source: 8453,
                        destination: 43114,
                    },
                },
                {
                    type: 'transfer',
                    label: '0.01 AVAX',
                    to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
                    amount: 0.01,
                    chains: {
                        source: 8453,
                        destination: 43114,
                    },
                },
                {
                    type: 'transfer',
                    label: '0.1 AVAX',
                    to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
                    amount: 0.1,
                    chains: {
                        source: 8453,
                        destination: 43114,
                    },
                },
                {
                    type: 'transfer',
                    label: '1 AVAX',
                    to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
                    amount: 1,
                    chains: {
                        source: 8453,
                        destination: 43114,
                    },
                },
            ],
        };

        const result = createMetadata(TIP_CROSS_CHAIN);

        expect(result).toEqual(
            expect.objectContaining({
                title: TIP_CROSS_CHAIN.title,
                description: TIP_CROSS_CHAIN.description,
                icon: TIP_CROSS_CHAIN.icon,
                url: TIP_CROSS_CHAIN.url,
                baseUrl: TIP_CROSS_CHAIN.baseUrl,
            }),
        );

        expect(result.actions).toHaveLength(4);
        
        // Verify first action (Custom Amount - for dynamic input)
        expect(result.actions[0]).toEqual(
            expect.objectContaining({
                label: 'Custom Amount',
                type: 'transfer',
                chains: {
                    source: 8453,
                    destination: 43114,
                },
            }),
        );

        // Verify second action (0.01 AVAX)
        expect(result.actions[1]).toEqual(
            expect.objectContaining({
                type: 'transfer',
                label: '0.01 AVAX',
                to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
                amount: 0.01,
                chains: {
                    source: 8453,
                    destination: 43114,
                },
            }),
        );

        // Verify third action (0.1 AVAX)
        expect(result.actions[2]).toEqual(
            expect.objectContaining({
                type: 'transfer',
                label: '0.1 AVAX',
                to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
                amount: 0.1,
                chains: {
                    source: 8453,
                    destination: 43114,
                },
            }),
        );

        // Verify fourth action (1 AVAX)
        expect(result.actions[3]).toEqual(
            expect.objectContaining({
                type: 'transfer',
                label: '1 AVAX',
                to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
                amount: 1,
                chains: {
                    source: 8453,
                    destination: 43114,
                },
            }),
        );

        // Verify cross-chain configuration is properly validated
        result.actions.forEach(action => {
            expect((action as any).chains.source).toBe(8453); // Base
            expect((action as any).chains.destination).toBe(43114); // Avalanche
        });
    });
});
