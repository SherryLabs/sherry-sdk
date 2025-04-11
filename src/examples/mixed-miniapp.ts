import { Metadata } from '../interface/metadata';
import { TransferAction } from '../interface/transferAction';
import { BlockchainActionMetadata } from '../interface/blockchainAction';
import { HttpAction } from '../interface/httpAction';
import { PARAM_TEMPLATES, createParameter } from '../templates/templates';

// Simple ERC20 ABI (just the approve function)
const erc20Abi = [
    {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
] as const;

// Mixed Action Mini-App that combines all action types
export const mixedActionMiniApp: Metadata = {
    url: 'https://multi.sherry.social',
    icon: 'https://example.com/multi-icon.png',
    title: 'Multi-Action App',
    description: 'Demonstrates all action types in one mini-app',
    actions: [
        // HTTP Action - Submit feedback form
        {
            label: 'Submit Feedback',
            endpoint: 'https://api.example.com/feedback',
            params: [
                {
                    name: 'email',
                    label: 'Email Address',
                    type: 'email',
                    required: true,
                },
                {
                    name: 'rating',
                    label: 'Rating',
                    type: 'select',
                    required: true,
                    options: [
                        { label: '⭐', value: 1 },
                        { label: '⭐⭐', value: 2 },
                        { label: '⭐⭐⭐', value: 3 },
                        { label: '⭐⭐⭐⭐', value: 4 },
                        { label: '⭐⭐⭐⭐⭐', value: 5 },
                    ],
                },
                {
                    name: 'comment',
                    label: 'Comments',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Tell us what you think',
                },
            ],
        } as HttpAction,

        // Transfer Action - Tip developer
        {
            label: 'Tip Developer',
            description: 'Support the developer with a small donation',
            chains: { source: 'avalanche' },
            to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address as example
            amountConfig: {
                inputType: 'radio',
                label: 'Tip Amount',
                required: true,
                options: [
                    { label: 'Small Tip', value: 0.01, description: '0.01 AVAX' },
                    { label: 'Standard Tip', value: 0.05, description: '0.05 AVAX' },
                    { label: 'Premium Tip', value: 0.1, description: '0.1 AVAX' },
                ],
            },
        } as TransferAction,

        // Blockchain Action - Token Approval
        {
            label: 'Approve Token',
            description: 'Approve app to use your tokens',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`,
            abi: erc20Abi,
            functionName: 'approve',
            chains: { source: 'fuji' },
            params: [
                // Spender address (app contract)
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'spender',
                    label: 'App Contract',
                    value: '0x1234567890123456789012345678901234567890',
                    fixed: true,
                }),
                // Amount to approve
                createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
                    name: 'amount',
                    label: 'Amount to Approve',
                    placeholder: 'Enter amount',
                    min: 1,
                }),
            ],
        } as BlockchainActionMetadata,
    ],
};

// Export for easy access
export default mixedActionMiniApp;
