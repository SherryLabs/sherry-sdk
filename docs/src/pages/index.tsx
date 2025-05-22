import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Hero section with dynamic background
function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <Heading as="h1" className="hero__title">
                            Build Web3 Mini-Apps
                        </Heading>
                        <Heading as="h2" className={styles.heroSubtitle}>
                            Embed Interactive Blockchain Actions Anywhere
                        </Heading>
                        <p className={styles.heroDescription}>
                            Transform static social media posts into dynamic Web3 experiences.
                            Create token swaps, NFT mints, DAO votes, and more—all embedded directly
                            in posts.
                        </p>
                        <div className={styles.buttons}>
                            <Link className="button button--secondary button--lg" to="/docs/intro">
                                Get Started
                            </Link>
                            <Link
                                className="button button--outline button--lg"
                                to="/docs/keyconcepts/examples"
                            >
                                View Examples
                            </Link>
                        </div>
                    </div>
                    <div className={styles.heroVisual}>
                        <div className={styles.mockupContainer}>
                            {/* Social Media Post Mockup */}
                            <div className={styles.socialPost}>
                                <div className={styles.postHeader}>
                                    <div className={styles.avatar}></div>
                                    <div className={styles.userInfo}>
                                        <div className={styles.username}>@web3builder</div>
                                        <div className={styles.timestamp}>2 min ago</div>
                                    </div>
                                </div>
                                <div className={styles.postContent}>
                                    <p>🎉 New NFT collection is live! Mint yours now:</p>
                                    <div className={styles.sherryWidget}>
                                        <div className={styles.widgetHeader}>
                                            <span className={styles.widgetIcon}>🎨</span>
                                            <span className={styles.widgetTitle}>Mint NFT</span>
                                        </div>
                                        <div className={styles.widgetContent}>
                                            <div className={styles.inputGroup}>
                                                <label>Recipient Address</label>
                                                <input type="text" placeholder="0x..." />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Quantity</label>
                                                <select>
                                                    <option>1 NFT</option>
                                                    <option>3 NFTs</option>
                                                    <option>5 NFTs</option>
                                                </select>
                                            </div>
                                            <button className={styles.actionButton}>
                                                Mint for 0.1 AVAX
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

