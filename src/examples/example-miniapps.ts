// example-miniapps.ts
import { AmountConfig, Metadata, RecipientConfig, TransferAction } from '../interface';
import {
    TextBasedParameter,
    NumberBasedParameter,
    AddressParameter,
    BooleanParameter,
    SelectParameter,
    RadioParameter,
} from '../interface/inputs';
import {
    PARAM_TEMPLATES,
    createParameter,
    createSelectParam,
    createRadioParam,
} from '../templates/templates';

// ============== 1. TOKEN SWAP MINI-APP ==============

// ERC20 ABI (simplified for example)
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

// Uniswap Router ABI (simplified for example)
const uniswapRouterAbi = [
    {
        name: 'swapExactTokensForTokens',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'amountIn', type: 'uint256' },
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
    },
    {
        name: 'swapExactAVAXForTokens',
        type: 'function',
        stateMutability: 'payable',
        inputs: [
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
    },
] as const;

// Token Swap Mini-App
export const tokenSwapMiniApp = {
    url: 'https://swap.sherry.social',
    icon: 'https://example.com/swap-icon.png',
    title: 'Token Swap',
    description: 'Swap tokens easily with the best rates',
    actions: [
        // Action 1: Approve Token
        {
            label: 'Approve Token',
            title: 'Approve Token for Swap',
            description: 'Approve tokens to be used by the swap router',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`, // 0xERC20TokenAddress
            abi: erc20Abi,
            functionName: 'approve',
            chains: { source: 43114 },
            params: [
                // Router address (spender)
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'spender',
                    label: 'Router Address',
                    value: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52', // Router address
                    fixed: true, // User cannot change this
                }),
                // Amount to approve
                {
                    name: 'amount',
                    label: 'Amount to Approve',
                    type: 'uint256',
                    value: '115792089237316195423570985008687907853269984665640564039457584007913129639935', // uint256 max
                    fixed: true, // User cannot change this
                    description: 'Maximum approval amount',
                } as NumberBasedParameter,
            ],
        },

        // Action 2: Swap Tokens
        {
            label: 'Swap Tokens',
            title: 'Swap Your Tokens',
            description: 'Trade tokens at the best available rates',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`, // 0xUniswapRouterAddress
            abi: uniswapRouterAbi,
            functionName: 'swapExactTokensForTokens',
            chains: { source: 43114 },
            params: [
                // Amount In
                {
                    name: 'amountIn',
                    label: 'Amount to Swap',
                    type: 'uint256',
                    required: true,
                    min: 0.000001,
                    description: 'Amount of tokens to swap',
                } as NumberBasedParameter,

                // Minimum Amount Out (with slippage)
                {
                    name: 'amountOutMin',
                    label: 'Minimum Received (0.5% slippage)',
                    type: 'uint256',
                    required: true,
                    value: '0', // Will be calculated frontend based on amountIn
                    description: 'Minimum amount to receive after slippage',
                } as NumberBasedParameter,

                // Token Path - Ahora usando SelectParameter para el path
                createSelectParam(
                    'path',
                    'Token Path',
                    [
                        {
                            label: 'AVAX -> USDC',
                            value: ['0xTokenAAddress', '0xTokenBAddress'],
                            description: 'Swap AVAX for USDC',
                        },
                        {
                            label: 'AVAX -> USDT',
                            value: ['0xTokenAAddress', '0xTokenCAddress'],
                            description: 'Swap AVAX for USDT',
                        },
                    ],
                    true,
                    'Select the token swap path',
                ),

                // Recipient
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'to',
                    label: 'Recipient',
                    value: 'sender', // Special value meaning current user
                }),

                // Deadline
                {
                    name: 'deadline',
                    label: 'Expires After',
                    type: 'uint256',
                    required: true,
                    value: Math.floor(Date.now() / 1000) + 1200, // 20 minutes from now
                    fixed: true, // User cannot change this
                    description: 'Transaction will revert after this time',
                } as NumberBasedParameter,
            ],
        },

        // Action 3: Swap AVAX for Tokens
        {
            label: 'Swap AVAX for Tokens',
            title: 'Swap AVAX for Tokens',
            description: 'Trade AVAX for tokens at the best rates',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`, // 0xUniswapRouterAddress
            abi: uniswapRouterAbi,
            functionName: 'swapExactAVAXForTokens',
            chains: { source: 43114 },
            amount: 0.1, // Send 0.1 AVAX with transaction
            params: [
                // Minimum Amount Out (with slippage)
                {
                    name: 'amountOutMin',
                    label: 'Minimum Received (0.5% slippage)',
                    type: 'uint256',
                    required: true,
                    value: '0', // Will be calculated frontend based on amount
                    description: 'Minimum tokens to receive after slippage',
                } as NumberBasedParameter,

                // Token Path
                createSelectParam(
                    'path',
                    'Token Path',
                    [
                        {
                            label: 'AVAX -> USDC',
                            value: ['0xWAVAXAddress', '0xTokenBAddress'],
                            description: 'Swap AVAX for USDC',
                        },
                        {
                            label: 'AVAX -> USDT',
                            value: ['0xWAVAXAddress', '0xTokenCAddress'],
                            description: 'Swap AVAX for USDT',
                        },
                    ],
                    true,
                    'Select the token swap path',
                ),

                // Recipient
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'to',
                    label: 'Recipient',
                    value: 'sender', // Special value meaning current user
                }),

                // Deadline
                {
                    name: 'deadline',
                    label: 'Expires After',
                    type: 'uint256',
                    required: true,
                    value: Math.floor(Date.now() / 1000) + 1200, // 20 minutes from now
                    fixed: true, // User cannot change this
                    description: 'Transaction will revert after this time',
                } as NumberBasedParameter,
            ],
        },
    ],
};

// ============== 2. NFT MARKETPLACE MINI-APP ==============

// NFT Marketplace ABI (simplified)
const nftMarketplaceAbi = [
    {
        name: 'createListing',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'nftAddress', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'price', type: 'uint256' },
            { name: 'expiresAt', type: 'uint256' },
        ],
        outputs: [{ name: 'listingId', type: 'uint256' }],
    },
    {
        name: 'buyNFT',
        type: 'function',
        stateMutability: 'payable',
        inputs: [{ name: 'listingId', type: 'uint256' }],
        outputs: [],
    },
    {
        name: 'cancelListing',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'listingId', type: 'uint256' }],
        outputs: [],
    },
] as const;

// NFT Marketplace Mini-App
export const nftMarketplaceMiniApp = {
    url: 'https://nft.sherry.social',
    icon: 'https://example.com/nft-icon.png',
    title: 'NFT Marketplace',
    description: 'List and trade your NFT collections',
    actions: [
        // Action 1: List NFT for Sale
        {
            label: 'List NFT',
            title: 'List Your NFT for Sale',
            description: 'Create a new listing for your NFT',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`, // 0xNFTMarketplaceAddress
            abi: nftMarketplaceAbi,
            functionName: 'createListing',
            chains: { source: 43113 },
            params: [
                // NFT Contract Address
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'nftAddress',
                    label: 'NFT Collection Address',
                }),

                // Token ID
                {
                    name: 'tokenId',
                    label: 'NFT ID',
                    type: 'uint256',
                    required: true,
                    description: 'ID of the NFT you want to sell',
                    min: 1,
                } as NumberBasedParameter,

                // Price
                {
                    name: 'price',
                    label: 'Price in AVAX',
                    type: 'uint256',
                    required: true,
                    min: 0.01,
                    description: 'Listing price in AVAX',
                } as NumberBasedParameter,

                // Expiration time
                {
                    name: 'expiresAt',
                    label: 'Expires After',
                    type: 'datetime',
                    required: true,
                    value: Math.floor(Date.now() / 1000) + 604800, // 1 week from now
                    description: 'When the listing will expire',
                } as NumberBasedParameter,
            ],
        },

        // Action 2: Buy NFT
        {
            label: 'Buy NFT',
            title: 'Purchase NFT',
            description: 'Buy an NFT from the marketplace',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`, // 0xNFTMarketplaceAddress
            abi: nftMarketplaceAbi,
            functionName: 'buyNFT',
            chains: { source: 43113 },
            params: [
                // Listing ID
                {
                    name: 'listingId',
                    label: 'Listing ID',
                    type: 'uint256',
                    required: true,
                    description: 'ID of the listing you want to purchase',
                } as NumberBasedParameter,
            ],
        },

        // Action 3: Cancel Listing
        {
            label: 'Cancel Listing',
            title: 'Cancel NFT Listing',
            description: 'Remove your NFT from the marketplace',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`, // 0xNFTMarketplaceAddress
            abi: nftMarketplaceAbi,
            functionName: 'cancelListing',
            chains: { source: 43113 },
            params: [
                // Listing ID
                {
                    name: 'listingId',
                    label: 'Listing ID',
                    type: 'uint256',
                    required: true,
                    description: 'ID of the listing you want to cancel',
                } as NumberBasedParameter,
            ],
        },
    ],
};

