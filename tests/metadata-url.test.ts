import { createMetadata } from '../src/validators/metadataValidator';
import { Metadata } from '../src/interface/metadata';
import { SherryValidationError } from '../src/errors/customErrors';
import { describe, test, expect } from '@jest/globals';

describe('URL Metadata Tests', () => {
    // The actual metadata from the API endpoint
    const urlMetadata: Metadata = {
        url: 'https://swap.sherry.social',
        icon: 'https://static.cryptobriefing.com/wp-content/uploads/2024/09/23120144/Trader-Joe-800x450.webp',
        title: 'AVAX to USDT Swap',
        baseUrl: 'https://api.sherry.social',
        description: 'Swap AVAX for USDT on traderjoe',
        actions: [
            {
                abi: [
                    {
                        name: 'approve',
                        type: 'function',
                        inputs: [
                            {
                                name: 'spender',
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
                        stateMutability: 'nonpayable',
                    },
                ],
                type: 'blockchain',
                label: 'Approve Token Spending',
                chains: {
                    source: 43113,
                },
                params: [
                    {
                        name: 'spender',
                        type: 'address',
                        label: 'Spender Address',
                        value: '0x22c3810de9000185e68b8079035ab5b1848dba1e',
                        description: 'Address that will be allowed to spend the tokens',
                    },
                    {
                        name: 'amount',
                        type: 'uint256',
                        label: 'Amount to Approve',
                        required: true,
                        description: 'Amount of tokens to approve for spending',
                    },
                ],
                address: '{{KOL_ROUTER_ADDRESS}}' as `0x${string}`,
                functionName: 'approve',
            },
            {
                path: '/v1/gtm/swap',
                type: 'dynamic',
                label: 'Confirm Swap AVAX → USDT',
                chains: {
                    source: 43113,
                },
                params: [
                    {
                        name: 'protocol',
                        type: 'text',
                        label: 'Protocol',
                        value: 'traderjoe',
                        required: true,
                        maxLength: 100,
                        minLength: 1,
                        description: 'DEX protocol to use for the swap (e.g., TraderJoe, Uniswap)',
                    },
                    {
                        name: 'chainId',
                        type: 'number',
                        label: 'Chain ID',
                        value: 43113,
                        pattern: '^[0-9]+$',
                        required: true,
                        description: 'Blockchain chain ID for the swap (e.g., 43114 for Avalanche)',
                    },
                    {
                        name: 'version',
                        type: 'text',
                        label: 'Version',
                        value: 'latest',
                        required: true,
                        maxLength: 100,
                        minLength: 1,
                        description: 'Version of the protocol to use for the swap (e.g., v1, v2)',
                    },
                    {
                        name: 'kolRouterAddress',
                        type: 'text',
                        label: 'Creator Code (Optional)',
                        value: '0x22c3810de9000185e68b8079035ab5b1848dba1e',
                        required: false,
                        maxLength: 100,
                        minLength: 1,
                        description: 'Optional creator referral address for fee sharing',
                    },
                    {
                        name: 'userAddress',
                        type: 'text',
                        label: 'User Address',
                        value: 'sender',
                        required: true,
                        maxLength: 100,
                        minLength: 1,
                        description: 'Blockchain chain name (e.g., Avalanche, Ethereum)',
                    },
                    {
                        name: 'fromToken',
                        type: 'text',
                        label: 'From Token',
                        value: 'AVAX',
                        required: true,
                        maxLength: 100,
                        minLength: 1,
                        description: 'Token to send (Avalanche Fuji)',
                    },
                    {
                        name: 'toToken',
                        type: 'text',
                        label: 'To Token',
                        value: 'USDT',
                        required: true,
                        maxLength: 20,
                        minLength: 1,
                        description: 'Token to receive (USD Tether)',
                    },
                    {
                        min: 0.000001,
                        name: 'amount',
                        type: 'number',
                        label: 'Amount to swap (AVAX)',
                        required: true,
                        description: 'Enter the amount of AVAX you want to swap',
                    },
                    {
                        name: 'slippage',
                        type: 'text',
                        label: 'Slippage Tolerance (%)',
                        value: '500000000000000000',
                        required: false,
                        maxLength: 100,
                        minLength: 1,
                        description: 'Maximum price movement tolerance (recommended: 0.5-2%)',
                    },
                ],
                description: 'Dynamic Swap on traderjoe',
            },
        ],
    };

    test('should fail validation with placeholder address {{KOL_ROUTER_ADDRESS}}', () => {
        expect(() => {
            createMetadata(urlMetadata);
        }).toThrow(SherryValidationError);
    });

    test('should pass validation when placeholder is replaced with valid address', () => {
        const validMetadata = {
            ...urlMetadata,
            actions: [
                {
                    ...urlMetadata.actions[0],
                    address: '0x22c3810de9000185e68b8079035ab5b1848dba1e' as `0x${string}`,
                },
                urlMetadata.actions[1],
            ],
        };

        const result = createMetadata(validMetadata);
        expect(result).toBeDefined();
        expect(result.actions).toHaveLength(2);
        expect(result.actions[0]).toHaveProperty(
            'address',
            '0x22c3810de9000185e68b8079035ab5b1848dba1e',
        );
    });

    test('should validate baseUrl and dynamic action path relationship', () => {
        const validMetadata = {
            ...urlMetadata,
            actions: [
                {
                    ...urlMetadata.actions[0],
                    address: '0x22c3810de9000185e68b8079035ab5b1848dba1e' as `0x${string}`,
                },
                urlMetadata.actions[1],
            ],
        };

        const result = createMetadata(validMetadata);
        expect(result.baseUrl).toBe('https://api.sherry.social');

        // The dynamic action should be properly validated with the baseUrl
        const dynamicAction = result.actions[1];
        expect(dynamicAction).toHaveProperty('type', 'dynamic');
        expect(dynamicAction).toHaveProperty('path', '/v1/gtm/swap');
    });

    test('should identify the specific validation error for placeholder address', () => {
        let errorMessage = '';
        try {
            createMetadata(urlMetadata);
        } catch (error) {
            if (error instanceof Error) {
                errorMessage = error.message;
            }
        }

        // The error should mention address validation
        expect(errorMessage).toContain('address');
    });
});
