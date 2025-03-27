// src/examples/nested-action-examples.ts
import { ActionFlow, 
    NestedBlockchainAction, NestedTransferAction, NestedHttpAction, CompletionAction, DecisionAction 
} from '../interface/nestedAction';
import { Abi } from 'abitype';

// =============== EXAMPLE 1: ONBOARDING FLOW ===============
// A multi-step onboarding process for new users with email signup and wallet connection

// Simple ABI for NFT minting (simplified)
const onboardingNftAbi: Abi = [
  {
    name: 'mintWelcomeNFT',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenURI', type: 'string' }
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }]
  }
] as const;

export const onboardingFlowApp: ActionFlow = {
  type: 'flow',
  label: 'User Onboarding',
  initialActionId: 'signup-form',
  actions: [
    // Step 1: Email signup form
    {
      id: 'signup-form',
      type: 'http',
      label: 'Sign Up',
      endpoint: 'https://api.sherry.social/signup',
      params: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true
        },
        {
          name: 'newsletter',
          label: 'Subscribe to Newsletter',
          type: 'boolean',
          required: false
        }
      ],
      nextActions: [
        { actionId: 'wallet-decision' }
      ]
    } as NestedHttpAction,

    // Step 2: Ask user about wallet
    {
      id: 'wallet-decision',
      type: 'decision',
      label: 'Connect Wallet',
      title: 'Do you have a Web3 wallet?',
      options: [
        { label: 'Yes, I have a wallet', value: 'has-wallet', nextActionId: 'connect-wallet' },
        { label: 'No, I need to create one', value: 'no-wallet', nextActionId: 'create-wallet-guide' }
      ]
    } as DecisionAction,

    // Step 3A: Connect existing wallet
    {
      id: 'connect-wallet',
      type: 'http',
      label: 'Connect Wallet',
      endpoint: 'https://api.sherry.social/connect-wallet',
      params: [],
      nextActions: [
        { actionId: 'mint-welcome-nft' }
      ]
    } as NestedHttpAction,

    // Step 3B: Wallet creation guide
    {
      id: 'create-wallet-guide',
      type: 'http',
      label: 'Create Wallet',
      endpoint: 'https://api.sherry.social/wallet-guide',
      params: [
        {
          name: 'device',
          label: 'Your Device',
          type: 'radio',
          required: true,
          options: [
            { label: 'iOS', value: 'ios' },
            { label: 'Android', value: 'android' },
            { label: 'Desktop', value: 'desktop' }
          ]
        }
      ],
      nextActions: [
        { actionId: 'wallet-creation-completion' }
      ]
    } as NestedHttpAction,

    // Step 4A: Mint welcome NFT for existing wallet users
    {
      id: 'mint-welcome-nft',
      type: 'blockchain',
      label: 'Claim Welcome NFT',
      //description: 'Mint your welcome NFT to complete onboarding',
      address: '0x1234567890123456789012345678901234567890',
      abi: onboardingNftAbi,
      functionName: 'mintWelcomeNFT',
      chains: { source: 'avalanche' },
      params: [
        {
          name: 'to',
          label: 'Your Address',
          type: 'address',
          required: true,
          value: '{{userWallet}}' // Placeholder for wallet address from previous step
        },
        {
          name: 'tokenURI',
          label: 'Token URI',
          type: 'text',
          required: true,
          value: 'ipfs://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR',
          fixed: true
        }
      ],
      nextActions: [
        { actionId: 'onboarding-complete' }
      ]
    } as NestedBlockchainAction,

    // Step 4B: Completion for new wallet users
    {
      id: 'wallet-creation-completion',
      type: 'completion',
      label: 'Wallet Guide Complete',
      message: 'Follow the guide to create your wallet, then return to claim your welcome NFT!',
      status: 'success'
    } as CompletionAction,

    // Step 5: Final completion
    {
      id: 'onboarding-complete',
      type: 'completion',
      label: 'Onboarding Complete',
      message: "Welcome to Sherry! Your account is set up and you've received your first NFT.",
      status: 'success'
    } as CompletionAction
  ]
};

// =============== EXAMPLE 2: DEFI TRANSACTION FLOW ===============
// A DeFi flow for token swapping with approval and transaction confirmation

// Simplified ABIs
const erc20Abi: Abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