// ============== 3. DAO VOTING MINI-APP ==============

// DAO Voting ABI (simplified)
const daoVotingAbi = [
    {
        name: 'createProposal',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'actions', type: 'bytes' },
            { name: 'expiresAt', type: 'uint256' },
        ],
        outputs: [{ name: 'proposalId', type: 'uint256' }],
    },
    {
        name: 'vote',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'proposalId', type: 'uint256' },
            { name: 'support', type: 'bool' },
        ],
        outputs: [],
    },
    {
        name: 'executeProposal',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'proposalId', type: 'uint256' }],
        outputs: [],
    },
] as const;

// DAO Voting Mini-App
export const daoVotingMiniApp = {
    url: 'https://dao.sherry.social',
    icon: 'https://example.com/dao-icon.png',
    title: 'DAO Governance',
    description: 'Create and vote on proposals for the community',
    actions: [
        // Action 1: Create Proposal
        {
            label: 'Create Proposal',
            title: 'Submit a New Proposal',
            description: 'Create a new governance proposal for the community',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`, // 0xDAOVotingAddress
            abi: daoVotingAbi,
            functionName: 'createProposal',
            chains: { source: 42220 },
            params: [
                // Title
                {
                    name: 'title',
                    label: 'Proposal Title',
                    type: 'string',
                    required: true,
                    minLength: 10,
                    maxLength: 100,
                    description: 'A concise title for your proposal',
                } as TextBasedParameter,

                // Description - Usando textarea en lugar de text
                {
                    name: 'description',
                    label: 'Proposal Description',
                    type: 'textarea',
                    required: true,
                    minLength: 50,
                    maxLength: 5000,
                    description: 'Detailed explanation of your proposal',
                } as TextBasedParameter,

                // Actions (encoded)
                {
                    name: 'actions',
                    label: 'Encoded Actions',
                    type: 'bytes',
                    required: true,
                    value: '0x', // Empty bytes for simple proposals
                    fixed: true, // User cannot change this
                    description: 'Technical: encoded on-chain actions',
                } as TextBasedParameter,

                // Expiration time
                {
                    name: 'expiresAt',
                    label: 'Voting Period Ends',
                    type: 'datetime',
                    required: true,
                    value: Math.floor(Date.now() / 1000) + 604800, // 1 week from now
                    description: 'When voting on this proposal will end',
                } as NumberBasedParameter,
            ],
        },

        // Action 2: Vote on Proposal
        {
            label: 'Vote',
            title: 'Vote on Proposal',
            description: 'Cast your vote on a governance proposal',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`,
            abi: daoVotingAbi,
            functionName: 'vote',
            chains: { source: 42220 },
            params: [
                // Proposal ID
                {
                    name: 'proposalId',
                    label: 'Proposal ID',
                    type: 'uint256',
                    required: true,
                    description: 'ID of the proposal you want to vote on',
                } as NumberBasedParameter,

                // Support (yes/no)
                {
                    name: 'support',
                    label: 'Your Vote',
                    type: 'boolean',
                    required: true,
                    description: 'Select whether you support this proposal',
                } as BooleanParameter,
            ],
        },

        // Action 3: Execute Proposal
        {
            label: 'Execute Proposal',
            title: 'Execute Approved Proposal',
            description: 'Execute a proposal that has passed governance',
            address: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52' as `0x${string}`,
            abi: daoVotingAbi,
            functionName: 'executeProposal',
            chains: { source: 42220 },
            params: [
                // Proposal ID
                {
                    name: 'proposalId',
                    label: 'Proposal ID',
                    type: 'uint256',
                    required: true,
                    description: 'ID of the approved proposal to execute',
                } as NumberBasedParameter,
            ],
        },
    ],
};

