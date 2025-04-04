// example-miniapps.ts
import { StandardParameter } from '../interface/blockchainAction';
import { PARAM_TEMPLATES, createParameter } from '../templates/templates';

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
            chains: { source: 'avalanche' },
            params: [
                // Router address (spender)
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'spender',
                    label: 'Router Address',
                    value: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52', // 0xUniswapRouterAddress - Pre-filled with router address
                    fixed: true, // User cannot change this
                }),
                // Amount to approve
                createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
                    name: 'amount',
                    label: 'Amount to Approve',
                    value: '115792089237316195423570985008687907853269984665640564039457584007913129639935', // uint256 max
                    fixed: true, // User cannot change this
                }),
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
            chains: { source: 'avalanche' },
            params: [
                // Amount In
                createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
                    name: 'amountIn',
                    label: 'Amount to Swap',
                    placeholder: 'Enter amount',
                }),
                // Minimum Amount Out (with slippage)
                createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
                    name: 'amountOutMin',
                    label: 'Minimum Received (0.5% slippage)',
                    value: '0', // Will be calculated frontend based on amountIn
                }),
                // Token Path
                {
                    name: 'path',
                    type: 'address' as const,
                    label: 'Token Path',
                    required: true,
                    value: ['0xTokenAAddress', '0xTokenBAddress'], // Pre-filled path
                    fixed: true, // User cannot change this
                } as StandardParameter,
                // Recipient
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'to',
                    label: 'Recipient',
                    value: 'sender', // Special value meaning current user
                }),
                // Deadline
                {
                    name: 'deadline',
                    type: 'number' as const,
                    label: 'Expires After',
                    required: true,
                    value: Math.floor(Date.now() / 1000) + 1200, // 20 minutes from now
                    fixed: true, // User cannot change this
                } as StandardParameter,
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
            chains: { source: 'avalanche' },
            amount: 0.1, // Send 0.1 AVAX with transaction
            params: [
                // Minimum Amount Out (with slippage)
                createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
                    name: 'amountOutMin',
                    label: 'Minimum Received (0.5% slippage)',
                    value: '0', // Will be calculated frontend based on amount
                }),
                // Token Path
                {
                    name: 'path',
                    type: 'address' as const,
                    label: 'Token Path',
                    required: true,
                    value: ['0xWAVAXAddress', '0xTokenBAddress'], // Pre-filled path
                    fixed: true, // User cannot change this
                } as StandardParameter,
                // Recipient
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'to',
                    label: 'Recipient',
                    value: 'sender', // Special value meaning current user
                }),
                // Deadline
                {
                    name: 'deadline',
                    type: 'number' as const,
                    label: 'Expires After',
                    required: true,
                    value: Math.floor(Date.now() / 1000) + 1200, // 20 minutes from now
                    fixed: true, // User cannot change this
                } as StandardParameter,
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
            chains: { source: 'fuji' },
            params: [
                // NFT Contract Address
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'nftAddress',
                    label: 'NFT Collection Address',
                    placeholder: 'Enter NFT contract address',
                }),
                // Token ID
                createParameter(PARAM_TEMPLATES.NFT_ID, {
                    name: 'tokenId',
                    label: 'NFT ID',
                    placeholder: 'Enter NFT ID',
                }),
                // Price
                createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
                    name: 'price',
                    label: 'Price in AVAX',
                    placeholder: 'Enter price',
                }),
                // Expiration time
                {
                    name: 'expiresAt',
                    type: 'datetime' as const,
                    label: 'Expires After',
                    required: true,
                    value: Math.floor(Date.now() / 1000) + 604800, // 1 week from now
                } as StandardParameter,
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
            chains: { source: 'fuji' },
            params: [
                // Listing ID
                createParameter(PARAM_TEMPLATES.INTEGER, {
                    name: 'listingId',
                    label: 'Listing ID',
                    placeholder: 'Enter listing ID',
                }),
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
            chains: { source: 'fuji' },
            params: [
                // Listing ID
                createParameter(PARAM_TEMPLATES.INTEGER, {
                    name: 'listingId',
                    label: 'Listing ID',
                    placeholder: 'Enter listing ID',
                }),
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
            chains: { source: 'celo' },
            params: [
                // Title
                createParameter(PARAM_TEMPLATES.TEXT, {
                    name: 'title',
                    label: 'Proposal Title',
                    placeholder: 'Enter a concise title',
                    minLength: 10,
                    maxLength: 100,
                }),
                // Description
                createParameter(PARAM_TEMPLATES.TEXTAREA, {
                    name: 'description',
                    label: 'Proposal Description',
                    placeholder: 'Describe your proposal in detail',
                    minLength: 50,
                    maxLength: 5000,
                }),
                // Actions (encoded)
                {
                    name: 'actions',
                    type: 'text' as const,
                    label: 'Encoded Actions',
                    required: true,
                    value: '0x', // Empty bytes for simple proposals
                    fixed: true, // User cannot change this
                } as StandardParameter,
                // Expiration time
                {
                    name: 'expiresAt',
                    type: 'datetime' as const,
                    label: 'Voting Period Ends',
                    required: true,
                    value: Math.floor(Date.now() / 1000) + 604800, // 1 week from now
                } as StandardParameter,
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
            chains: { source: 'celo' },
            params: [
                // Proposal ID
                createParameter(PARAM_TEMPLATES.INTEGER, {
                    name: 'proposalId',
                    label: 'Proposal ID',
                    placeholder: 'Enter proposal ID',
                }),
                // Support (yes/no)
                createParameter(PARAM_TEMPLATES.BOOLEAN_RADIO, {
                    name: 'support',
                    label: 'Your Vote',
                }),
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
            chains: { source: 'celo' },
            params: [
                // Proposal ID
                createParameter(PARAM_TEMPLATES.INTEGER, {
                    name: 'proposalId',
                    label: 'Proposal ID',
                    placeholder: 'Enter proposal ID',
                }),
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
            chains: { source: 'fuji' },
            params: [
                // Title
                createParameter(PARAM_TEMPLATES.TEXT, {
                    name: 'title',
                    label: 'Campaign Title',
                    placeholder: 'Enter a catchy title',
                    minLength: 5,
                    maxLength: 100,
                }),
                // Description
                createParameter(PARAM_TEMPLATES.TEXTAREA, {
                    name: 'description',
                    label: 'Campaign Description',
                    placeholder: 'Describe your campaign goals',
                    minLength: 50,
                    maxLength: 2000,
                }),
                // Goal amount
                createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
                    name: 'goal',
                    label: 'Funding Goal (AVAX)',
                    placeholder: 'Enter funding goal',
                    min: 0.1,
                }),
                // Deadline
                {
                    name: 'deadline',
                    type: 'datetime' as const,
                    label: 'Campaign Deadline',
                    required: true,
                    min: Math.floor(Date.now() / 1000) + 86400, // At least 1 day from now
                } as StandardParameter,
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
            chains: { source: 'fuji' },
            amount: 0.1, // Default donation of 0.1 AVAX
            params: [
                // Campaign ID
                createParameter(PARAM_TEMPLATES.INTEGER, {
                    name: 'campaignId',
                    label: 'Campaign ID',
                    placeholder: 'Enter campaign ID',
                }),
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
            chains: { source: 'fuji' },
            params: [
                // Campaign ID
                createParameter(PARAM_TEMPLATES.INTEGER, {
                    name: 'campaignId',
                    label: 'Campaign ID',
                    placeholder: 'Enter campaign ID',
                }),
            ],
        },
    ],
};

// ============== 5. MARKET CREATION MINI-APP (COMPLEX EXAMPLE) ==============

// Market Factory ABI (simplified for example)
const marketFactoryAbi = [
    {
        name: 'createMarketAndToken',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'marketCreation',
                type: 'tuple',
                components: [
                    { name: 'tokenType', type: 'uint96' },
                    { name: 'name', type: 'string' },
                    { name: 'symbol', type: 'string' },
                    { name: 'quoteToken', type: 'address' },
                    { name: 'totalSupply', type: 'uint256' },
                    { name: 'creatorShare', type: 'uint16' },
                    { name: 'stakingShare', type: 'uint16' },
                    { name: 'bidPrices', type: 'uint256[]' },
                    { name: 'askPrices', type: 'uint256[]' },
                    { name: 'args', type: 'bytes' },
                ],
            },
        ],
        outputs: [
            { name: 'token', type: 'address' },
            { name: 'market', type: 'address' },
        ],
    },
] as const;