const dexAbi: Abi = [
  {
    name: 'swapExactTokensForTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  }
] as const;

export const defiSwapFlowApp: ActionFlow = {
  type: 'flow',
  label: 'Token Swap Flow',
  initialActionId: 'select-tokens',
  actions: [
    // Step 1: Select tokens and amount
    {
      id: 'select-tokens',
      type: 'http',
      label: 'Select Tokens',
      endpoint: 'https://api.sherry.social/get-swap-quote',
      params: [
        {
          name: 'fromToken',
          label: 'From Token',
          type: 'select',
          required: true,
          options: [
            { label: 'USDC', value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
            { label: 'USDT', value: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
            { label: 'DAI', value: '0x6B175474E89094C44Da98b954EedeAC495271d0F' }
          ]
        },
        {
          name: 'toToken',
          label: 'To Token',
          type: 'select',
          required: true,
          options: [
            { label: 'ETH', value: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
            { label: 'LINK', value: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
            { label: 'UNI', value: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' }
          ]
        },
        {
          name: 'amount',
          label: 'Amount',
          type: 'number',
          required: true,
          min: 0.000001
        }
      ],
      nextActions: [
        { actionId: 'review-quote' }
      ]
    } as NestedHttpAction,

    // Step 2: Review quote
    {
      id: 'review-quote',
      type: 'decision',
      label: 'Review Quote',
      title: 'Review Your Swap',
      options: [
        { label: 'Confirm Swap', value: 'confirm', nextActionId: 'token-approval' },
        { label: 'Cancel', value: 'cancel', nextActionId: 'swap-cancelled' }
      ]
    } as DecisionAction,

    // Step 3: Token approval
    {
      id: 'token-approval',
      type: 'blockchain',
      label: 'Approve Token',
      description: 'Approve token spending for the swap transaction',
      address: '0xb322E239E5A32724633A595b8f8657F9cbb307B2', //'{{fromToken}}' as `0x${string}`, // Dynamic address from previous step // TODO: Fix this
      abi: erc20Abi,
      functionName: 'approve',
      chains: { source: 'avalanche' },
      params: [
        {
          name: 'spender',
          label: 'DEX Router',
          type: 'address',
          required: true,
          value: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
          fixed: true
        },
        {
          name: 'amount',
          label: 'Approval Amount',
          type: 'number',
          required: true,
          value: '{{swapAmount}}' // From the quote step
        }
      ],
      nextActions: [
        { 
          actionId: 'execute-swap',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'success' }
          ]
        },
        { 
          actionId: 'approval-failed',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'error' }
          ]
        }
      ]
    } as NestedBlockchainAction,

    // Step 4A: Execute the swap
    {
      id: 'execute-swap',
      type: 'blockchain',
      label: 'Swap Tokens',
      address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
      //description: 'Swap tokens on the DEX',
      abi: dexAbi,
      functionName: 'swapExactTokensForTokens',
      chains: { source: 'avalanche' },
      params: [
        {
          name: 'amountIn',
          label: 'Amount In',
          type: 'number',
          required: true,
          value: '{{swapAmount}}', // From quote
          fixed: true
        },
        {
          name: 'amountOutMin',
          label: 'Minimum Output',
          type: 'number',
          required: true,
          value: '{{minOutput}}', // From quote
          fixed: true
        },
        {
          name: 'path',
          label: 'Token Path',
          type: 'address',
          required: true,
          value: ['{{fromToken}}', '{{toToken}}'], // From selection
          fixed: true
        },
        {
          name: 'to',
          label: 'Recipient',
          type: 'address',
          required: true,
          value: '{{userWallet}}' // User's wallet
        },
        {
          name: 'deadline',
          label: 'Deadline',
          type: 'number',
          required: true,
          value: '{{currentTimestamp + 1200}}', // 20 minutes from now
          fixed: true
        }
      ],
      nextActions: [
        {
          actionId: 'swap-complete',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'success' }
          ]
        },
        {
          actionId: 'swap-failed',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'error' }
          ]
        }
      ]
    } as NestedBlockchainAction,

    // Completion states
    {
      id: 'swap-complete',
      type: 'completion',
      label: 'Swap Complete',
      message: 'Your token swap was successful! Transaction hash: {{lastResult.data.txHash}}',
      status: 'success'
    } as CompletionAction,

    {
      id: 'approval-failed',
      type: 'completion',
      label: 'Approval Failed',
      message: 'Token approval failed. Please try again. Error: {{lastResult.error}}',
      status: 'error'
    } as CompletionAction,

    {
      id: 'swap-failed',
      type: 'completion',
      label: 'Swap Failed',
      message: 'Your swap transaction failed. Please try again. Error: {{lastResult.error}}',
      status: 'error'
    } as CompletionAction,

    {
      id: 'swap-cancelled',
      type: 'completion',
      label: 'Swap Cancelled',
      message: 'You have cancelled the swap. No transactions were sent.',
      status: 'info'
    } as CompletionAction
  ]
};

// =============== EXAMPLE 3: DAO GOVERNANCE FLOW ===============
// A governance flow for creating and voting on proposals