// Features section
function FeaturesSection(): ReactNode {
    const features = [
        {
            title: 'Multi-Chain Support',
            icon: '⛓️',
            description:
                'Deploy across Avalanche, Celo, Ethereum, and more blockchains with a single codebase.',
            details: [
                'Cross-chain transactions via Wormhole',
                'Unified API for all supported chains',
                'Automatic chain detection and switching',
            ],
        },
        {
            title: 'Rich Action Types',
            icon: '⚡',
            description:
                'From simple transfers to complex multi-step flows, create any Web3 interaction.',
            details: [
                'Smart contract interactions',
                'Token transfers & swaps',
                'Multi-step conditional flows',
                'HTTP API integrations',
            ],
        },
        {
            title: 'Developer Experience',
            icon: '🛠️',
            description:
                'Built for developers with TypeScript, validation, and comprehensive tooling.',
            details: [
                'Full TypeScript support',
                'Built-in validation & error handling',
                'Rich parameter configuration',
                'Extensive documentation & examples',
            ],
        },
    ];

    return (
        <section className={styles.featuresSection}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <Heading as="h2">Why Choose Sherry SDK?</Heading>
                    <p>Everything you need to build interactive Web3 experiences</p>
                </div>
                <div className={styles.featuresGrid}>
                    {features.map((feature, idx) => (
                        <div key={idx} className={styles.featureCard}>
                            <div className={styles.featureIcon}>{feature.icon}</div>
                            <div className={styles.featureContent}>
                                <Heading as="h3">{feature.title}</Heading>
                                <p>{feature.description}</p>
                                <ul className={styles.featureList}>
                                    {feature.details.map((detail, i) => (
                                        <li key={i}>{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// QuickLinks section using Docusaurus native components
function QuickLinksSection(): ReactNode {
    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === 'dark';
    
    const quickLinks = [
        {
            title: 'Getting Started',
            description: 'Learn the basics and set up your development environment',
            icon: '🚀',
            url: '/docs/intro',
        },
        {
            title: 'Core Concepts',
            description: 'Understand the key concepts behind mini-apps',
            icon: '🧠',
            url: '/docs/keyconcepts/overview',
        },
        {
            title: 'API Reference',
            description: 'Explore the complete API documentation',
            icon: '📚',
            url: '/docs/api',
        },
        {
            title: 'Examples',
            description: 'View example mini-apps for different use cases',
            icon: '🔍',
            url: '/docs/keyconcepts/examples',
        },
    ];

    return (
        <section className="padding-vert--xl">
            <div className="container">
                <div className="text--center margin-bottom--xl">
                    <Heading as="h2">Quick Links</Heading>
                    <p>Essential resources to get you building fast</p>
                </div>
                <div className="row">
                    {quickLinks.map((link, idx) => (
                        <div key={idx} className="col col--3 margin-bottom--lg">
                            <Link
                                to={useBaseUrl(link.url)}
                                className="card padding--lg cardContainer"
                                style={{
                                    height: '100%',
                                    textDecoration: 'none',
                                    border: `1px solid ${isDarkTheme ? '#333' : '#eee'}`,
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                <div className="card__header">
                                    <div className="margin-bottom--sm" style={{ fontSize: '2rem' }}>
                                        {link.icon}
                                    </div>
                                    <h3>{link.title}</h3>
                                </div>
                                <div className="card__body">
                                    <p>{link.description}</p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Code example section
function CodeExampleSection(): ReactNode {
    return (
        <section className={styles.codeSection}>
            <div className="container">
                <div className={styles.codeContainer}>
                    <div className={styles.codeExplanation}>
                        <Heading as="h2">Simple to Get Started</Heading>
                        <p>Create your first mini-app with just a few lines of code:</p>
                        <div className={styles.stepsList}>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>1</span>
                                <span>Define your metadata with actions</span>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>2</span>
                                <span>Validate with the SDK</span>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNumber}>3</span>
                                <span>Deploy and embed anywhere</span>
                            </div>
                        </div>
                        <Link
                            className="button button--primary button--lg"
                            to="/docs/keyconcepts/creatingminiapp"
                        >
                            Start Building →
                        </Link>
                    </div>
                    <div className={styles.codeExample}>
                        <div className={styles.macWindow}>
                            <div className={styles.macWindowHeader}>
                                <div className={styles.windowButtons}>
                                    <span className={styles.closeButton}></span>
                                    <span className={styles.minimizeButton}></span>
                                    <span className={styles.maximizeButton}></span>
                                </div>
                                <div className={styles.windowTitle}>mini-app.ts</div>
                            </div>
                            <pre className={styles.codeBlock}>
                                <code className="language-typescript">{`import { createMetadata, Metadata } from '@sherrylinks/sdk';

const metadata: Metadata = {
  url: 'https://myapp.example',
  icon: 'https://example.com/icon.png', 
  title: 'NFT Minter',
  description: 'Mint awesome NFTs',
  actions: [{
    type: 'blockchain',
    label: 'Mint NFT',
    address: '0x...',
    abi: contractAbi,
    functionName: 'mint',
    chains: { source: 'avalanche' },
    params: [
      {
        name: 'to',
        label: 'Recipient',
        type: 'address',
        required: true
      }
    ]
  }]
};

// Validate and use
const validated = createMetadata(metadata);`}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Use cases section
function UseCasesSection(): ReactNode {
    const useCases = [
        {
            title: 'Social Token Trading',
            description: 'Enable token swaps directly in Twitter/X posts',
            icon: '💱',
        },
        {
            title: 'NFT Minting',
            description: 'Let users mint NFTs without leaving social feeds',
            icon: '🎨',
        },
        {
            title: 'DAO Governance',
            description: 'Embed voting and proposal creation in communities',
            icon: '🗳️',
        },
        {
            title: 'DeFi Interactions',
            description: 'Provide lending, staking, and yield farming actions',
            icon: '📈',
        },
        {
            title: 'Cross-chain Transfers',
            description: 'Bridge assets between blockchains seamlessly',
            icon: '🌉',
        },
        {
            title: 'Fundraising',
            description: 'Accept donations and crowdfunding contributions',
            icon: '💝',
        },
    ];

    return (
        <section className={styles.useCasesSection}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <Heading as="h2">Endless Possibilities</Heading>
                    <p>Build mini-apps for any Web3 use case</p>
                </div>
                <div className={styles.useCasesGrid}>
                    {useCases.map((useCase, idx) => (
                        <div key={idx} className={styles.useCaseCard}>
                            <div className={styles.useCaseIcon}>{useCase.icon}</div>
                            <Heading as="h4">{useCase.title}</Heading>
                            <p>{useCase.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// CTA section
function CTASection(): ReactNode {
    return (
        <section className={styles.ctaSection}>
            <div className="container">
                <div className={styles.ctaContent}>
                    <Heading as="h2">Ready to Build the Future of Web3?</Heading>
                    <p>
                        Join developers creating the next generation of social Web3 experiences.
                        Start building your first mini-app today.
                    </p>
                    <div className={styles.ctaButtons}>
                        <Link className="button button--primary button--lg" to="/docs/intro">
                            Get Started Now
                        </Link>
                        <Link
                            className="button button--outline button--lg"
                            to="https://github.com/SherryLabs/sherry-sdk"
                        >
                            View on GitHub
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title="Build Web3 Mini-Apps"
            description="Create interactive blockchain actions that can be embedded anywhere. Multi-chain support, TypeScript-first, and developer-friendly."
        >
            <HomepageHeader />
            <main>
                <QuickLinksSection />
                <FeaturesSection />
                <CodeExampleSection />
                <UseCasesSection />
                <CTASection />
            </main>
        </Layout>
    );
}
