import { createMetadata, Metadata } from '../src/index';

async function main() {
    const exampleAbi = [
        {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'owner', type: 'address' }],
            outputs: [{ name: 'balance', type: 'uint256' }],
        },
        {
            name: 'safeTransferFrom',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'tokenId', type: 'uint256' },
            ],
            outputs: [],
        },
    ] as const;

    const metadata: Metadata = {
        url: 'google.com',
        icon: 'icon',
        title: 'title',
        description: 'description',
        actions: [
            {
                type: 'blockchain',
                label: 'Test Action 2',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                abi: exampleAbi,
                functionName: 'safeTransferFrom',
                chains: { source: 43113 },
            },
            {
                type: 'blockchain',
                label: 'Test Action 2',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                abi: exampleAbi,
                functionName: 'safeTransferFrom',
                chains: { source: 43113 },
            },
        ],
    };
    try {
        await createMetadata(metadata);
    } catch (error) {
        console.error('Error creating metadata:', error);
        throw error;
    }
}

main();