// Simplified DAO ABI
const daoAbi: Abi = [
  {
    name: 'createProposal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'actions', type: 'bytes' },
      { name: 'expiration', type: 'uint256' }
    ],
    outputs: [{ name: 'proposalId', type: 'uint256' }]
  },
  {
    name: 'castVote',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'support', type: 'bool' }
    ],
    outputs: []
  },
  {
    name: 'executeProposal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'proposalId', type: 'uint256' }
    ],
    outputs: []
  }
] as const;

export const governanceFlowApp: ActionFlow = {
  type: 'flow',
  label: 'DAO Governance',
  initialActionId: 'action-selection',
  actions: [
    // Initial action selection
    {
      id: 'action-selection',
      type: 'decision',
      label: 'Governance Actions',
      title: 'What would you like to do?',
      options: [
        { label: 'Create a Proposal', value: 'create', nextActionId: 'create-proposal-form' },
        { label: 'Vote on Proposals', value: 'vote', nextActionId: 'vote-proposal-selection' },
        { label: 'Execute a Proposal', value: 'execute', nextActionId: 'execute-proposal-selection' }
      ]
    } as DecisionAction,

    // Create proposal flow
    {
      id: 'create-proposal-form',
      type: 'http',
      label: 'Proposal Details',
      endpoint: 'https://api.sherry.social/validate-proposal',
      params: [
        {
          name: 'title',
          label: 'Proposal Title',
          type: 'text',
          required: true,
          minLength: 10,
          maxLength: 100
        },
        {
          name: 'description',
          label: 'Proposal Description',
          type: 'textarea',
          required: true,
          minLength: 50,
          maxLength: 4000
        },
        {
          name: 'duration',
          label: 'Voting Duration (days)',
          type: 'number',
          required: true,
          min: 1,
          max: 30
        }
      ],
      nextActions: [
        { actionId: 'review-proposal' }
      ]
    } as NestedHttpAction,

    {
      id: 'review-proposal',
      type: 'decision',
      label: 'Review Proposal',
      title: 'Submit Your Proposal?',
      options: [
        { label: 'Submit Proposal', value: 'submit', nextActionId: 'submit-proposal' },
        { label: 'Edit Proposal', value: 'edit', nextActionId: 'create-proposal-form' },
        { label: 'Cancel', value: 'cancel', nextActionId: 'proposal-cancelled' }
      ]
    } as DecisionAction,

    {
      id: 'submit-proposal',
      type: 'blockchain',
      label: 'Submit Proposal',
      address: '0xb322E239E5A32724633A595b8f8657F9cbb307B2', // DAO contract address
      abi: daoAbi,
      functionName: 'createProposal',
      chains: { source: 'celo' },
      params: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          value: '{{title}}' // From form
        },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          required: true,
          value: '{{description}}' // From form
        },
        {
          name: 'actions',
          label: 'Actions',
          type: 'text',
          required: true,
          value: '0x', // Empty bytes for simple proposals
          fixed: true
        },
        {
          name: 'expiration',
          label: 'Expiration',
          type: 'number',
          required: true,
          value: '{{timestamp + (86400 * duration)}}', // Days to seconds
          fixed: true
        }
      ],
      nextActions: [
        {
          actionId: 'proposal-created',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'success' }
          ]
        },
        {
          actionId: 'proposal-failed',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'error' }
          ]
        }
      ]
    } as NestedBlockchainAction,

    // Vote on proposal flow
    {
        id: 'vote-proposal-selection',
        type: 'http',
        label: 'Select Proposal',
        endpoint: 'https://api.sherry.social/get-active-proposals',
        params: [
          {
            name: 'proposalId',
            label: 'Active Proposals',
            type: 'select',
            required: true,
            options: [
              { 
                label: 'Proposal #43: Add AVAX Chain Support', 
                value: '43',
                //description: 'Expand protocol functionality to support Avalanche blockchain' 
              },
              { 
                label: 'Proposal #45: Community Fund Allocation', 
                value: '45',
                //description: 'Allocate 100,000 tokens from treasury to community development initiatives' 
              },
              { 
                label: 'Proposal #47: Protocol Upgrade v2.5', 
                value: '47',
                //description: 'Implement security improvements and new features in protocol version 2.5' 
              },
              { 
                label: 'Proposal #48: Establish Partnership with ChainLink', 
                value: '48',
                //description: 'Form strategic partnership with ChainLink for oracle services' 
              }
            ]
          }
        ],
        nextActions: [
          { actionId: 'vote-decision' }
        ]
      } as NestedHttpAction,

    {
      id: 'vote-decision',
      type: 'decision',
      label: 'Cast Your Vote',
      title: 'Do you support this proposal?',
      options: [
        { label: 'Yes, I support', value: true, nextActionId: 'submit-vote' },
        { label: 'No, I oppose', value: false, nextActionId: 'submit-vote' },
        { label: 'Cancel', value: 'cancel', nextActionId: 'vote-cancelled' }
      ]
    } as DecisionAction,

    {
      id: 'submit-vote',
      type: 'blockchain',
      label: 'Submit Vote',
      address: '0xb322E239E5A32724633A595b8f8657F9cbb307B2', // DAO contract address
      abi: daoAbi,
      functionName: 'castVote',
      chains: { source: 'celo' },
      params: [
        {
          name: 'proposalId',
          label: 'Proposal ID',
          type: 'number',
          required: true,
          value: '{{proposalId}}' // From selection
        },
        {
          name: 'support',
          label: 'Support',
          type: 'boolean',
          required: true,
          value: '{{userChoice}}' // From vote decision
        }
      ],
      nextActions: [
        {
          actionId: 'vote-submitted',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'success' }
          ]
        },
        {
          actionId: 'vote-failed',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'error' }
          ]
        }
      ]
    } as NestedBlockchainAction,

    // Execute proposal flow
    {
      id: 'execute-proposal-selection',
      type: 'http',
      label: 'Select Proposal to Execute',
      endpoint: 'https://api.sherry.social/get-executable-proposals',
      params: [
        {
          name: 'proposalId',
          label: 'Passed Proposals',
          type: 'select',
          required: true,
          options: [
            { label: 'Yes, I support', value: true },
            { label: 'No, I oppose', value: false },
          ] // Would be populated dynamically
        }
      ],
      nextActions: [
        { actionId: 'confirm-execution' }
      ]
    } as NestedHttpAction,

    {
      id: 'confirm-execution',
      type: 'decision',
      label: 'Confirm Execution',
      title: 'Are you sure you want to execute this proposal?',
      options: [
        { label: 'Yes, execute proposal', value: 'execute', nextActionId: 'execute-proposal' },
        { label: 'Cancel', value: 'cancel', nextActionId: 'execution-cancelled' }
      ]
    } as DecisionAction,

    {
      id: 'execute-proposal',
      type: 'blockchain',
      label: 'Execute Proposal',
      address: '0xb322E239E5A32724633A595b8f8657F9cbb307B2', // DAO contract address
      abi: daoAbi,
      functionName: 'executeProposal',
      chains: { source: 'celo' },
      params: [
        {
          name: 'proposalId',
          label: 'Proposal ID',
          type: 'number',
          required: true,
          value: '{{proposalId}}' // From selection
        }
      ],
      nextActions: [
        {
          actionId: 'execution-complete',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'success' }
          ]
        },
        {
          actionId: 'execution-failed',
          conditions: [
            { field: 'lastResult.status', operator: 'eq', value: 'error' }
          ]
        }
      ]
    } as NestedBlockchainAction,

    // Completion states for all paths
    {
      id: 'proposal-created',
      type: 'completion',
      label: 'Proposal Created',
      message: 'Your proposal has been successfully created! Proposal ID: {{lastResult.data.proposalId}}',
      status: 'success'
    } as CompletionAction,

    {
      id: 'proposal-failed',
      type: 'completion',
      label: 'Proposal Failed',
      message: 'Failed to create your proposal. Error: {{lastResult.error}}',
      status: 'error'
    } as CompletionAction,

    {
      id: 'proposal-cancelled',
      type: 'completion',
      label: 'Proposal Cancelled',
      message: 'You have cancelled creating a proposal.',
      status: 'info'
    } as CompletionAction,

    {
      id: 'vote-submitted',
      type: 'completion',
      label: 'Vote Submitted',
      message: 'Your vote has been successfully submitted!',
      status: 'success'
    } as CompletionAction,

    {
      id: 'vote-failed',
      type: 'completion',
      label: 'Vote Failed',
      message: 'Failed to submit your vote. Error: {{lastResult.error}}',
      status: 'error'
    } as CompletionAction,

    {
      id: 'vote-cancelled',
      type: 'completion',
      label: 'Vote Cancelled',
      message: 'You have cancelled voting.',
      status: 'info'
    } as CompletionAction,

    {
      id: 'execution-complete',
      type: 'completion',
      label: 'Execution Complete',
      message: 'The proposal has been successfully executed!',
      status: 'success'
    } as CompletionAction,

    {
      id: 'execution-failed',
      type: 'completion',
      label: 'Execution Failed',
      message: 'Failed to execute the proposal. Error: {{lastResult.error}}',
      status: 'error'
    } as CompletionAction,

    {
      id: 'execution-cancelled',
      type: 'completion',
      label: 'Execution Cancelled',
      message: 'You have cancelled the proposal execution.',
      status: 'info'
    } as CompletionAction
  ]
};

// Export all example apps
export const nestedActionExamples = {
  onboardingFlow: onboardingFlowApp,
  defiSwap: defiSwapFlowApp,
  governance: governanceFlowApp
};

export default nestedActionExamples;