// Market Creation Mini-App
export const marketCreationMiniApp = {
    url: 'https://markets.sherry.social',
    icon: 'https://example.com/market-icon.png',
    title: 'Create Token Market',
    description: 'Launch your own token with a liquidity market',
    actions: [
        // Action: Create Market
        {
            label: 'Create Market',
            title: 'Create Token Market',
            description: 'Launch a new token with a built-in market',
            address: '0xMarketFactoryAddress' as `0x${string}`,
            abi: marketFactoryAbi,
            functionName: 'createMarketAndToken',
            chains: { source: 'fuji' },
            params: [
                // Market Creation Parameters (complex struct)
                {
                    name: 'marketCreation',
                    type: 'number' as const, // This is just a placeholder - struct handling is special
                    label: 'Market Parameters',
                    required: true,
                    value: {
                        tokenType: 1,
                        name: '', // User will fill this
                        symbol: '', // User will fill this
                        quoteToken: '0xWrappedNativeAddress',
                        totalSupply: '1000000000000000000000000', // 1 million tokens with 18 decimals
                        creatorShare: 4000, // 40%
                        stakingShare: 4000, // 40%
                        bidPrices: [0, '100000000000000'],
                        askPrices: [0, '99000000000000'],
                        args: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52', // encoded 18 decimals
                    },
                    // We'll define sub-parameters for the struct fields that need user input
                    fields: {
                        name: {
                            type: 'text' as const,
                            label: 'Token Name',
                            placeholder: 'Enter token name',
                            required: true,
                            minLength: 3,
                            maxLength: 50,
                        },
                        symbol: {
                            type: 'text' as const,
                            label: 'Token Symbol',
                            placeholder: 'Enter token symbol (3-5 characters)',
                            required: true,
                            minLength: 2,
                            maxLength: 5,
                            pattern: '^[A-Z0-9]+$',
                        },
                        // Other fields use default values and are hidden from the user
                    },
                } as StandardParameter & {
                    fields: Record<string, any>;
                    value: Record<string, any>;
                },
            ],
        },
    ],
};

