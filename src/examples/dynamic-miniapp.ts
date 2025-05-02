import { DynamicAction } from '../interface';
import { SelectParameter, SelectOption } from '../interface/inputs';
import { Metadata } from '../interface/metadata';

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

// Define the mini-app metadata
const avaxToUsdtSwapApp: Metadata = {
    url: 'https://swap.sherry.social',
    icon: 'https://yt3.googleusercontent.com/1qlR7YjX35zWwLQ2ZFQAa9X_Ozj4PydyQI-JK_pA3Cks80rU-Q6Kx6jGrF8d_KbSGuP1z0F7=s900-c-k-c0x00ffffff-no-rj',
    title: 'AVAX to USDT Swap',
    description: 'Swap AVAX for USDT on Trader Joe V2.2',
    baseUrl: 'https://swap.sherry.social',
    actions: [
        {
            label: 'Dynamic SWAP',
            type: 'dynamic',
            description: 'Dynamic Swap',
            path: '/swapExactTokensForTokens',
            chains: {
                source: 'fuji',
            },
        } as DynamicAction,
        {
            label: 'Dynamic SWAP',
            type: 'dynamic',
            description: 'Dynamic Swap',
            path: '/swapExactTokensForTokens',
            chains: {
                source: 'fuji',
            },
            params: [
                {
                    name: 'amountOutMin',
                    label: 'Minimum Amount Out',
                    description: 'Minimum amount of tokens to receive from the swap',
                    required: true,
                    type: 'select',
                    value: {
                        options: [
                            {
                                label: '0.1',
                                value: '0.1',
                            },
                            {
                                label: '0.2',
                                value: '0.2',
                            },
                            {
                                label: '0.3',
                                value: '0.3',
                            },
                        ] ,
                    } ,
                },
                {
                    name: 'to',
                    label: 'Recipient Address',
                    description: 'Address to receive the swapped tokens',
                    required: true,
                    type: 'select',
                    value: {
                        options: [
                            {
                                label: '0x1234567890abcdef1234567890abcdef12345678',
                                value: '0x1234567890abcdef1234567890abcdef12345678',
                            },
                            {
                                label: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
                                value: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
                            },
                        ] ,
                    } ,
                },
            ],
        } as DynamicAction,
    ],
};