// ============== 4. FUNDRAISING MINI-APP ==============

// Fundraising ABI (simplified)
const fundraisingAbi = [
    {
        name: 'createCampaign',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'goal', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'beneficiary', type: 'address' },
        ],
        outputs: [{ name: 'campaignId', type: 'uint256' }],
    },
    {
        name: 'donate',
        type: 'function',
        stateMutability: 'payable',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [],
    },
    {
        name: 'claimFunds',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'campaignId', type: 'uint256' }],
        outputs: [],
    },
] as const;

// Fundraising Mini-App
export const fundraisingMiniApp = {
    url: 'https://fundraise.sherry.social',
    icon: 'https://example.com/fundraise-icon.png',
    title: 'Fundraising Platform',
    description: 'Create and support fundraising campaigns',
    actions: [
        // Action 1: Create Campaign
        {
            label: 'Create Campaign',
            title: 'Start a Fundraising Campaign',
            description: 'Launch a new fundraising campaign',
            address: '0xFundraisingAddress' as `0x${string}`,
            abi: fundraisingAbi,
            functionName: 'createCampaign',
            chains: { source: 43113 },
            params: [
                // Title
                {
                    name: 'title',
                    label: 'Campaign Title',
                    type: 'string',
                    required: true,
                    minLength: 5,
                    maxLength: 100,
                    description: 'A title for your fundraising campaign',
                } as TextBasedParameter,

                // Description - Usando textarea
                {
                    name: 'description',
                    label: 'Campaign Description',
                    type: 'textarea',
                    required: true,
                    minLength: 50,
                    maxLength: 2000,
                    description: 'Describe the purpose of your campaign',
                } as TextBasedParameter,

                // Goal amount
                {
                    name: 'goal',
                    label: 'Funding Goal (AVAX)',
                    type: 'uint256',
                    required: true,
                    min: 0.1,
                    description: 'Target amount to raise in AVAX',
                } as NumberBasedParameter,

                // Deadline
                {
                    name: 'deadline',
                    label: 'Campaign Deadline',
                    type: 'datetime',
                    required: true,
                    min: Math.floor(Date.now() / 1000) + 86400, // At least 1 day from now
                    description: 'When your fundraising campaign will end',
                } as NumberBasedParameter,

                // Beneficiary
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'beneficiary',
                    label: 'Beneficiary Address',
                    value: 'sender', // Default to current user
                }),
            ],
        },

        // Action 2: Donate to Campaign
        {
            label: 'Donate',
            title: 'Support a Campaign',
            description: 'Donate to a fundraising campaign',
            address: '0xFundraisingAddress' as `0x${string}`,
            abi: fundraisingAbi,
            functionName: 'donate',
            chains: { source: 43113 },
            amount: 0.1, // Default donation of 0.1 AVAX
            params: [
                // Campaign ID
                {
                    name: 'campaignId',
                    label: 'Campaign ID',
                    type: 'uint256',
                    required: true,
                    description: 'ID of the campaign you want to support',
                } as NumberBasedParameter,
            ],
        },

        // Action 3: Claim Funds
        {
            label: 'Claim Funds',
            title: 'Claim Campaign Funds',
            description: 'Withdraw funds from a successful campaign',
            address: '0xFundraisingAddress' as `0x${string}`,
            abi: fundraisingAbi,
            functionName: 'claimFunds',
            chains: { source: 43113 },
            params: [
                // Campaign ID
                {
                    name: 'campaignId',
                    label: 'Campaign ID',
                    type: 'uint256',
                    required: true,
                    description: 'ID of the campaign to claim funds from',
                } as NumberBasedParameter,
            ],
        },
    ],
};

