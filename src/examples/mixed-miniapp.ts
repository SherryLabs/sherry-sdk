import { Metadata } from '../interface/metadata';
import { TransferAction } from '../interface/actions/transferAction';
import { BlockchainActionMetadata } from '../interface/actions/blockchainAction';
import { HttpAction } from '../interface/actions/httpAction';
import { PARAM_TEMPLATES, createParameter } from '../templates/templates';
import { NumberBasedParameter, TextBasedParameter, SelectParameter } from '../interface/inputs';

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
            type: 'http',
            label: 'Submit Feedback',
            path: 'https://api.example.com/feedback',
            params: [
                // Corrección: especificar el tipo correcto para email
                {
                    name: 'email',
                    label: 'Email Address',
                    type: 'email',
                    required: true,
                } as TextBasedParameter,

                // Corrección: especificar el tipo correcto para select
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
                } as SelectParameter,

                // Corrección: especificar el tipo correcto para textarea
                {
                    name: 'comment',
                    label: 'Comments',
                    type: 'textarea',
                    required: false,
                } as TextBasedParameter,
            ],
        } as HttpAction,

        // Transfer Action - Tip developer
        {
            label: 'Tip Developer',
            type: 'transfer',
            chains: { source: 43114 },
            to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address as example
            amountConfig: {
                type: 'radio',
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
            type: 'blockchain',
            description: 'Approve app to use your tokens',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`,
            abi: erc20Abi,
            functionName: 'approve',
            chains: { source: 43113 },
            params: [
                // Spender address (app contract)
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'spender',
                    label: 'App Contract',
                    value: '0x1234567890123456789012345678901234567890',
                    fixed: true,
                }),

                // Corrección: usar AMOUNT en lugar de TOKEN_SELECT para cantidad
                createParameter(PARAM_TEMPLATES.AMOUNT, {
                    name: 'amount',
                    label: 'Amount to Approve',
                    // Valor máximo para aprobación completa (2^256-1)
                    value: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                }),
            ],
        } as BlockchainActionMetadata,
    ],
};

// Export for easy access
export default mixedActionMiniApp;
