import { describe, expect, it } from '@jest/globals';
import { Metadata } from '../../src/interface/metadata';
import { BlockchainAction } from '../../src/interface/blockchainAction';
import { createMetadata } from '../../src/utils/createMetadata';
import { validateMetadata } from '../../src/validators/validateMetadata';

describe('AVAX to USDT Swap Action', () => {
    // Define our sample router ABI
    const routerAbi = [
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'amountOutMin',
                    type: 'uint256',
                },
                {
                    components: [
                        {
                            internalType: 'uint256[]',
                            name: 'pairBinSteps',
                            type: 'uint256[]',
                        },
                        {
                            internalType: 'enum ILBRouter.Version[]',
                            name: 'versions',
                            type: 'uint8[]',
                        },
                        {
                            internalType: 'contract IERC20[]',
                            name: 'tokenPath',
                            type: 'address[]',
                        },
                    ],
                    internalType: 'struct ILBRouter.Path',
                    name: 'path',
                    type: 'tuple',
                },
                {
                    internalType: 'address',
                    name: 'to',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: 'deadline',
                    type: 'uint256',
                },
            ],
            name: 'swapExactNATIVEForTokens',
            outputs: [
                {
                    internalType: 'uint256',
                    name: 'amountOut',
                    type: 'uint256',
                },
            ],
            stateMutability: 'payable',
            type: 'function',
        },
    ] as const;

    // Define our swap app metadata
    const createSwapMetadata = (): Metadata => {
        const currentTime = Math.floor(Date.now() / 1000);

        return {
            url: 'https://swap.sherry.social',
            icon: 'https://example.com/avax-usdt-swap-icon.png',
            title: 'AVAX to USDT Swap',
            description: 'Swap AVAX for USDT on Trader Joe V2.2',
            actions: [
                // Swap Action
                {
                    label: 'Swap 1 AVAX for USDT',
                    description: 'Swap exact AVAX for USDT tokens with slippage protection',
                    address: '0x18556DA13313f3532c54711497A8FedAC273220E', // Trader Joe V2.2 Router
                    abi: routerAbi,
                    functionName: 'swapExactNATIVEForTokens',
                    chains: { source: 'avalanche' },
                    amount: 1, // 1 AVAX to swap
                    params: [
                        {
                            name: 'amountOutMin',
                            label: 'Minimum USDT to receive',
                            type: 'number',
                            required: true,
                            value: '0', // By default 0
                            description: 'Minimum amount of USDT to receive (slippage protection)',
                        },
                        {
                            name: 'path',
                            label: 'Swap Path',
                            type: 'tuple', // Correct type for complex tuple structure
                            required: true,
                            value: {
                                pairBinSteps: [15], // Standard bin step for AVAX-USDT pair
                                versions: [2], // V2_2 version (enum value is 2)
                                tokenPath: [
                                    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX address
                                    '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT address
                                ],
                            },
                            fixed: true, // User cannot change the path
                        },
                        {
                            name: 'to',
                            label: 'Recipient',
                            type: 'address',
                            required: true,
                            value: 'sender', // Special value to use the sender's address
                            description: 'Address to receive the USDT tokens',
                        },
                        {
                            name: 'deadline',
                            label: 'Deadline',
                            type: 'number',
                            required: true,
                            value: currentTime + 1200, // 20 minutes from now
                            fixed: true,
                            description: 'Transaction deadline (20 minutes from now)',
                        },
                    ],
                },
            ],
        };
    };

    it('should validate AVAX to USDT swap metadata correctly', () => {
        const swapMetadata = createSwapMetadata();

        // Create and validate metadata
        const createdMetadata = createMetadata(swapMetadata);
        const validationResult = validateMetadata(createdMetadata);

        console.log('Validation Result:', validationResult);

        // Test validation result structure
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.type).toBe('ValidatedMetadata');
        expect(validationResult.data).toBeDefined();

        // Verify the complete structure
        const data = validationResult.data!;
        expect(data.url).toBe(swapMetadata.url);
        expect(data.icon).toBe(swapMetadata.icon);
        expect(data.title).toBe(swapMetadata.title);
        expect(data.description).toBe(swapMetadata.description);
        expect(data.actions).toHaveLength(1);

        // Validate the specific action
        const action = data.actions[0] as BlockchainAction;
        expect(action.label).toBe('Swap 1 AVAX for USDT');
        expect(action.address).toBe('0x18556DA13313f3532c54711497A8FedAC273220E');
        expect(action.functionName).toBe('swapExactNATIVEForTokens');
        expect(action.blockchainActionType).toBe('payable');
        expect(action.amount).toBe(1);

        // Validate chains field
        expect(action.chains).toEqual({ source: 'avalanche' });

        // Validate parameters
        expect(action.params).toHaveLength(4);
        expect(action.params![0].name).toBe('amountOutMin');
        expect(action.params![1].name).toBe('path');
        expect(action.params![1].type).toBe('tuple');
        expect(action.params![2].name).toBe('to');
        expect(action.params![3].name).toBe('deadline');
    });

    it('should handle complex tuple value in path parameter', () => {
        const swapMetadata = createSwapMetadata();
        const createdMetadata = createMetadata(swapMetadata);

        // Get the path parameter from the created metadata
        const action = createdMetadata.actions[0] as BlockchainAction;
        const pathParam = action.params!.find(param => param.name === 'path');

        expect(pathParam).toBeDefined();
        expect(pathParam!.type).toBe('tuple');

        // Validate the complex structure inside path
        const pathValue = pathParam!.value;
        expect(pathValue).toHaveProperty('pairBinSteps');
        expect(pathValue).toHaveProperty('versions');
        expect(pathValue).toHaveProperty('tokenPath');

        // Check specific values
        expect(pathValue.pairBinSteps).toEqual([15]);
        expect(pathValue.versions).toEqual([2]);
        expect(pathValue.tokenPath).toHaveLength(2);
        expect(pathValue.tokenPath[0]).toBe('0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7');
        expect(pathValue.tokenPath[1]).toBe('0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7');
    });

    it('should properly handle the payable property for AVAX swap', () => {
        const swapMetadata = createSwapMetadata();
        const createdMetadata = createMetadata(swapMetadata);

        const action = createdMetadata.actions[0] as BlockchainAction;

        // Check that the function is properly detected as payable
        expect(action.blockchainActionType).toBe('payable');
        expect(action.amount).toBe(1);
    });
});