// ============== 5. CROSS-CHAIN BRIDGE MINI-APP ==============

// Bridge ABI (simplified)
const bridgeAbi = [
    {
        name: 'bridgeTokens',
        type: 'function',
        stateMutability: 'payable',
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'recipient', type: 'address' },
            { name: 'destinationChainId', type: 'uint256' },
        ],
        outputs: [],
    },
] as const;

// Cross-Chain Bridge Mini-App
export const bridgeMiniApp: Metadata = {
    url: 'https://bridge.sherry.social',
    icon: 'https://example.com/bridge-icon.png',
    title: 'Cross-Chain Bridge',
    description: 'Bridge your assets across multiple blockchains',
    actions: [
        // Action: Bridge Tokens
        {
            label: 'Bridge Tokens',
            type: 'blockchain',
            address: '0xBridgeAddress' as `0x${string}`,
            abi: bridgeAbi,
            functionName: 'bridgeTokens',
            chains: { source: 43114, destination: 42220 },
            params: [
                // Token address - Ahora usando select para tokens predefinidos
                createSelectParam(
                    'token',
                    'Select Token',
                    [
                        {
                            label: 'USDC',
                            value: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
                            description: 'USD Coin',
                        },
                        {
                            label: 'USDT',
                            value: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
                            description: 'Tether USD',
                        },
                        {
                            label: 'DAI',
                            value: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
                            description: 'Dai Stablecoin',
                        },
                    ],
                    true,
                    'Select the token you want to bridge',
                ),

                // Amount
                {
                    name: 'amount',
                    label: 'Amount to Bridge',
                    type: 'uint256',
                    required: true,
                    min: 0.000001,
                    description: 'Amount of tokens to send to the destination chain',
                } as NumberBasedParameter,

                // Recipient
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'recipient',
                    label: 'Destination Address',
                    value: 'sender', // Default to current user
                }),

                // Destination Chain ID
                {
                    name: 'destinationChainId',
                    label: 'Destination Chain',
                    type: 'uint256',
                    required: true,
                    value: 42220, // Celo chain ID
                    fixed: true, // User cannot change this
                    description: 'Chain ID of the destination blockchain',
                } as NumberBasedParameter,
            ],
        },
    ],
};

