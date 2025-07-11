import { createMetadata, DynamicAction, Metadata } from '../../src';

describe('Dynamic Action Validation', () => {
    it('should fail when dynamic action has a relative path without baseUrl', () => {
        const invalidMetadata: Metadata = {
            url: 'https://swap.sherry.social',
            title: 'Test App',
            icon: 'https://example.com/icon.png',
            description: 'Test description',
            // Missing baseUrl intentionally
            actions: [
                {
                    label: 'Dynamic Action',
                    type: 'dynamic',
                    description: 'Test dynamic action',
                    path: '/relative/path',
                    chains: {
                        source: 43113,
                    },
                    params: [
                        {
                            type: 'string',
                            name: 'param1',
                            label: 'Test Parameter 1',
                            description: 'Test parameter 1',
                            required: true,
                        },
                        {
                            type: 'number',
                            name: 'param2',
                            label: 'Test Parameter 2',
                            description: 'Test parameter 2',
                            required: false,
                        },
                    ],
                } as DynamicAction,
            ],
        };

        expect(() => createMetadata(invalidMetadata)).toThrow(
            /Dynamic action .* has a relative path .* but no baseUrl is provided/,
        );
    });

    it('should succeed when dynamic action has an absolute path without baseUrl', () => {
        const validMetadata: Metadata = {
            url: 'https://swap.sherry.social',
            title: 'Test App',
            icon: 'https://example.com/icon.png',
            description: 'Test description',
            // Missing baseUrl intentionally
            actions: [
                {
                    label: 'Dynamic Action',
                    type: 'dynamic',
                    description: 'Test dynamic action',
                    path: 'https://api.example.com/action',
                    chains: {
                        source: 43113,
                    },
                },
            ],
        };

        expect(() => createMetadata(validMetadata)).not.toThrow();
    });

    it('should succeed when dynamic action has a relative path with baseUrl', () => {
        const validMetadata: Metadata = {
            url: 'https://swap.sherry.social',
            title: 'Test App',
            icon: 'https://example.com/icon.png',
            description: 'Test description',
            baseUrl: 'https://api.example.com', // Providing baseUrl
            actions: [
                {
                    label: 'Dynamic Action',
                    type: 'dynamic',
                    description: 'Test dynamic action',
                    path: '/relative/path',
                    chains: {
                        source: 43113,
                    },
                },
            ],
        };

        expect(() => createMetadata(validMetadata)).not.toThrow();
    });
});