// ============== 6. CROSS-CHAIN BRIDGE MINI-APP ==============

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
export const bridgeMiniApp = {
    url: 'https://bridge.sherry.social',
    icon: 'https://example.com/bridge-icon.png',
    title: 'Cross-Chain Bridge',
    description: 'Bridge your assets across multiple blockchains',
    actions: [
        // Action: Bridge Tokens
        {
            label: 'Bridge Tokens',
            title: 'Bridge Your Assets',
            description: 'Transfer tokens across different blockchains',
            address: '0xBridgeAddress' as `0x${string}`,
            abi: bridgeAbi,
            functionName: 'bridgeTokens',
            chains: { source: 'avalanche', destination: 'celo' },
            params: [
                // Token address
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'token',
                    label: 'Token Address',
                    placeholder: 'Enter token address',
                }),
                // Amount
                createParameter(PARAM_TEMPLATES.TOKEN_AMOUNT, {
                    name: 'amount',
                    label: 'Amount to Bridge',
                    placeholder: 'Enter amount',
                    min: 0.000001,
                }),
                // Recipient
                createParameter(PARAM_TEMPLATES.ADDRESS, {
                    name: 'recipient',
                    label: 'Destination Address',
                    value: 'sender', // Default to current user
                }),
                // Destination Chain ID
                {
                    name: 'destinationChainId',
                    type: 'number' as const,
                    label: 'Destination Chain',
                    required: true,
                    value: 42220, // Celo chain ID
                    fixed: true, // User cannot change this
                } as StandardParameter,
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
    marketCreation: marketCreationMiniApp,
    bridge: bridgeMiniApp,
};
