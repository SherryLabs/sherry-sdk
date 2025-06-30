# Live Examples - Real Mini-Apps in Action

Explore working examples of Sherry SDK mini-apps across different complexity levels and use cases. Each example includes complete source code, deployment instructions, and live demos.

## Quick Navigation

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '2rem 0'}}>
  <a href="#beginner-examples" style={{padding: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textDecoration: 'none', color: 'inherit'}}>
    <h4>Beginner</h4>
    <p>Simple transfers and basic contracts</p>
  </a>
  <a href="#intermediate-examples" style={{padding: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textDecoration: 'none', color: 'inherit'}}>
    <h4>Intermediate</h4>
    <p>Smart contracts and multi-step flows</p>
  </a>
  <a href="#advanced-examples" style={{padding: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textDecoration: 'none', color: 'inherit'}}>
    <h4>Advanced</h4>
    <p>Dynamic actions and complex logic</p>
  </a>
  <a href="#full-applications" style={{padding: '1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '8px', textDecoration: 'none', color: 'inherit'}}>
    <h4>Applications</h4>
    <p>Complete mini-app implementations</p>
  </a>
</div>

---

## Getting Started Guide

### Step 1: Choose Your Level

- **Beginner**: Start with Transfer Actions or simple Blockchain Actions
- **Intermediate**: Try Action Flows and more complex parameter handling
- **Advanced**: Build Dynamic Actions with server-side logic
- **Applications**: Combine multiple action types for complete solutions

### Step 2: Clone & Deploy

Each example includes:

- Complete source code
- Step-by-step setup instructions
- Deployment scripts
- Live demo links
- Explanation of key concepts

### Step 3: Customize & Extend

- Modify parameters for your use case
- Change contract addresses and ABIs
- Add your own business logic
- Integrate with your existing systems

---

## Beginner Examples {#beginner-examples}

Perfect for getting started with the SDK basics.

### 1. Simple Creator Tip

**Setup: 2 minutes** | **Action Type: Transfer**

A one-click tipping system for content creators.

```typescript
import { createMetadata, Metadata } from '@sherrylinks/sdk';

const creatorTipApp: Metadata = {
  url: 'https://my-creator-tip-app.com',
  icon: '',
  title: 'Tip the Creator',
  description: 'Show appreciation for great content',
  actions: [
    {
      type: 'transfer',
      label: 'Send Tip',
      chains: { source: 43114 },
      to: '0x742d35Cc6734C0532925a3b8D4ccd306f6F4B26C',
      amountConfig: {
        type: 'radio',
        label: 'Tip Amount',
        options: [
          { label: 'Coffee', value: 0.01, description: '0.01 AVAX' },
          { label: 'Lunch', value: 0.05, description: '0.05 AVAX' },
          { label: 'Dinner', value: 0.1, description: '0.1 AVAX' },
        ],
      },
    },
  ],
};

export default createMetadata(creatorTipApp);
```

**What you'll learn:**

- Basic Transfer Action setup
- Interactive amount selection
- User-friendly option labeling

---

### 2. Charity Donation Selector

**Setup: 3 minutes** | **Action Type: Transfer**

Let users choose between multiple charities with custom amounts.

```typescript
const charityApp: Metadata = {
  url: 'https://charity-donations.com',
  icon: '',
  title: 'Support a Cause',
  description: 'Make a difference with crypto donations',
  actions: [
    {
      type: 'transfer',
      label: 'Donate Now',
      chains: { source: 42220 },
      recipient: {
        type: 'select',
        label: 'Choose Your Cause',
        options: [
          {
            label: 'Education Fund',
            value: '0x1234567890123456789012345678901234567890',
            description: 'Supporting education worldwide',
          },
          {
            label: 'Environmental Fund',
            value: '0x2345678901234567890123456789012345678901',
            description: 'Fighting climate change',
          },
          {
            label: 'Healthcare Access',
            value: '0x3456789012345678901234567890123456789012',
            description: 'Improving global healthcare',
          },
        ],
      },
      amountConfig: {
        type: 'select',
        label: 'Donation Amount',
        options: [
          { label: '$5 worth', value: 0.01 },
          { label: '$25 worth', value: 0.05 },
          { label: '$50 worth', value: 0.1 },
        ],
      },
    },
  ],
};
```

**What you'll learn:**

- Both recipient and amount selection
- Dropdown vs radio button UX
- Meaningful option descriptions

---

### 3. Fixed-Price NFT Mint

**Setup: 5 minutes** | **Action Type: Blockchain**

Simple NFT minting with fixed price and metadata.

```typescript
const nftMintAbi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenURI', type: 'string' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
] as const;

const simpleNFTApp: Metadata = {
  url: 'https://my-nft-collection.com',
  icon: '',
  title: 'Mint Cosmic NFT',
  description: 'Get your unique cosmic NFT',
  actions: [
    {
      type: 'blockchain',
      label: 'Mint for 0.1 AVAX',
      address: '0x742d35Cc6734C0532925a3b8D4ccd306f6F4B26C',
      abi: nftMintAbi,
      functionName: 'mint',
      chains: { source: 43113 },
      amount: 0.1,
      params: [
        {
          name: 'to',
          label: 'Your Address',
          type: 'address',
          required: true,
          description: 'Address that will receive the NFT',
        },
        {
          name: 'tokenURI',
          label: 'Metadata',
          type: 'text',
          value: 'ipfs://QmYourNftMetadata123',
          fixed: true,
          description: 'NFT metadata URI',
        },
      ],
    },
  ],
};
```

**What you'll learn:**

- Basic Blockchain Action setup
- Working with contract ABIs
- Fixed vs user-input parameters
- Payable function handling

---

### 4. Simple Newsletter Signup

**Setup: 3 minutes** | **Action Type: HTTP**

Collect user emails with optional preferences.

```typescript
const newsletterApp: Metadata = {
  url: 'https://newsletter-signup.com',
  icon: '',
  title: 'Join Our Newsletter',
  description: 'Stay updated with the latest Web3 news',
  actions: [
    {
      type: 'http',
      label: 'Subscribe Now',
      path: 'https://api.newsletter.com/subscribe',
      params: [
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          description: "We'll never spam you",
        },
        {
          name: 'name',
          label: 'First Name',
          type: 'text',
          required: false,
          description: 'Help us personalize your experience',
        },
        {
          name: 'interests',
          label: 'Your Interests',
          type: 'select',
          required: false,
          options: [
            { label: 'DeFi', value: 'defi' },
            { label: 'NFTs', value: 'nfts' },
            { label: 'Gaming', value: 'gaming' },
            { label: 'Development', value: 'dev' },
          ],
        },
        {
          name: 'frequency',
          label: 'Email Frequency',
          type: 'radio',
          required: true,
          options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ],
        },
      ],
    },
  ],
};
```

**What you'll learn:**

- HTTP Action basics
- Form parameter types
- Email validation
- Radio vs select options

---

## Intermediate Examples {#intermediate-examples}

Ready to build more sophisticated mini-apps.

### 5. Token Approval + Swap Flow

**Setup: 15 minutes** | **Action Type: Flow**

A two-step process: approve tokens, then swap them.

```typescript
import { ActionFlow } from '@sherrylinks/sdk';

const tokenSwapFlow: ActionFlow = {
  type: 'flow',
  label: 'Swap USDC for AVAX',
  initialActionId: 'approve-usdc',
  actions: [
    // Step 1: Approve USDC spending
    {
      id: 'approve-usdc',
      type: 'blockchain',
      label: 'Step 1: Approve USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      abi: erc20Abi,
      functionName: 'approve',
      chains: { source: 43114 },
      params: [
        {
          name: 'spender',
          label: 'DEX Router',
          type: 'address',
          value: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
          fixed: true,
        },
        {
          name: 'amount',
          label: 'USDC Amount',
          type: 'number',
          required: true,
          min: 1,
          max: 10000,
        },
      ],
      nextActions: [
        {
          actionId: 'execute-swap',
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'success' }],
        },
        {
          actionId: 'approval-failed',
        },
      ],
    },

    // Step 2: Execute the swap
    {
      id: 'execute-swap',
      type: 'blockchain',
      label: 'Step 2: Swap Tokens',
      address: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
      abi: routerAbi,
      functionName: 'swapExactTokensForAVAX',
      chains: { source: 43114 },
      params: [
        {
          name: 'amountIn',
          label: 'Amount In',
          type: 'number',
          value: '{{amount}}', // From previous step
          fixed: true,
        },
        {
          name: 'amountOutMin',
          label: 'Min AVAX Out',
          type: 'number',
          required: true,
        },
        {
          name: 'path',
          label: 'Swap Path',
          type: 'text',
          value:
            '["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"]',
          fixed: true,
        },
        {
          name: 'to',
          label: 'Recipient',
          type: 'address',
          value: '{{userAddress}}',
          fixed: true,
        },
        {
          name: 'deadline',
          label: 'Deadline',
          type: 'number',
          value: '{{timestamp + 1200}}',
          fixed: true,
        },
      ],
      nextActions: [{ actionId: 'swap-complete' }],
    },

    // Completion states
    {
      id: 'swap-complete',
      type: 'completion',
      label: 'Swap Successful',
      message: 'Your USDC has been swapped for AVAX!',
      status: 'success',
    },
    {
      id: 'approval-failed',
      type: 'completion',
      label: 'Approval Failed',
      message: 'Token approval failed. Please try again.',
      status: 'error',
    },
  ],
};
```

**What you'll learn:**

- Multi-step Action Flows
- Conditional navigation between steps
- Parameter passing between actions
- Error handling in flows

---

### 6. DAO Voting with Proposals

**Setup: 10 minutes** | **Action Type: Blockchain**

Vote on DAO proposals with real-time proposal data.

```typescript
const daoVotingApp: Metadata = {
  url: 'https://dao-voting.com',
  icon: '',
  title: 'DAO Governance',
  description: 'Vote on community proposals',
  actions: [
    {
      type: 'blockchain',
      label: 'Cast Your Vote',
      address: '0xDAOGovernanceContract',
      abi: daoAbi,
      functionName: 'castVote',
      chains: { source: 42220 },
      params: [
        {
          name: 'proposalId',
          label: 'Active Proposals',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Proposal #42: Treasury Allocation',
              value: 42,
              description: 'Allocate 100K tokens for ecosystem development',
            },
            {
              label: 'Proposal #43: Partnership with Protocol X',
              value: 43,
              description: 'Strategic partnership for cross-chain expansion',
            },
            {
              label: 'Proposal #44: Governance Token Split',
              value: 44,
              description: '2:1 token split with updated tokenomics',
            },
          ],
        },
        {
          name: 'support',
          label: 'Your Vote',
          type: 'radio',
          required: true,
          options: [
            {
              label: 'Yes - I support this proposal',
              value: true,
              description: 'Vote in favor of the proposal',
            },
            {
              label: 'No - I oppose this proposal',
              value: false,
              description: 'Vote against the proposal',
            },
          ],
        },
      ],
    },
  ],
};
```

**What you'll learn:**

- Complex parameter selection
- Boolean parameter handling
- Real-world DAO integration
- Meaningful vote descriptions

---

### 7. Cross-Chain Asset Bridge

**Setup: 12 minutes** | **Action Type: Blockchain**

Bridge tokens between Avalanche and Celo networks.

```typescript
const bridgeApp: Metadata = {
  url: 'https://cross-chain-bridge.com',
  icon: '',
  title: 'Cross-Chain Bridge',
  description: 'Move assets between Avalanche and Celo',
  actions: [
    {
      type: 'blockchain',
      label: 'Bridge to Celo',
      address: '0xBridgeContractAddress',
      abi: bridgeAbi,
      functionName: 'bridgeTokens',
      chains: { source: 43114, destination: 42220 },
      params: [
        {
          name: 'token',
          label: 'Token to Bridge',
          type: 'select',
          required: true,
          options: [
            {
              label: 'USDC (USD Coin)',
              value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              description: 'Stable USD-pegged token',
            },
            {
              label: 'USDT (Tether)',
              value: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
              description: 'Widely used stablecoin',
            },
          ],
        },
        {
          name: 'amount',
          label: 'Amount to Bridge',
          type: 'number',
          required: true,
          min: 1,
          max: 100000,
          description: 'Amount of tokens to send to Celo',
        },
        {
          name: 'recipient',
          label: 'Recipient on Celo',
          type: 'address',
          required: true,
          description: 'Address that will receive tokens on Celo network',
        },
        {
          name: 'destinationChainId',
          label: 'Destination Chain',
          type: 'number',
          value: 42220,
          fixed: true,
        },
      ],
    },
  ],
};
```

**What you'll learn:**

- Cross-chain action configuration
- Token selection with descriptions
- Address validation across chains
- Fixed vs dynamic parameters

---

### 8. Multi-Step User Onboarding

**Setup: 20 minutes** | **Action Type: Flow**

Complete user onboarding with email, wallet, and NFT mint.

```typescript
const onboardingFlow: ActionFlow = {
  type: 'flow',
  label: 'Complete Onboarding',
  initialActionId: 'collect-info',
  actions: [
    // Step 1: Collect user information
    {
      id: 'collect-info',
      type: 'http',
      label: 'Welcome! Tell us about yourself',
      path: 'https://api.myapp.com/onboard',
      params: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          minLength: 2,
          maxLength: 50,
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
        },
        {
          name: 'experience',
          label: 'Web3 Experience',
          type: 'radio',
          required: true,
          options: [
            { label: 'Complete Beginner', value: 'beginner' },
            { label: 'Some Experience', value: 'intermediate' },
            { label: 'Very Experienced', value: 'expert' },
          ],
        },
      ],
      nextActions: [{ actionId: 'choose-path' }],
    },

    // Step 2: Choose onboarding path
    {
      id: 'choose-path',
      type: 'decision',
      label: 'Choose Your Path',
      title: 'What would you like to do first?',
      options: [
        {
          label: 'Get my welcome NFT',
          value: 'nft',
          nextActionId: 'mint-welcome-nft',
        },
        {
          label: 'Learn more about the platform',
          value: 'learn',
          nextActionId: 'learning-complete',
        },
        {
          label: 'Explore features',
          value: 'explore',
          nextActionId: 'exploration-complete',
        },
      ],
    },

    // Step 3: Mint welcome NFT
    {
      id: 'mint-welcome-nft',
      type: 'blockchain',
      label: 'Mint Your Welcome NFT',
      address: '0xWelcomeNFTContract',
      abi: welcomeNftAbi,
      functionName: 'mintWelcome',
      chains: { source: 43113 },
      params: [
        {
          name: 'to',
          label: 'Your Address',
          type: 'address',
          required: true,
        },
        {
          name: 'experience',
          label: 'Experience Level',
          type: 'text',
          value: '{{experience}}', // From step 1
          fixed: true,
        },
      ],
      nextActions: [{ actionId: 'onboarding-complete' }],
    },

    // Completion states
    {
      id: 'onboarding-complete',
      type: 'completion',
      label: 'Welcome Aboard!',
      message: 'Your onboarding is complete! Check your wallet for your welcome NFT.',
      status: 'success',
    },
    {
      id: 'learning-complete',
      type: 'completion',
      label: 'Keep Learning!',
      message: 'Great choice! Check out our documentation to learn more.',
      status: 'success',
    },
    {
      id: 'exploration-complete',
      type: 'completion',
      label: 'Happy Exploring!',
      message: 'Dive in and explore all our features. Welcome to the community!',
      status: 'success',
    },
  ],
};
```

**What you'll learn:**

- Complex multi-step flows
- Decision trees and branching
- Data passing between steps
- Multiple completion states

---

## Advanced Examples {#advanced-examples}

Complex mini-apps with server-side logic and optimization.

### 9. AI-Powered Yield Optimizer

**Setup: 30 minutes** | **Action Type: Dynamic**

Server calculates optimal DeFi yield strategies across multiple protocols.

```typescript
const yieldOptimizerApp: Metadata = {
  url: 'https://yield-optimizer.com',
  icon: '',
  title: 'AI Yield Optimizer',
  description: 'Maximize your DeFi yields with AI-powered strategies',
  baseUrl: 'https://api.yield-optimizer.com',
  actions: [
    {
      type: 'dynamic',
      label: 'Optimize My Yield',
      path: '/api/calculate-optimal-yield',
      chains: { source: 43114 },
      params: [
        {
          name: 'amount',
          label: 'Investment Amount (USDC)',
          type: 'number',
          required: true,
          min: 100,
          max: 1000000,
          description: 'Minimum $100 for optimal strategy calculation',
        },
        {
          name: 'riskTolerance',
          label: 'Risk Tolerance',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Conservative (3-5% APY)',
              value: 'low',
              description: 'Stable protocols only, lower risk',
            },
            {
              label: 'Moderate (5-12% APY)',
              value: 'medium',
              description: 'Balanced risk/reward approach',
            },
            {
              label: 'Aggressive (12%+ APY)',
              value: 'high',
              description: 'Higher risk for maximum returns',
            },
          ],
        },
        {
          name: 'timeHorizon',
          label: 'Investment Duration',
          type: 'radio',
          required: true,
          options: [
            { label: '1 Week', value: 7, description: 'Short-term gains' },
            { label: '1 Month', value: 30, description: 'Medium-term strategy' },
            { label: '3 Months', value: 90, description: 'Long-term optimization' },
            { label: '1 Year', value: 365, description: 'Maximum compounding' },
          ],
        },
        {
          name: 'autoCompound',
          label: 'Auto-compound rewards',
          type: 'boolean',
          value: true,
          description: 'Automatically reinvest rewards for compound growth',
        },
      ],
    },
  ],
};
```

**Backend Implementation (Next.js API Route):**

```typescript
// pages/api/calculate-optimal-yield.ts
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'wagmi';
import { avalanche } from 'viem/chains';
import { ExecutionResponse } from '@sherrylinks/sdk';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = parseFloat(searchParams.get('amount') || '0');
    const riskTolerance = searchParams.get('riskTolerance');
    const timeHorizon = parseInt(searchParams.get('timeHorizon') || '30');
    const autoCompound = searchParams.get('autoCompound') === 'true';

    // AI-POWERED YIELD CALCULATION
    const protocols = await fetchProtocolYields();
    const filteredProtocols = filterByRisk(protocols, riskTolerance);
    const optimalStrategy = await calculateOptimalAllocation({
      protocols: filteredProtocols,
      amount,
      timeHorizon,
      autoCompound,
    });

    // Build optimized transaction
    const transaction = await buildYieldTransaction(optimalStrategy);
    const serializedTx = serialize(transaction);

    const response: ExecutionResponse = {
      serializedTransaction: serializedTx,
      chainId: 43,
      params: {
        functionName: 'executeYieldStrategy',
        args: {
          strategy: optimalStrategy.name,
          expectedAPY: `${optimalStrategy.projectedAPY}%`,
          protocols: optimalStrategy.protocols.join(', '),
          projectedValue: `$${(amount * (1 + optimalStrategy.projectedAPY / 100)).toFixed(2)} after ${timeHorizon} days`,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Yield calculation failed' }, { status: 500 });
  }
}

// AI yield calculation functions
async function fetchProtocolYields() {
  // Fetch real-time yields from Aave, Compound, Yearn, etc.
  const protocols = await Promise.all([
    fetch('https://api.aave.com/data/liquidity/v1').then(r => r.json()),
    fetch('https://api.compound.finance/api/v2/ctoken').then(r => r.json()),
    fetch('https://api.yearn.finance/v1/chains/1/vaults/all').then(r => r.json()),
  ]);
  return protocols.flat();
}

function filterByRisk(protocols: any[], risk: string) {
  const riskThresholds = { low: 3, medium: 6, high: 10 };
  return protocols.filter(p => p.riskScore <= riskThresholds[risk]);
}

async function calculateOptimalAllocation(config: any) {
  // Portfolio optimization algorithm (Markowitz, Black-Litterman, etc.)
  return {
    name: 'Multi-Protocol Yield Strategy',
    protocols: ['Aave USDC', 'Compound DAI', 'Yearn USDT'],
    allocation: [0.4, 0.35, 0.25],
    projectedAPY: 8.7,
    riskScore: 4.2,
  };
}
```

**What you'll learn:**

- Complex Dynamic Action implementation
- Server-side AI/ML integration
- Multi-protocol yield optimization
- Real-time data processing
- Advanced parameter handling

---

### 10. Dynamic NFT Pricing Engine

**Setup: 25 minutes** | **Action Type: Dynamic**

NFT pricing that adapts to market conditions, demand, and whale activity.

```typescript
const dynamicNFTApp: Metadata = {
  url: 'https://dynamic-nft.com',
  icon: '',
  title: 'Smart NFT Mint',
  description: 'AI-powered dynamic pricing based on market conditions',
  baseUrl: 'https://api.dynamic-nft.com',
  actions: [
    {
      type: 'dynamic',
      label: 'Mint at Current Price',
      path: '/api/calculate-nft-price',
      chains: { source: 43114 },
      params: [
        {
          name: 'tier',
          label: 'NFT Tier',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Common',
              value: 'common',
              description: 'Basic tier with standard traits',
            },
            {
              label: 'Rare',
              value: 'rare',
              description: 'Enhanced traits and special effects',
            },
            {
              label: 'Epic',
              value: 'epic',
              description: 'Unique animations and rare attributes',
            },
            {
              label: 'Legendary',
              value: 'legendary',
              description: 'Ultra-rare with exclusive benefits',
            },
          ],
        },
        {
          name: 'quantity',
          label: 'Quantity',
          type: 'radio',
          required: true,
          options: [
            { label: '1 NFT', value: 1, description: 'Single mint' },
            { label: '3 NFTs', value: 3, description: '5% bulk discount' },
            { label: '5 NFTs', value: 5, description: '10% bulk discount' },
            { label: '10 NFTs', value: 10, description: '15% bulk discount' },
          ],
        },
      ],
    },
  ],
};
```

**Backend Implementation:**

```typescript
// pages/api/calculate-nft-price.ts
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier');
    const quantity = parseInt(searchParams.get('quantity') || '1');

    // DYNAMIC PRICING ALGORITHM
    const marketData = await analyzeMarketConditions();
    const demandMetrics = await calculateDemandMetrics(tier);
    const whaleActivity = await detectWhaleActivity();

    const basePrice = getTierBasePrice(tier);
    const dynamicMultiplier = calculatePriceMultiplier({
      marketData,
      demandMetrics,
      whaleActivity,
      quantity,
    });

    const finalPrice = basePrice * dynamicMultiplier * quantity;
    const bulkDiscount = getBulkDiscount(quantity);
    const totalPrice = finalPrice * (1 - bulkDiscount);

    // Build mint transaction with dynamic pricing
    const transaction = await buildMintTransaction({
      tier,
      quantity,
      price: totalPrice,
      recipient: searchParams.get('userAddress'),
    });

    const response: ExecutionResponse = {
      serializedTransaction: serialize(transaction),
      chainId: 43114,
      params: {
        functionName: 'mintWithDynamicPrice',
        args: {
          tier: tier,
          quantity: quantity,
          currentPrice: `${totalPrice.toFixed(3)} AVAX`,
          marketCondition: marketData.condition,
          demandLevel: demandMetrics.level,
          priceChange: `${((dynamicMultiplier - 1) * 100).toFixed(1)}%`,
          bulkDiscount: `${(bulkDiscount * 100).toFixed(0)}%`,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Price calculation failed' }, { status: 500 });
  }
}

// Dynamic pricing functions
async function analyzeMarketConditions() {
  // Analyze overall NFT market, ETH price, gas fees, etc.
  return {
    condition: 'bullish', // bearish, neutral, bullish
    volatility: 0.15,
    volume24h: 1500000,
  };
}

async function calculateDemandMetrics(tier: string) {
  // Analyze recent mints, wallet interest, social sentiment
  return {
    level: 'high', // low, medium, high
    recentMints: 47,
    uniqueWallets: 156,
    socialSentiment: 0.8,
  };
}

async function detectWhaleActivity() {
  // Monitor large wallet movements and buying patterns
  return {
    recentWhaleActivity: true,
    largeWalletInterest: 0.7,
  };
}
```

**What you'll learn:**

- Real-time market analysis
- Dynamic pricing algorithms
- Whale detection systems
- Bulk discount calculations
- Market sentiment integration

---

### 11. Advanced Arbitrage Bot

**Setup: 35 minutes** | **Action Type: Dynamic**

Multi-DEX arbitrage with flash loans and optimal routing.

```typescript
const arbitrageBotApp: Metadata = {
  url: 'https://arbitrage-bot.com',
  icon: '',
  title: 'Flash Arbitrage Bot',
  description: 'Execute profitable arbitrage opportunities across DEXs',
  baseUrl: 'https://api.arbitrage-bot.com',
  actions: [
    {
      type: 'dynamic',
      label: 'Find & Execute Arbitrage',
      path: '/api/find-arbitrage',
      chains: { source: 43114 },
      params: [
        {
          name: 'tokenPair',
          label: 'Token Pair',
          type: 'select',
          required: true,
          options: [
            {
              label: 'AVAX/USDC',
              value: 'AVAX_USDC',
              description: 'Most liquid pair with frequent opportunities',
            },
            {
              label: 'AVAX/USDT',
              value: 'AVAX_USDT',
              description: 'High volume, good for large trades',
            },
            {
              label: 'USDC/USDT',
              value: 'USDC_USDT',
              description: 'Stable pair with smaller but consistent profits',
            },
          ],
        },
        {
          name: 'maxSlippage',
          label: 'Max Slippage (%)',
          type: 'radio',
          required: true,
          options: [
            { label: '0.1%', value: 0.1, description: 'Conservative, safer trades' },
            { label: '0.5%', value: 0.5, description: 'Balanced approach' },
            { label: '1.0%', value: 1.0, description: 'Aggressive, higher profits' },
          ],
        },
        {
          name: 'minProfitThreshold',
          label: 'Minimum Profit Threshold',
          type: 'number',
          required: true,
          min: 0.01,
          max: 5.0,
          value: 0.1,
          description: 'Minimum profit % to execute trade',
        },
        {
          name: 'useFlashLoan',
          label: 'Use Flash Loans',
          type: 'boolean',
          value: true,
          description: 'Enable flash loans for capital-free arbitrage',
        },
      ],
    },
  ],
};
```

**Backend Implementation:**

```typescript
// pages/api/find-arbitrage.ts
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenPair = searchParams.get('tokenPair');
    const maxSlippage = parseFloat(searchParams.get('maxSlippage') || '0.5');
    const minProfitThreshold = parseFloat(searchParams.get('minProfitThreshold') || '0.1');
    const useFlashLoan = searchParams.get('useFlashLoan') === 'true';

    // SCAN MULTIPLE DEXs FOR ARBITRAGE OPPORTUNITIES
    const dexPrices = await scanDEXPrices(tokenPair);
    const opportunities = findArbitrageOpportunities(dexPrices, minProfitThreshold);

    if (opportunities.length === 0) {
      return NextResponse.json(
        {
          error: 'No profitable arbitrage opportunities found',
        },
        { status: 404 },
      );
    }

    // Select best opportunity
    const bestOpportunity = opportunities[0];

    // Calculate optimal trade size
    const optimalSize = calculateOptimalTradeSize(bestOpportunity, maxSlippage);

    // Build arbitrage transaction
    const transaction = useFlashLoan
      ? await buildFlashLoanArbitrage(bestOpportunity, optimalSize)
      : await buildDirectArbitrage(bestOpportunity, optimalSize);

    const response: ExecutionResponse = {
      serializedTransaction: serialize(transaction),
      chainId: 43114,
      params: {
        functionName: useFlashLoan ? 'executeFlashArbitrage' : 'executeDirectArbitrage',
        args: {
          pair: tokenPair,
          buyDEX: bestOpportunity.buyDEX,
          sellDEX: bestOpportunity.sellDEX,
          tradeSize: `${optimalSize} tokens`,
          expectedProfit: `${bestOpportunity.profitPercent.toFixed(2)}%`,
          estimatedGain: `${((optimalSize * bestOpportunity.profitPercent) / 100).toFixed(2)}`,
          flashLoan: useFlashLoan,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Arbitrage calculation failed' }, { status: 500 });
  }
}

async function scanDEXPrices(tokenPair: string) {
  // Scan TraderJoe, Pangolin, SushiSwap, etc.
  const dexAPIs = [
    'https://api.traderjoe.xyz/v1/prices',
    'https://api.pangolin.exchange/v1/prices',
    'https://api.sushi.com/v1/prices',
  ];

  const prices = await Promise.all(
    dexAPIs.map(api => fetch(`${api}/${tokenPair}`).then(r => r.json())),
  );

  return prices;
}
```

**What you'll learn:**

- Multi-DEX price scanning
- Flash loan implementation
- Optimal trade sizing
- Gas cost optimization
- Real-time opportunity detection

---

## Full Applications {#full-applications}

Complete mini-app implementations ready for production.

### 12. DeFi Portfolio Manager

**Setup: 45 minutes** | **Multiple Action Types**

Complete DeFi portfolio management with rebalancing, yield optimization, and risk management.

```typescript
const portfolioManagerApp: Metadata = {
  url: 'https://defi-portfolio-manager.com',
  icon: '',
  title: 'DeFi Portfolio Manager',
  description: 'Complete portfolio management with AI-powered optimization',
  baseUrl: 'https://api.defi-portfolio.com',
  actions: [
    // Action 1: Analyze Portfolio
    {
      type: 'dynamic',
      label: 'Analyze Portfolio',
      path: '/api/analyze-portfolio',
      chains: { source: 43114 },
      params: [
        {
          name: 'walletAddress',
          label: 'Portfolio Address',
          type: 'address',
          required: true,
          description: 'Wallet address to analyze',
        },
      ],
    },

    // Action 2: Rebalance Portfolio
    {
      type: 'dynamic',
      label: 'Smart Rebalance',
      path: '/api/rebalance-portfolio',
      chains: { source: 43114 },
      params: [
        {
          name: 'strategy',
          label: 'Rebalancing Strategy',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Conservative Rebalance',
              value: 'conservative',
              description: 'Minimal changes, low risk',
            },
            {
              label: 'Aggressive Optimization',
              value: 'aggressive',
              description: 'Maximum yield optimization',
            },
            {
              label: 'Risk Parity',
              value: 'risk_parity',
              description: 'Equal risk contribution',
            },
          ],
        },
        {
          name: 'maxSlippage',
          label: 'Max Slippage (%)',
          type: 'number',
          required: true,
          min: 0.1,
          max: 5.0,
          value: 1.0,
        },
      ],
    },

    // Action 3: Emergency Exit
    {
      type: 'blockchain',
      label: 'Emergency Exit All Positions',
      address: '0xPortfolioManagerContract',
      abi: portfolioManagerAbi,
      functionName: 'emergencyExitAll',
      chains: { source: 43114 },
      params: [
        {
          name: 'recipient',
          label: 'Withdrawal Address',
          type: 'address',
          required: true,
          description: 'Where to send all withdrawn funds',
        },
        {
          name: 'confirmation',
          label: 'Emergency Confirmation',
          type: 'radio',
          required: true,
          options: [
            {
              label: 'YES - Exit all positions immediately',
              value: true,
              description: 'This will close ALL positions and withdraw funds',
            },
            {
              label: 'NO - Cancel emergency exit',
              value: false,
              description: 'Keep current positions',
            },
          ],
        },
      ],
    },

    // Action 4: Set Stop Loss
    {
      type: 'blockchain',
      label: 'Set Portfolio Stop Loss',
      address: '0xPortfolioManagerContract',
      abi: portfolioManagerAbi,
      functionName: 'setGlobalStopLoss',
      chains: { source: 43114 },
      params: [
        {
          name: 'stopLossPercentage',
          label: 'Stop Loss Trigger (%)',
          type: 'select',
          required: true,
          options: [
            { label: '5% Loss', value: 5, description: 'Conservative protection' },
            { label: '10% Loss', value: 10, description: 'Balanced protection' },
            { label: '15% Loss', value: 15, description: 'Allow for volatility' },
            { label: '20% Loss', value: 20, description: 'High risk tolerance' },
          ],
        },
        {
          name: 'autoRebalance',
          label: 'Auto-rebalance after stop loss',
          type: 'boolean',
          value: false,
          description: 'Automatically rebalance portfolio after stop loss is triggered',
        },
      ],
    },
  ],
};
```

**Backend Implementations:**

```typescript
// Analyze Portfolio
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');

  // Fetch portfolio data from multiple protocols
  const [aavePositions, compoundPositions, uniswapV3Positions, yearnVaults] = await Promise.all([
    getAavePositions(walletAddress),
    getCompoundPositions(walletAddress),
    getUniswapV3Positions(walletAddress),
    getYearnPositions(walletAddress),
  ]);

  // Calculate portfolio metrics
  const portfolioValue = calculateTotalValue(positions);
  const riskScore = calculateRiskScore(positions);
  const apy = calculateWeightedAPY(positions);
  const diversificationScore = calculateDiversification(positions);

  // Generate recommendations
  const recommendations = generateRecommendations({
    positions,
    riskScore,
    diversificationScore,
  });

  // Build dashboard transaction
  const transaction = await buildDashboardTransaction({
    portfolioValue,
    riskScore,
    apy,
    recommendations,
  });

  return NextResponse.json({
    serializedTransaction: serialize(transaction),
    chainId: 43114,
    params: {
      functionName: 'displayPortfolioAnalysis',
      args: {
        totalValue: `${portfolioValue.toLocaleString()}`,
        riskScore: `${riskScore}/10`,
        weightedAPY: `${apy.toFixed(2)}%`,
        diversificationScore: `${diversificationScore}/10`,
        recommendations: recommendations.slice(0, 3).join(', '),
      },
    },
  });
}

// Rebalance Portfolio
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const strategy = searchParams.get('strategy');
  const maxSlippage = parseFloat(searchParams.get('maxSlippage') || '1.0');

  // Get current portfolio state
  const currentPortfolio = await getCurrentPortfolio(walletAddress);

  // Calculate optimal allocation based on strategy
  const targetAllocation = await calculateOptimalAllocation(strategy, currentPortfolio);

  // Generate rebalancing transactions
  const rebalancingSteps = await generateRebalancingSteps(
    currentPortfolio,
    targetAllocation,
    maxSlippage,
  );

  // Build batch transaction
  const batchTransaction = await buildBatchRebalanceTransaction(rebalancingSteps);

  return NextResponse.json({
    serializedTransaction: serialize(batchTransaction),
    chainId: 43114,
    params: {
      functionName: 'executeBatchRebalance',
      args: {
        strategy: strategy,
        transactionCount: rebalancingSteps.length,
        estimatedGasCost: `${estimateGasCost(rebalancingSteps)} AVAX`,
        projectedImprovement: `+${calculateProjectedImprovement(targetAllocation)}% APY`,
        maxSlippage: `${maxSlippage}%`,
      },
    },
  });
}
```

**What you'll learn:**

- Multi-protocol portfolio analysis
- Risk scoring algorithms
- Automated rebalancing strategies
- Emergency exit mechanisms
- Batch transaction optimization

---

### 13. Social Trading Platform

**Setup: 60 minutes** | **Action Flow**

Follow successful traders and automatically copy their strategies.

```typescript
const socialTradingFlow: ActionFlow = {
  type: 'flow',
  label: 'Social Trading Platform',
  initialActionId: 'discover-traders',
  actions: [
    // Step 1: Discover top traders
    {
      id: 'discover-traders',
      type: 'http',
      label: 'Discover Top Traders',
      path: 'https://api.social-trading.com/traders/discover',
      params: [
        {
          name: 'timeframe',
          label: 'Performance Timeframe',
          type: 'select',
          required: true,
          options: [
            { label: 'Last 7 days', value: '7d', description: 'Recent performance' },
            { label: 'Last 30 days', value: '30d', description: 'Monthly track record' },
            { label: 'Last 90 days', value: '90d', description: 'Quarterly performance' },
            { label: 'All time', value: 'all', description: 'Complete history' },
          ],
        },
        {
          name: 'riskProfile',
          label: 'Risk Profile',
          type: 'radio',
          required: true,
          options: [
            { label: 'Conservative (Max 5% drawdown)', value: 'conservative' },
            { label: 'Moderate (Max 15% drawdown)', value: 'moderate' },
            { label: 'Aggressive (Max 30% drawdown)', value: 'aggressive' },
          ],
        },
        {
          name: 'minFollowers',
          label: 'Minimum Followers',
          type: 'number',
          required: true,
          min: 10,
          max: 10000,
          value: 100,
          description: 'Traders with proven social proof',
        },
      ],
      nextActions: [{ actionId: 'select-trader' }],
    },

    // Step 2: Select a trader to follow
    {
      id: 'select-trader',
      type: 'decision',
      label: 'Select Trader',
      title: 'Choose a trader to follow',
      description: 'Based on your criteria, here are the top performing traders',
      options: [
        {
          label: 'CryptoWhale42 - 89% Win Rate, 156% YTD',
          value: 'whale42',
          nextActionId: 'configure-copy-trading',
        },
        {
          label: 'DeFiMaster - 76% Win Rate, 134% YTD',
          value: 'defi_master',
          nextActionId: 'configure-copy-trading',
        },
        {
          label: 'SafeTrader - 45% Win Rate, 67% YTD (Low Risk)',
          value: 'safe_trader',
          nextActionId: 'configure-copy-trading',
        },
        {
          label: 'Browse more traders',
          value: 'browse_more',
          nextActionId: 'discover-traders',
        },
      ],
    },

    // Step 3: Configure copy trading settings
    {
      id: 'configure-copy-trading',
      type: 'http',
      label: 'Configure Copy Trading',
      path: 'https://api.social-trading.com/configure-copying',
      params: [
        {
          name: 'allocation',
          label: 'Allocation Amount (USDC)',
          type: 'number',
          required: true,
          min: 100,
          max: 100000,
          value: 1000,
          description: 'Amount to allocate for copy trading',
        },
        {
          name: 'copyPercentage',
          label: 'Copy Percentage',
          type: 'select',
          required: true,
          options: [
            { label: '10% of trader positions', value: 10 },
            { label: '25% of trader positions', value: 25 },
            { label: '50% of trader positions', value: 50 },
            { label: '100% exact copy', value: 100 },
          ],
        },
        {
          name: 'stopLoss',
          label: 'Portfolio Stop Loss',
          type: 'radio',
          required: true,
          options: [
            { label: '5% Loss', value: 5 },
            { label: '10% Loss', value: 10 },
            { label: '20% Loss', value: 20 },
            { label: 'No Stop Loss', value: 0 },
          ],
        },
        {
          name: 'autoRebalance',
          label: 'Auto-rebalance frequency',
          type: 'select',
          required: true,
          options: [
            { label: 'Real-time (Immediate)', value: 'realtime' },
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Manual only', value: 'manual' },
          ],
        },
      ],
      nextActions: [{ actionId: 'confirm-setup' }],
    },

    // Step 4: Confirm copy trading setup
    {
      id: 'confirm-setup',
      type: 'decision',
      label: 'Confirm Setup',
      title: 'Ready to start copy trading?',
      description: 'Review your configuration and start following the trader',
      options: [
        {
          label: 'Start Copy Trading',
          value: 'confirm',
          nextActionId: 'deploy-copy-trading',
        },
        {
          label: 'Modify Settings',
          value: 'modify',
          nextActionId: 'configure-copy-trading',
        },
        {
          label: 'Cancel',
          value: 'cancel',
          nextActionId: 'setup-cancelled',
        },
      ],
    },

    // Step 5: Deploy copy trading contract
    {
      id: 'deploy-copy-trading',
      type: 'blockchain',
      label: 'Deploy Copy Trading Contract',
      address: '0xSocialTradingFactory',
      abi: socialTradingAbi,
      functionName: 'createCopyTradingVault',
      chains: { source: 43114 },
      params: [
        {
          name: 'traderAddress',
          label: 'Trader Address',
          type: 'address',
          value: '{{selectedTrader}}',
          fixed: true,
        },
        {
          name: 'initialDeposit',
          label: 'Initial Deposit',
          type: 'number',
          value: '{{allocation}}',
          fixed: true,
        },
        {
          name: 'copyPercentage',
          label: 'Copy Percentage',
          type: 'number',
          value: '{{copyPercentage}}',
          fixed: true,
        },
        {
          name: 'stopLossPercentage',
          label: 'Stop Loss',
          type: 'number',
          value: '{{stopLoss}}',
          fixed: true,
        },
      ],
      nextActions: [
        {
          actionId: 'copy-trading-active',
          conditions: [{ field: 'lastResult.status', operator: 'eq', value: 'success' }],
        },
        {
          actionId: 'deployment-failed',
        },
      ],
    },

    // Completion states
    {
      id: 'copy-trading-active',
      type: 'completion',
      label: 'Copy Trading Active!',
      message:
        "Your copy trading vault is now live and will automatically follow your selected trader's moves.",
      status: 'success',
    },
    {
      id: 'deployment-failed',
      type: 'completion',
      label: 'Deployment Failed',
      message: 'Failed to deploy copy trading contract. Please try again or contact support.',
      status: 'error',
    },
    {
      id: 'setup-cancelled',
      type: 'completion',
      label: 'Setup Cancelled',
      message: 'Copy trading setup has been cancelled. You can start over anytime.',
      status: 'info',
    },
  ],
};
```

**What you'll learn:**

- Social trading mechanics
- Dynamic trader discovery
- Risk management integration
- Automated portfolio mirroring
- Smart contract deployment flows

---

### 14. Decentralized Insurance Platform

**Setup: 50 minutes** | **Multiple Action Types**

Complete insurance platform with policy creation, claims, and payouts.

```typescript
const insurancePlatformApp: Metadata = {
  url: 'https://defi-insurance.com',
  icon: '',
  title: 'DeFi Insurance Hub',
  description: 'Protect your DeFi investments with decentralized insurance',
  baseUrl: 'https://api.defi-insurance.com',
  actions: [
    // Action 1: Buy Insurance Policy
    {
      type: 'dynamic',
      label: 'Buy Insurance Policy',
      path: '/api/calculate-premium',
      chains: { source: 43114 },
      params: [
        {
          name: 'protocolAddress',
          label: 'Protocol to Insure',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Aave Lending Pool',
              value: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
              description: 'Cover lending/borrowing risks'
            },
            {
              label: 'Trader Joe DEX',
              value: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
              description: 'Cover liquidity provision risks'
            },
            {
              label: 'Yearn Finance Vault',
              value: '0x7D2382b1f8Af621229d33464340541Db362B4907',
              description: 'Cover smart contract risks'
            }
          ]
        },
        {
          name: 'coverageAmount',
          label: 'Coverage Amount (USDC)',
          type: 'number',
          required: true,
          min: 1000,
          max: 1000000,
          description: 'Amount of funds to insure'
        },
        {
          name: 'coveragePeriod',
          label: 'Coverage Period',
          type: 'radio',
          required: true,
          options: [
            { label: '30 days', value: 30, description: 'Short-term coverage' },
            { label: '90 days', value: 90, description: 'Medium-term coverage' },
            { label: '180 days', value: 180, description: 'Long-term coverage' },
            { label: '365 days', value: 365, description: 'Annual coverage (10% discount)' }
          ]
        },
        {
          name: 'riskTolerance',
          label: 'Risk Assessment',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Conservative (Higher premium, better coverage)',
              value: 'conservative',
              description: 'Maximum protection'
            },
            {
              label: 'Balanced (Standard premium and coverage)',
              value: 'balanced',
              description: 'Recommended option'
            },
            {
              label: 'Aggressive (Lower premium, basic coverage)',
              value: 'aggressive',
              description: 'Budget-friendly'
            }
          ]
        }
      ]
    },

    // Action 2: File Insurance Claim
    {
      type: 'http',
      label: 'File Insurance Claim',
      path: 'https://api.defi-insurance.com/claims/file',
      params: [
        {
          name: 'policyId',
          label: 'Policy ID',
          type: 'text',
          required: true,
          pattern: '^[0-9]+,
          description: 'Your insurance policy number'
        },
        {
          name: 'incidentType',
          label: 'Type of Incident',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Smart Contract Exploit',
              value: 'exploit',
              description: 'Protocol was hacked or exploited'
            },
            {
              label: 'Liquidity Crisis',
              value: 'liquidity',
              description: 'Unable to withdraw funds due to liquidity issues'
            },
            {
              label: 'Oracle Manipulation',
              value: 'oracle',
              description: 'Price oracle was manipulated causing losses'
            },
            {
              label: 'Governance Attack',
              value: 'governance',
              description: 'Malicious governance proposal caused harm'
            },
            {
              label: 'Other',
              value: 'other',
              description: 'Other covered incident type'
            }
          ]
        },
        {
          name: 'lossAmount',
          label: 'Claimed Loss Amount (USDC)',
          type: 'number',
          required: true,
          min: 1,
          description: 'Amount of loss you are claiming'
        },
        {
          name: 'incidentDate',
          label: 'Incident Date',
          type: 'datetime',
          required: true,
          description: 'When did the incident occur?'
        },
        {
          name: 'description',
          label: 'Incident Description',
          type: 'textarea',
          required: true,
          minLength: 100,
          maxLength: 2000,
          description: 'Detailed description of what happened'
        },
        {
          name: 'evidenceLinks',
          label: 'Evidence Links',
          type: 'textarea',
          required: false,
          description: 'Transaction hashes, news articles, or other evidence (one per line)'
        }
      ]
    },

    // Action 3: Vote on Claims (For token holders)
    {
      type: 'blockchain',
      label: 'Vote on Insurance Claims',
      address: '0xInsuranceGovernanceContract',
      abi: insuranceGovernanceAbi,
      functionName: 'voteOnClaim',
      chains: { source: 43114 },
      params: [
        {
          name: 'claimId',
          label: 'Claim to Vote On',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Claim #1247: Aave Exploit - $45,000',
              value: 1247,
              description: 'Flash loan attack on Aave lending pool'
            },
            {
              label: 'Claim #1248: Yearn Vault Bug - $12,500',
              value: 1248,
              description: 'Smart contract bug caused fund loss'
            },
            {
              label: 'Claim #1249: Oracle Manipulation - $78,000',
              value: 1249,
              description: 'Price oracle was manipulated during liquidation'
            }
          ]
        },
        {
          name: 'vote',
          label: 'Your Vote',
          type: 'radio',
          required: true,
          options: [
            {
              label: 'APPROVE - Valid claim, should be paid',
              value: true,
              description: 'Vote to approve this insurance claim'
            },
            {
              label: 'REJECT - Invalid claim, should not be paid',
              value: false,
              description: 'Vote to reject this insurance claim'
            }
          ]
        },
        {
          name: 'votingPower',
          label: 'Voting Power to Use',
          type: 'select',
          required: true,
          options: [
            { label: '25% of my tokens', value: 25 },
            { label: '50% of my tokens', value: 50 },
            { label: '75% of my tokens', value: 75 },
            { label: '100% of my tokens', value: 100 }
          ]
        }
      ]
    },

    // Action 4: Provide Insurance Liquidity
    {
      type: 'blockchain',
      label: 'Provide Insurance Liquidity',
      address: '0xInsuranceLiquidityPool',
      abi: liquidityPoolAbi,
      functionName: 'provideLiquidity',
      chains: { source: 43114 },
      amount: 0, // User specifies amount via parameter
      params: [
        {
          name: 'depositAmount',
          label: 'Liquidity Amount (USDC)',
          type: 'number',
          required: true,
          min: 100,
          max: 1000000,
          description: 'Amount to provide as insurance liquidity'
        },
        {
          name: 'lockupPeriod',
          label: 'Lockup Period',
          type: 'radio',
          required: true,
          options: [
            {
              label: '30 days (5% APY)',
              value: 30,
              description: 'Short commitment, lower rewards'
            },
            {
              label: '90 days (8% APY)',
              value: 90,
              description: 'Medium commitment, balanced rewards'
            },
            {
              label: '180 days (12% APY)',
              value: 180,
              description: 'Long commitment, higher rewards'
            },
            {
              label: '365 days (18% APY)',
              value: 365,
              description: 'Maximum commitment, maximum rewards'
            }
          ]
        },
        {
          name: 'autoCompound',
          label: 'Auto-compound rewards',
          type: 'boolean',
          value: true,
          description: 'Automatically reinvest earned premiums'
        }
      ]
    }
  ]
};
```

**Backend Implementations:**

```typescript
// Calculate Insurance Premium
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const protocolAddress = searchParams.get('protocolAddress');
  const coverageAmount = parseFloat(searchParams.get('coverageAmount') || '0');
  const coveragePeriod = parseInt(searchParams.get('coveragePeriod') || '30');
  const riskTolerance = searchParams.get('riskTolerance');

  // RISK ASSESSMENT ALGORITHM
  const protocolRisk = await assessProtocolRisk(protocolAddress);
  const marketConditions = await getMarketConditions();
  const historicalClaims = await getHistoricalClaims(protocolAddress);

  // Calculate base premium
  const basePremium = calculateBasePremium({
    coverageAmount,
    coveragePeriod,
    protocolRisk,
    marketConditions,
    historicalClaims,
  });

  // Apply risk tolerance modifier
  const riskMultiplier =
    {
      conservative: 1.5, // Higher premium, better coverage
      balanced: 1.0, // Standard premium
      aggressive: 0.7, // Lower premium, basic coverage
    }[riskTolerance] || 1.0;

  const finalPremium = basePremium * riskMultiplier;
  const coveragePercentage =
    {
      conservative: 95, // Covers 95% of losses
      balanced: 80, // Covers 80% of losses
      aggressive: 60, // Covers 60% of losses
    }[riskTolerance] || 80;

  // Build insurance purchase transaction
  const transaction = await buildInsurancePurchaseTransaction({
    protocolAddress,
    coverageAmount,
    premium: finalPremium,
    period: coveragePeriod,
    coveragePercentage,
  });

  return NextResponse.json({
    serializedTransaction: serialize(transaction),
    chainId: 43114,
    params: {
      functionName: 'purchaseInsurancePolicy',
      args: {
        protocol: getProtocolName(protocolAddress),
        coverage: `${coverageAmount.toLocaleString()}`,
        premium: `${finalPremium.toFixed(2)}`,
        period: `${coveragePeriod} days`,
        coveragePercent: `${coveragePercentage}%`,
        riskScore: `${protocolRisk.score}/10`,
        estimatedAPY: `${((finalPremium / coverageAmount) * (365 / coveragePeriod) * 100).toFixed(2)}%`,
      },
    },
  });
}

async function assessProtocolRisk(protocolAddress: string) {
  // Analyze protocol security metrics
  const securityScore = await getSecurityScore(protocolAddress);
  const auditHistory = await getAuditHistory(protocolAddress);
  const tvlStability = await getTVLStability(protocolAddress);
  const timeInOperation = await getTimeInOperation(protocolAddress);

  // Calculate composite risk score (1-10, where 1 is highest risk)
  const riskScore = Math.min(
    10,
    Math.max(
      1,
      securityScore * 0.3 + auditHistory * 0.25 + tvlStability * 0.25 + timeInOperation * 0.2,
    ),
  );

  return {
    score: riskScore,
    factors: { securityScore, auditHistory, tvlStability, timeInOperation },
  };
}
```

**What you'll learn:**

- Risk assessment algorithms
- Decentralized claims processing
- Liquidity provision mechanics
- Governance voting systems
- Premium calculation models

---

## Development Tools

### Testing Your Mini-Apps

- **[Sherry Debugger](https://app.sherry.social/debugger)** - Test your metadata JSON
  <!-- - **[Live Preview](https://app.sherry.social/preview)** - See how your mini-app renders -->
  <!-- - **[Validation Tools](https://app.sherry.social/validate)** - Check for errors before deployment -->

### Deployment Options

- **Next.js Vercel**: Fastest for dynamic actions
- **Static Hosting**: Perfect for simple blockchain/transfer actions
- **Docker Containers**: For complex server-side logic
- **IPFS**: Decentralized hosting option

---

<!--
## 🤝 **Community Examples**

Want to contribute your own examples? Check out our [Community Examples Repository](https://github.com/SherryLabs/community-examples) where developers share:

- **Industry-specific solutions** (Gaming, Healthcare, Education)
- **Regional adaptations** (Local payment methods, regulations)
- **Creative integrations** (AI, IoT, AR/VR)
- **Performance optimizations** (Gas efficiency, UX improvements)

-->

## 📚 **Additional Resources**

- [**SDK Documentation**](/docs/api-reference/action-types/blockchain-actions) - Complete API reference
  <!-- - [**Best Practices Guide**](/docs/guides/best-practices) - Optimization tips and patterns -->
  <!-- - [**Troubleshooting**](/docs/guides/troubleshooting) - Common issues and solutions -->
- [**Discord Community**](https://discord.gg/sherry) - Get help from other developers

---

## What's Next?

Ready to build your own mini-app? Here are some great starting points:

1. **Fork an example** that's closest to your use case
2. **Modify the parameters** for your specific needs
3. **Test thoroughly** using our debugging tools
4. **Deploy and share** with the community

The future of Web3 UX is in your hands!
