import { describe, expect, it } from '@jest/globals';
import { Metadata } from '../src/interface/metadata';
import { BlockchainAction } from '../src/interface/blockchainAction';
import { createMetadata } from '../src/utils/createMetadata';
import { validateMetadata } from '../src/validators/validateMetadata';

describe('ETH Denver Raffle Metadata', () => {
    it('should validate ETH Denver raffle metadata correctly', () => {
        const ethDenverMetadata: Metadata = {
            url: 'https://sherry.social',
            icon: 'https://kfrzkvoejzjkugwosqxx.supabase.co/storage/v1/object/public/images//ETHDevnerRaffle-Miniapp.png',
            title: 'NFC Quest: Scan, Mint & Win at ETHDenver',
            description:
                'Found me at ETHDenver? Enter your wallet address to verify your POAP and join the $500 USDC raffle! Five winners will be selected',
            actions: [
                {
                    label: 'Join the Raffle',
                    address: '0xB7cfa4c519a8508900c02d21b6C8B5310f63D53b',
                    abi: [
                        // Only including relevant functions to reduce size
                        {
                            inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
                            name: 'checkAndRegister',
                            outputs: [],
                            stateMutability: 'nonpayable',
                            type: 'function',
                        },
                    ],
                    functionName: 'checkAndRegister',
                    chains: { source: 'fuji', destination: 'alfajores' },
                },
            ],
        };

        //Create Metadata
        const createdMetadata = createMetadata(ethDenverMetadata);
        // Validate metadata
        const validationResult = validateMetadata(createdMetadata);

        // Test validation result structure
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.type).toBe('ValidatedMetadata');
        expect(validationResult.data).toBeDefined();

        // Verify the complete structure
        const data = validationResult.data!;
        expect(data.url).toBe(ethDenverMetadata.url);
        expect(data.icon).toBe(ethDenverMetadata.icon);
        expect(data.title).toBe(ethDenverMetadata.title);
        expect(data.description).toBe(ethDenverMetadata.description);
        expect(data.actions).toHaveLength(1);

        // Validate the specific action
        const action = data.actions[0] as BlockchainAction;
        expect(action.label).toBe('Join the Raffle');
        expect(action.address).toBe('0xB7cfa4c519a8508900c02d21b6C8B5310f63D53b');
        expect(action.functionName).toBe('checkAndRegister');
        expect(action.blockchainActionType).toBe('nonpayable');

        // Validate chains field
        expect(action.chains).toEqual({ source: 'fuji', destination: 'alfajores' });
    });

    it('should reject invalid metadata', () => {
        // Creating metadata with missing required fields
        const invalidMetadata = {
            url: 'https://sherry.social',
            // Missing title, icon, and description
            actions: [
                {
                    // Missing label
                    address: '0xB7cfa4c519a8508900c02d21b6C8B5310f63D53b',
                    // Missing abi
                    functionName: 'checkAndRegister',
                    chains: { source: 'fuji', destination: 'alfajores' },
                },
            ],
        };

        // Attempt to validate invalid metadata
        const validationResult = validateMetadata(invalidMetadata as Metadata);

        // Should be invalid
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.type).toBe('Error');
        expect(validationResult.error).toBeDefined();
    });
});
