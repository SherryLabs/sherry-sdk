import { TransferAction } from '../interface/actions/transferAction';
import { Metadata } from '../interface/metadata';

// ============== 1. SIMPLE DONATION MINI-APP ==============

export const simpleDonationMiniApp: Metadata = {
    url: 'https://donate.sherry.social',
    icon: 'https://example.com/donate-icon.png',
    title: 'Quick Donation',
    description: 'Make a quick donation to our project',
    actions: [
        // Simple direct transfer with fixed values
        {
            type: 'transfer',
            label: 'Donate 0.1 AVAX',
            description: 'Support our project with a small donation',
            to: '0x8901B77211629fB220B5aBA0f25EF9E3c46B93d2', // Project wallet
            amount: 0.1, // Fixed amount
            chains: { source: 'avalanche' },
        } as TransferAction,

        // Another donation option with different amount
        {
            label: 'Donate 0.5 AVAX',
            type: 'transfer',
            description: 'Support our project with a larger donation',
            to: '0x8901B77211629fB220B5aBA0f25EF9E3c46B93d2', // Project wallet
            amount: 0.5, // Fixed amount
            chains: { source: 'avalanche' },
        } as TransferAction,
    ],
};

// ============== 2. CHARITY DONATION MINI-APP ==============

export const charityDonationMiniApp: Metadata = {
    url: 'https://charity.sherry.social',
    icon: 'https://example.com/charity-icon.png',
    title: 'Charity Donations',
    description: 'Support various charitable causes',
    actions: [
        // Transfer with recipient selection
        {
            label: 'Donate to Charity',
            type: 'transfer',
            description: 'Choose a charity and donation amount',
            chains: { source: 'celo' },
            recipient: {
                type: 'select',
                label: 'Select Charity',
                required: true,
                options: [
                    {
                        label: 'Education Fund',
                        value: '0x1234567890123456789012345678901234567890',
                        description: 'Supporting education initiatives',
                    },
                    {
                        label: 'Climate Action',
                        value: '0x2345678901234567890123456789012345678901',
                        description: 'Fighting climate change',
                    },
                    {
                        label: 'Healthcare Access',
                        value: '0x3456789012345678901234567890123456789012',
                        description: 'Improving healthcare access',
                    },
                ],
            },
            amountConfig: {
                defaultValue: 0.1,
            },
        } as TransferAction,
    ],
};

// ============== 3. TIPPING MINI-APP ==============

export const tippingMiniApp: Metadata = {
    url: 'https://tip.sherry.social',
    icon: 'https://example.com/tip-icon.png',
    title: 'Creator Tips',
    description: 'Support your favorite content creators',
    actions: [
        // Transfer with amount selection
        {
            label: 'Tip Creator',
            type: 'transfer',
            description: 'Send a tip to the content creator',
            chains: { source: 'avalanche' },
            to: '0x9012345678901234567890123456789012345678', // Creator's wallet
            amountConfig: {
                type: 'radio',
                label: 'Tip Amount',
                required: true,
                options: [
                    { label: 'Small Tip', value: 0.01, description: '0.01 AVAX' },
                    { label: 'Medium Tip', value: 0.05, description: '0.05 AVAX' },
                    { label: 'Large Tip', value: 0.1, description: '0.1 AVAX' },
                    { label: 'Huge Tip', value: 0.5, description: '0.5 AVAX' },
                ],
            },
        } as TransferAction,
    ],
};

// ============== 4. CROSS-CHAIN TRANSFER MINI-APP ==============

export const crossChainTransferMiniApp: Metadata = {
    url: 'https://bridge.sherry.social',
    icon: 'https://example.com/bridge-icon.png',
    title: 'Simple Asset Bridge',
    description: 'Transfer your assets between chains',
    actions: [
        // Cross-chain transfer
        {
            type: 'transfer',
            label: 'Bridge to Celo',
            description: 'Send tokens from Avalanche to Celo',
            chains: { source: 'avalanche', destination: 'celo' },
            // User will input the address and amount
        } as TransferAction,

        // Another cross-chain direction
        {
            type: 'transfer',
            label: 'Bridge to Avalanche',
            description: 'Send tokens from Celo to Avalanche',
            chains: { source: 'celo', destination: 'avalanche' },
            // User will input the address and amount
        } as TransferAction,
    ],
};

// ============== 5. PAYMENT SPLITTING MINI-APP ==============

export const paymentSplittingMiniApp: Metadata = {
    url: 'https://split.sherry.social',
    icon: 'https://example.com/split-icon.png',
    title: 'Payment Splitter',
    description: 'Split payments between multiple recipients',
    actions: [
        // First split recipient
        {
            type: 'transfer',
            label: 'Pay Team Member 1',
            description: 'Send payment to first team member (20%)',
            chains: { source: 'alfajores' },
            to: '0x5678901234567890123456789012345678901234',
            amountConfig: {
                type: 'select',
                label: 'Project Budget',
                required: true,
                options: [
                    { label: 'Small Project', value: 0.05, description: '20% of 0.25 AVAX' },
                    { label: 'Medium Project', value: 0.1, description: '20% of 0.5 AVAX' },
                    { label: 'Large Project', value: 0.2, description: '20% of 1 AVAX' },
                ],
            },
        } as TransferAction,

        // Second split recipient
        {
            type: 'transfer',
            label: 'Pay Team Member 2',
            description: 'Send payment to second team member (35%)',
            chains: { source: 'alfajores' },
            to: '0x6789012345678901234567890123456789012345',
            amountConfig: {
                type: 'select',
                label: 'Project Budget',
                required: true,
                options: [
                    { label: 'Small Project', value: 0.0875, description: '35% of 0.25 AVAX' },
                    { label: 'Medium Project', value: 0.175, description: '35% of 0.5 AVAX' },
                    { label: 'Large Project', value: 0.35, description: '35% of 1 AVAX' },
                ],
            },
        } as TransferAction,

        // Third split recipient
        {
            type: 'transfer',
            label: 'Pay Team Member 3',
            description: 'Send payment to third team member (45%)',
            chains: { source: 'alfajores' },
            to: '0x7890123456789012345678901234567890123456',
            amountConfig: {
                type: 'select',
                label: 'Project Budget',
                required: true,
                options: [
                    { label: 'Small Project', value: 0.1125, description: '45% of 0.25 AVAX' },
                    { label: 'Medium Project', value: 0.225, description: '45% of 0.5 AVAX' },
                    { label: 'Large Project', value: 0.45, description: '45% of 1 AVAX' },
                ],
            },
        } as TransferAction,
    ],
};

// Export all mini-apps
export const transferMiniApps = {
    simpleDonation: simpleDonationMiniApp,
    charityDonation: charityDonationMiniApp,
    tipping: tippingMiniApp,
    crossChainTransfer: crossChainTransferMiniApp,
    paymentSplitting: paymentSplittingMiniApp,
};
