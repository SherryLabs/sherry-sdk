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
                label: 'Test Action 2',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                abi: exampleAbi,
                functionName: 'safeTransferFrom',
                paramsValue: ['sender', '0x1234567890abcdef1234567890abcdef12345678', 1],
                paramsLabel: ['From'],
                chains: { source: 'fuji' },
            },
            {
                label: 'Test Action 2',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                abi: exampleAbi,
                functionName: 'safeTransferFrom',
                chains: { source: 'fuji' },
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
