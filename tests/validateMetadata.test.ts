import { describe, expect, it } from '@jest/globals';
import { validateMetadata } from '../src/validators/validateMetadata';
import { Metadata } from '../src/interface/metadata';

describe('validateMetadata', () => {
    it('should validate correct metadata', () => {
        const validMetadata: Metadata = {
            url: 'https://sherry.social',
            icon: 'https://example.com/icon.png',
            title: 'Test Metadata',
            description: 'This is a test metadata',
            actions: [
                {
                    type: 'blockchain',
                    label: 'Test Action',
                    address: '0xB7cfa4c519a8508900c02d21b6C8B5310f63D53b',
                    abi: [
                        {
                            inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
                            name: 'testFunction',
                            outputs: [],
                            stateMutability: 'nonpayable',
                            type: 'function',
                        },
                    ],
                    functionName: 'testFunction',
                    chains: { source: 'fuji', destination: 'alfajores' },
                },
            ],
        };

        const result = validateMetadata(validMetadata);

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('Metadata');
        expect(result.errors).toHaveLength(0);
        expect(result.data).toBeDefined();
    });

    it('should identify ValidatedMetadata type', () => {
        const validatedMetadata: any = {
            url: 'https://sherry.social',
            icon: 'https://example.com/icon.png',
            title: 'Test Validated Metadata',
            description: 'This is already validated metadata',
            actions: [
                {
                    label: 'Test Action',
                    address: '0xB7cfa4c519a8508900c02d21b6C8B5310f63D53b',
                    abi: [
                        {
                            inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
                            name: 'testFunction',
                            outputs: [],
                            stateMutability: 'nonpayable',
                            type: 'function',
                        },
                    ],
                    functionName: 'testFunction',
                    blockchainActionType: 'nonpayable', // This makes it ValidatedMetadata
                    chains: { source: 'fuji', destination: 'alfajores' },
                },
            ],
        };

        const result = validateMetadata(validatedMetadata);

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('ValidatedMetadata');
        expect(result.data).toBeDefined();
    });

    it('should reject metadata missing required fields', () => {
        const invalidMetadata = {
            url: 'https://sherry.social',
            // Missing title, icon, description
            actions: [
                {
                    // Missing label
                    address: '0xB7cfa4c519a8508900c02d21b6C8B5310f63D53b',
                    // Missing abi
                    functionName: 'testFunction',
                    chains: { source: 'fuji', destination: 'alfajores' },
                },
            ],
        };

        const result = validateMetadata(invalidMetadata);

        expect(result.isValid).toBe(false);
        expect(result.type).toBe('Error');
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.error).toBeDefined();
        expect(result.data).toBeUndefined();
        expect(result.errors).toContain('Title is required');
        expect(result.errors).toContain('Icon is required');
        expect(result.errors).toContain('Description is required');
        expect(result.errors).toContain('Action 0: Label is required');
        expect(result.errors).toContain('Action 0: ABI is required');
    });

    it('should handle null or undefined metadata', () => {
        const result = validateMetadata(null);

        expect(result.isValid).toBe(false);
        expect(result.type).toBe('Error');
        expect(result.errors).toContain('Metadata is undefined or null');
        expect(result.error).toBeDefined();
        expect(result.data).toBeUndefined();
    });

    it('should validate metadata from JSON string', () => {
        const jsonString = JSON.stringify({
            url: 'https://sherry.social',
            icon: 'https://example.com/icon.png',
            title: 'Test Metadata',
            description: 'This is a test metadata',
            actions: [
                {
                    label: 'Test Action',
                    address: '0xB7cfa4c519a8508900c02d21b6C8B5310f63D53b',
                    abi: [
                        {
                            inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
                            name: 'testFunction',
                            outputs: [],
                            stateMutability: 'nonpayable',
                            type: 'function',
                        },
                    ],
                    functionName: 'testFunction',
                    chains: { source: 'fuji', destination: 'alfajores' },
                },
            ],
        });

        // Parse JSON string to object and validate
        const result = validateMetadata(JSON.parse(jsonString));

        expect(result.isValid).toBe(true);
        expect(result.type).toBe('Metadata');
        expect(result.errors).toHaveLength(0);
        expect(result.data).toBeDefined();
    });
});
