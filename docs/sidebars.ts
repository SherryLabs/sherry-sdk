import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
    // Define the sidebar structure for the documentation
    tutorialSidebar: [
        // 1. Getting Started Section
        {
            type: 'category',
            label: 'Getting Started',
            collapsed: true,
            link: {
                type: 'generated-index',
                title: 'Getting Started with Sherry SDK',
                description: 'Learn the basics and start building your first mini-app quickly.',
                slug: '/getting-started',
            },
            items: [
                'intro', // Introduction to the SDK
                'getting-started/quickstart', // Quick Start Guide
                'getting-started/creatingminiapp', // Creating Your First Mini-App
                'getting-started/examples', // Examples
            ],
        },

        // 2. Core Concepts Section
        {
            type: 'category',
            label: 'Core Concepts',
            collapsed: true,
            link: {
                type: 'generated-index',
                title: 'Core Concepts',
                description: 'Understand the fundamental concepts behind the Sherry SDK.',
                slug: '/core-concepts',
            },
            items: [
                'core-concepts/actions', // Actions overview
                'core-concepts/metadata', // Metadata Structure
                'core-concepts/chains', // Chain Logic
                'core-concepts/cross-chain', // Cross-Chain Logic
            ],
        },

        // 3. API Reference Section
        {
            type: 'category',
            label: 'API Reference',
            collapsed: true,
            link: {
                type: 'generated-index',
                title: 'API Reference',
                description: 'Detailed technical reference for all SDK components.',
                slug: '/api-reference',
            },
            items: [
                {
                    type: 'category',
                    label: 'Action Types',
                    link: {
                        type: 'generated-index',
                        title: 'SDK Action Types',
                        description: 'Explore the different actions you can define.',
                        slug: '/api/action-types',
                    },
                    items: [
                        'api-reference/action-types/transfer-actions',
                        'api-reference/action-types/blockchain-actions',
                        'api-reference/action-types/dynamic-actions',
                        'api-reference/action-types/nested-action-flows',
                    ],
                },
                'api-reference/parameters/parameters',
            ],
        },
        // 4. Integrators Section
        {
            type: 'category',
            label: 'Integrators',
            collapsed: true,
            link: {
                type: 'generated-index',
                title: 'Integrators Documentation',
                description:
                    'Complete documentation for integrating Sherry SDK - build powerful social dapps with ease.',
                slug: '/integrators',
            },
            items: [
                'integrators/integrate-sherry', // Integration Guide
            ],
        },
        // 5. Guides Section
        {
            type: 'category',
            label: 'Guides',
            collapsed: true,
            link: {
                type: 'generated-index',
                title: 'Guides & Tutorials',
                description: 'Step-by-step tutorials and guides for building with Sherry SDK.',
                slug: '/guides',
            },
            items: [
                'guides/guide-en', // Complete Tutorial (EN)
                'guides/guide-es', // Complete Tutorial (ES)
                //'guides/advanced-examples', // Advanced Examples
            ],
        },

        // 6. Cross-Chain Section
        {
            type: 'category',
            label: 'Cross-Chain',
            collapsed: false,
            link: {
                type: 'generated-index',
                title: 'Cross-Chain Functionality',
                description: 'Learn about cross-chain capabilities and integrations.',
                slug: '/cross-chain',
            },
            items: [
                //'chainlogic/supported', // Supported Chains
                //'chainlogic/crosschain', // Cross-Chain Actions
                //'chainlogic/wormhole-integration', // Wormhole Integration
            ],
        },
    ],
};

export default sidebars;