// ============== 6. SIMPLE TRANSFER MINI-APP ==============
// Adding a simple transfer app as example for transfer actions

export const simpleTransferMiniApp: Metadata = {
    url: 'https://transfer.sherry.social',
    icon: 'https://example.com/transfer-icon.png',
    title: 'Simple Transfer',
    description: 'Transfer tokens to another address',
    actions: [
        // Action: Simple Transfer
        {
            type: 'transfer',
            label: 'Transfer AVAX',
            chains: { source: 43113 },
            to: '0x1234567890123456789012345678901234567890',
            amount: 0.1,
        },
        // Action: Transfer with recipient selection
        {
            type: 'transfer',
            label: 'Send to Recipient',
            chains: { source: 43114 },
            recipient: {
                type: 'select',
                label: 'Select Recipient',
                required: true,
                options: [
                    {
                        label: 'Alice',
                        value: '0x1111111111111111111111111111111111111111',
                        description: 'Project Lead',
                    },
                    {
                        label: 'Bob',
                        value: '0x2222222222222222222222222222222222222222',
                        description: 'Developer',
                    },
                    {
                        label: 'Charlie',
                        value: '0x3333333333333333333333333333333333333333',
                        description: 'Designer',
                    },
                ],
            } as RecipientConfig,
            amountConfig: {
                type: 'radio',
                label: 'Amount',
                required: true,
                options: [
                    { label: 'Small', value: 0.01, description: '0.01 AVAX' },
                    { label: 'Medium', value: 0.05, description: '0.05 AVAX' },
                    { label: 'Large', value: 0.1, description: '0.1 AVAX' },
                ],
            } as AmountConfig,
        },
    ],
};

// ============== 7. ALL PARAMETER TYPES DEMO ==============
// Adding a demo app to showcase all parameter types

