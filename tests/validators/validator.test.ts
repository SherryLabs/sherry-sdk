import { describe, expect, it } from '@jest/globals';
import {
    validateBasicMetadata,
    createMetadata,
    isTransferAction,
    isHttpAction,
} from '../../src/validators/validator';
import { ActionValidationError } from '../../src/errors/customErrors';
import { Metadata } from '../../src/interface/metadata';

describe('Validator utils', () => {
    describe('validateBasicMetadata', () => {
        const validMetadata: Metadata = {
            url: 'https://example.com',
            icon: 'https://example.com/icon.png',
            title: 'Test Metadata',
            description: 'This is a test',
            actions: [
                {
                    label: 'Test Action',
                    address: '0x1234567890123456789012345678901234567890',
                    abi: [],
                    functionName: 'test',
                    chains: { source: 'avalanche' },
                },
            ],
        };

        it('validates correct metadata', () => {
            expect(() => validateBasicMetadata(validMetadata)).not.toThrow();
        });

        it('rejects metadata without url', () => {
            const invalidMetadata = { ...validMetadata, url: '' };
            expect(() => validateBasicMetadata(invalidMetadata as Metadata)).toThrow(
                ActionValidationError,
            );
            expect(() => validateBasicMetadata(invalidMetadata as Metadata)).toThrow(/url/);
        });

        it('rejects metadata without icon', () => {
            const invalidMetadata = { ...validMetadata, icon: '' };
            expect(() => validateBasicMetadata(invalidMetadata as Metadata)).toThrow(
                ActionValidationError,
            );
            expect(() => validateBasicMetadata(invalidMetadata as Metadata)).toThrow(/icon/);
        });

        it('rejects metadata without title', () => {
            const invalidMetadata = { ...validMetadata, title: '' };
            expect(() => validateBasicMetadata(invalidMetadata as Metadata)).toThrow(
                ActionValidationError,
            );
            expect(() => validateBasicMetadata(invalidMetadata as Metadata)).toThrow(/title/);
        });

        it('rejects metadata without description', () => {
            const invalidMetadata = { ...validMetadata, description: '' };
            expect(() => validateBasicMetadata(invalidMetadata as Metadata)).toThrow(
                ActionValidationError,
            );
            expect(() => validateBasicMetadata(invalidMetadata as Metadata)).toThrow(/description/);
        });

        it('rejects metadata with empty actions', () => {
            const invalidMetadata = { ...validMetadata, actions: [] };
            expect(() => validateBasicMetadata(invalidMetadata)).toThrow(ActionValidationError);
            expect(() => validateBasicMetadata(invalidMetadata)).toThrow(
                /must include at least one action/,
            );
        });

        it('rejects metadata with too many actions', () => {
            const tooManyActions = Array(5).fill(validMetadata.actions[0]);
            const invalidMetadata = { ...validMetadata, actions: tooManyActions };
            expect(() => validateBasicMetadata(invalidMetadata)).toThrow(ActionValidationError);
            expect(() => validateBasicMetadata(invalidMetadata)).toThrow(
                /Maximum 4 actions allowed/,
            );
        });
    });

    describe('createMetadata', () => {
        it('processes valid metadata', () => {
            const validMetadata: Metadata = {
                url: 'https://example.com',
                icon: 'https://example.com/icon.png',
                title: 'Test Metadata',
                description: 'This is a test',
                actions: [
                    {
                        label: 'Test Action',
                        address: '0x1234567890123456789012345678901234567890',
                        abi: [
                            {
                                name: 'test',
                                type: 'function',
                                stateMutability: 'nonpayable',
                                inputs: [],
                                outputs: [],
                            },
                        ],
                        functionName: 'test',
                        chains: { source: 'avalanche' },
                    },
                ],
            };

            const result = createMetadata(validMetadata);
            expect(result).toHaveProperty('actions');
            expect(result.actions[0]).toHaveProperty('blockchainActionType');
        });

        it('handles errors during processing', () => {
            const invalidMetadata = {
                url: 'https://example.com',
                icon: 'https://example.com/icon.png',
                title: 'Test Metadata',
                description: 'This is a test',
                actions: [
                    {
                        // This is an invalid action without proper properties
                        label: 'Test',
                    },
                ],
            };

            expect(() => createMetadata(invalidMetadata as Metadata)).toThrow(
                ActionValidationError,
            );
        });
    });

    describe('Type guards', () => {
        it('isTransferAction should correctly identify transfer actions', () => {
            const transferAction = {
                label: 'Send AVAX',
                chains: { source: 'avalanche' },
                to: '0x1234567890123456789012345678901234567890',
                amount: 0.1,
            };

            expect(isTransferAction(transferAction)).toBe(true);
            expect(isTransferAction({})).toBe(false);
            expect(isTransferAction(null)).toBe(false);
        });

        it('isHttpAction should correctly identify HTTP actions', () => {
            const httpAction = {
                label: 'API Call',
                endpoint: 'https://api.example.com/data',
                params: [],
            };

            expect(isHttpAction(httpAction)).toBe(true);
            expect(isHttpAction({})).toBe(false);
            expect(isHttpAction(null)).toBe(false);
        });
    });
});
