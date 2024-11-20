import { createMetadata } from '../interfaces/BlockchainActionV2';
import { Metadata } from '../interfaces/MetadataV2';

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
    ] as const

    const metadata: Metadata = {
        type: "action",
        icon: "icon",
        title: "title",
        description: "description",
        actions: [
            {
                label: "Test Action",
                contractAddress: "0x1234567890abcdef1234567890abcdef1234567",
                contractABI: exampleAbi,
                functionName: "balanceOf",
                transactionParamsLabel: ["Owner"],
                chainId: "ethereum"
            },
            {
                label: "Test Action 2",
                contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
                contractABI: exampleAbi,
                functionName: "balanceOf",
                transactionParamsLabel: ["Owner Address"],
                chainId: "ethereum"
            }
        ]
    };
    try {
        const result = await createMetadata(metadata);
        console.log('Metadata created successfully:', result);
    } catch (error) {
        console.error('Error creating metadata:', error);
    }
}

main();