export const parameterTypesDemoMiniApp: Metadata = {
    url: 'https://demo.sherry.social',
    icon: 'https://example.com/demo-icon.png',
    title: 'Parameter Types Demo',
    description: 'Showcase all parameter types in the SDK',
    actions: [
        {
            label: 'Text Parameters',
            type: 'blockchain',
            address: '0xDemoAddress' as `0x${string}`,
            abi: [],
            functionName: 'textDemo',
            chains: { source: 43113 },
            params: [
                // Text parameter
                {
                    name: 'textInput',
                    label: 'Text Input',
                    type: 'text',
                    required: true,
                    minLength: 3,
                    maxLength: 50,
                    description: 'Standard text input with length limits',
                } as TextBasedParameter,

                // Email parameter
                {
                    name: 'emailInput',
                    label: 'Email Address',
                    type: 'email',
                    required: true,
                    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
                    description: 'Email input with validation',
                } as TextBasedParameter,

                // URL parameter
                {
                    name: 'urlInput',
                    label: 'Website URL',
                    type: 'url',
                    required: false,
                    description: 'URL input with built-in validation',
                } as TextBasedParameter,

                // Textarea parameter
                {
                    name: 'textareaInput',
                    label: 'Long Text',
                    type: 'textarea',
                    required: false,
                    minLength: 10,
                    maxLength: 1000,
                    description: 'Multi-line text input for longer content',
                } as TextBasedParameter,

                // Bytes parameter
                {
                    name: 'bytesInput',
                    label: 'Hex Data',
                    type: 'bytes',
                    required: false,
                    pattern: '^0x[a-fA-F0-9]*$',
                    description: 'Hexadecimal data input',
                } as TextBasedParameter,
            ],
        },
        {
            label: 'Number Parameters',
            type: 'blockchain',
            address: '0xDemoAddress' as `0x${string}`,
            abi: [],
            functionName: 'numberDemo',
            chains: { source: 43113 },
            params: [
                // Number parameter
                {
                    name: 'numberInput',
                    label: 'Number',
                    type: 'number',
                    required: true,
                    min: 0,
                    max: 100,
                    description: 'Standard number input with range',
                } as NumberBasedParameter,

                // Integer parameter (uint256)
                {
                    name: 'integerInput',
                    label: 'Integer (uint256)',
                    type: 'uint256',
                    required: true,
                    min: 1,
                    description: 'Integer input for blockchain values',
                } as NumberBasedParameter,

                // Datetime parameter
                {
                    name: 'datetimeInput',
                    label: 'Date and Time',
                    type: 'datetime',
                    required: true,
                    min: Math.floor(Date.now() / 1000),
                    description: 'Date/time input as unix timestamp',
                } as NumberBasedParameter,
            ],
        },
        {
            label: 'Selection Parameters',
            type: 'blockchain',
            address: '0xDemoAddress' as `0x${string}`,
            abi: [],
            functionName: 'selectionDemo',
            chains: { source: 43113 },
            params: [
                // Select parameter
                createSelectParam(
                    'selectInput',
                    'Dropdown Select',
                    [
                        { label: 'Option 1', value: '1', description: 'First option' },
                        { label: 'Option 2', value: '2', description: 'Second option' },
                        { label: 'Option 3', value: '3', description: 'Third option' },
                    ],
                    true,
                    'Standard dropdown selection',
                ),

                // Radio parameter
                createRadioParam(
                    'radioInput',
                    'Radio Selection',
                    [
                        { label: 'Red', value: 'red', description: 'Red color' },
                        { label: 'Green', value: 'green', description: 'Green color' },
                        { label: 'Blue', value: 'blue', description: 'Blue color' },
                    ],
                    true,
                    'Radio button selection',
                ),

                // Boolean parameter
                {
                    name: 'booleanInput',
                    label: 'Boolean Switch',
                    type: 'boolean',
                    required: true,
                    description: 'ON/OFF toggle switch',
                } as BooleanParameter,

                // Yes/No radio
                createParameter(PARAM_TEMPLATES.YES_NO, {
                    name: 'yesNoInput',
                    label: 'Confirm Choice',
                    description: 'Yes/No selection using radio buttons',
                }),

                // Address parameter
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'addressInput',
                    label: 'Ethereum Address',
                    description: 'Ethereum wallet address input with validation',
                }),
            ],
        },
    ],
};

// Export all mini-apps
export const miniApps = {
    tokenSwap: tokenSwapMiniApp,
    nftMarketplace: nftMarketplaceMiniApp,
    daoVoting: daoVotingMiniApp,
    fundraising: fundraisingMiniApp,
    bridge: bridgeMiniApp,
    simpleTransfer: simpleTransferMiniApp,
    parameterTypesDemo: parameterTypesDemoMiniApp, // Nuevo mini-app de demo
};
