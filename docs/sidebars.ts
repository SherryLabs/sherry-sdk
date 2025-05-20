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
        // 1. Main Introduction (points to the SDK intro)
        'intro', // Assuming 'intro.md' is now your main SDK introduction

        // 2. First Main Section: Getting Started / Core Concepts
        //{
        // type: 'category',
        // label: 'Quickstart',
        // collapsed: false,
        // Optional: Add a link to a specific doc if needed, otherwise it's just a category
        // link: { type: 'doc', id: 'sdk/getting-started-overview' },
        // items: [
        // 'quickstart/quickstart',

        // Docs about the key concepts of the SDK
        // Add other getting started guides here if you have them
        // ],
        // },
        // 3. Second Main Section: Key Concepts
        {
            type: 'category',
            label: 'Getting Started',
            collapsed: false,
            // Optional: Add a link to a specific doc if needed, otherwise it's just a category
            // link: { type: 'doc', id: 'sdk/getting-started-overview' },
            items: [
                'keyconcepts/keyconcepts',
                'keyconcepts/creatingminiapp',
                'keyconcepts/actions',
                'keyconcepts/metadata',
                'keyconcepts/stepbystep',
                'keyconcepts/examples',
                'keyconcepts/nextsteps',

                // How to create Metadata/Mini-apps
                // Docs about the key concepts of the SDK
                // Add other getting started guides here if you have them
            ],
        },

        {
            type: 'category',
            label: 'Chain Logic & Examples',
            collapsed: false,
            // Optional: Add a link to a specific doc if needed, otherwise it's just a category
            // link: { type: 'doc', id: 'sdk/getting-started-overview' },
            items: [
                'chainlogic/chains',
                'chainlogic/crosschain',
                'chainlogic/supported',

                // How to create Metadata/Mini-apps
                // Docs about the key concepts of the SDK
                // Add other getting started guides here if you have them
            ],
        },

        {
            type: 'category',
            label: 'Building Blocks',
            link: {
                // Link to the Action Types overview page
                type: 'generated-index',
                title: 'Action Types & Parameters',
                description: 'Learn about the core components for building mini-apps.',
                slug: '/sdk/building-blocks', // Define a URL slug for this overview
            },
            items: [
                {
                    type: 'category',
                    label: 'Action Types',
                    link: {
                        // Link to the Action Types sub-overview
                        type: 'generated-index',
                        title: 'SDK Action Types',
                        description: 'Explore the different actions you can define.',
                        slug: '/sdk/action-types',
                    },
                    items: [
                        'sdk/action-types/blockchain-actions',
                        'sdk/action-types/transfer-actions',
                        'sdk/action-types/http-actions',
                        'sdk/action-types/nested-action-flows', // Renamed from Action Flows for clarity? Adjust if needed
                    ],
                },
                'sdk/parameters', // Parameters documentation sits alongside Action Types
            ],
        },

        // 4. Third Main Section: Advanced & Reference
        {
            type: 'category',
            label: 'Advanced & Reference',
            items: [
                'sdk/chains', // Chains documentation
                'sdk/validation', // Validation documentation
                'sdk/examples', // Reference to examples
                // Add other advanced topics or reference pages here
                // 'sdk/advanced/some-topic',
            ],
        },
        // Removed the placeholder Tutorial sections
        {
            type: 'category',
            label: 'Guides',
            items: ['guides/guide-en', 'guides/guide-es'],
        },
    ],
};

export default sidebars;
