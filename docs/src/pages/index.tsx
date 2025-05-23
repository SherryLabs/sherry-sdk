import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import { 
  FaPaintBrush, 
  FaExchangeAlt, 
  FaVoteYea, 
  FaChartLine, 
  FaHeart,
  FaCode,
  FaShieldAlt,
  FaGlobe,
  FaRocket,
  FaUsers,
  FaLightbulb
} from 'react-icons/fa';
import {
  MdOutlineRocketLaunch,
  MdOutlinePsychology,
  MdOutlineLibraryBooks,
  MdOutlineSearch,
  MdOutlineDesignServices,
  MdOutlineSpeed
} from 'react-icons/md';

// Hero section with live code preview
function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className="hero__title">
              Build Interactive Web3 Mini-Apps
            </Heading>
            <Heading as="h2" className={styles.heroSubtitle}>
              Embed Blockchain Actions Directly in Social Media Posts
            </Heading>
            <p className={styles.heroDescription}>
              Create token swaps, NFT mints, DAO votes, and more that run directly in social feeds. 
              Multi-chain support, TypeScript-first, with built-in validation and seamless UX.
            </p>
            
            {/* Stats Row */}
            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>4</span>
                <span className={styles.statLabel}>Supported Chains</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>5</span>
                <span className={styles.statLabel}>Action Types</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>100%</span>
                <span className={styles.statLabel}>TypeScript</span>
              </div>
            </div>

            <div className={styles.buttons}>
              <Link className="button button--secondary button--lg" to="/docs/intro">
                <FaRocket style={{ marginRight: '8px' }} />
                Get Started
              </Link>
              <Link
                className="button button--outline button--lg"
                to="/docs/getting-started/examples"
                style={{
                  border: '2px solid white',
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <FaCode style={{ marginRight: '8px' }} />
                View Examples
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.mockupContainer}>
              {/* Enhanced Social Media Post Mockup */}
              <div className={styles.socialPost}>
                <div className={styles.postHeader}>
                  <div className={styles.avatar}></div>
                  <div className={styles.userInfo}>
                    <div className={styles.username}>@web3builder</div>
                    <div className={styles.timestamp}>5 min ago</div>
                  </div>
                </div>
                <div className={styles.postContent}>
                  <p>🚀 Just launched our new NFT collection! Mint directly from this post:</p>
                  <div className={styles.sherryWidget}>
                    <div className={styles.widgetHeader}>
                      <span className={styles.widgetIcon}>🎨</span>
                      <span className={styles.widgetTitle}>Mint NFT</span>
                      <span className={styles.widgetBadge}>Sherry</span>
                    </div>
                    <div className={styles.widgetContent}>
                      <div className={styles.nftPreview}>
                        <div className={styles.nftImage}></div>
                        <div className={styles.nftInfo}>
                          <div className={styles.nftName}>Cosmic #42</div>
                          <div className={styles.nftPrice}>0.1 AVAX</div>
                        </div>
                      </div>
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
                        <span>Mint for 0.1 AVAX</span>
                        <span className={styles.buttonIcon}>→</span>
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

// Key Features Section
function KeyFeaturesSection(): ReactNode {
  const features = [
    {
      title: 'Multi-Chain Support',
      icon: <FaGlobe />,
      description: 'Deploy once, run everywhere. Support for Avalanche, Celo, Ethereum, and more.',
      highlights: [
        'Cross-chain transactions',
        'Unified API across chains',
        'Automatic chain detection'
      ]
    },
    {
      title: 'Rich Action Types',
      icon: <FaLightbulb />,
      description: 'From simple transfers to complex multi-step flows with conditional logic.',
      highlights: [
        'Smart contract interactions',
        'Token transfers & swaps',
        'Multi-step workflows',
        'HTTP API integrations'
      ]
    },
    {
      title: 'Developer Experience',
      icon: <FaCode />,
      description: 'Built for developers with TypeScript, validation, and comprehensive tooling.',
      highlights: [
        'Full TypeScript support',
        'Built-in validation',
        'Rich parameter config',
        'Extensive documentation'
      ]
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Why Developers Choose Sherry SDK</Heading>
          <p>Everything you need to build the next generation of social Web3 experiences</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <div className={styles.featureContent}>
                <Heading as="h3">{feature.title}</Heading>
                <p>{feature.description}</p>
                <ul className={styles.featureList}>
                  {feature.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
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

// Code Example Section with Live Preview
function CodeExampleSection(): ReactNode {
  return (
    <section className={styles.codeSection}>
      <div className="container">
        <div className={styles.codeContainer}>
          <div className={styles.codeExplanation}>
            <Heading as="h2">Build in Minutes, Not Hours</Heading>
            <p>Create your first interactive Web3 mini-app with just a few lines of TypeScript:</p>
            <div className={styles.stepsList}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <span>Define your mini-app metadata</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <span>Add blockchain actions</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <span>Validate with built-in tools</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <span>Deploy and embed anywhere</span>
              </div>
            </div>
            <Link className="button button--primary button--lg" to="/docs/getting-started/creatingminiapp">
              <FaRocket style={{ marginRight: '8px' }} />
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
                <div className={styles.windowTitle}>nft-mint.ts</div>
              </div>
              <pre className={styles.codeBlock}>
                <code className="language-typescript">{`import { createMetadata, Metadata } from '@sherrylinks/sdk';

const metadata: Metadata = {
  url: 'https://my-nft-app.com',
  icon: 'https://my-nft-app.com/icon.png',
  title: 'Cosmic NFT Collection',
  description: 'Mint unique cosmic NFTs directly from social media',
  actions: [{
    type: 'blockchain',
    label: 'Mint NFT',
    address: '0x...',
    abi: nftAbi,
    functionName: 'mint',
    chains: { source: 'avalanche' },
    amount: 0.1, // 0.1 AVAX mint price
    params: [
      {
        name: 'to',
        label: 'Recipient Address',
        type: 'address',
        required: true
      },
      {
        name: 'quantity',
        label: 'Quantity',
        type: 'select',
        required: true,
        options: [
          { label: '1 NFT', value: 1 },
          { label: '3 NFTs', value: 3 },
          { label: '5 NFTs', value: 5 }
        ]
      }
    ]
  }]
};

// Validate and deploy
const validated = createMetadata(metadata);
console.log('✅ Ready to deploy!');`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Quick Start Links
function QuickLinksSection(): ReactNode {
  const quickLinks = [
    {
      title: 'Quick Start',
      description: 'Get up and running in 5 minutes with our step-by-step guide',
      icon: <MdOutlineRocketLaunch />,
      url: '/docs/getting-started/quickstart',
      badge: '5 min'
    },
    {
      title: 'Action Types',
      description: 'Explore blockchain, transfer, dynamic, and flow actions',
      icon: <MdOutlineDesignServices />,
      url: '/docs/api-reference/action-types/blockchain-actions',
      badge: 'API Ref'
    },
    {
      title: 'Live Examples',
      description: 'See working examples for common Web3 use cases',
      icon: <MdOutlineSearch />,
      url: '/docs/getting-started/examples',
      badge: 'Examples'
    },
    {
      title: 'Complete Tutorial',
      description: 'Build a full mini-app with Next.js step-by-step',
      icon: <MdOutlineLibraryBooks />,
      url: '/docs/guides/guide-en',
      badge: '30 min'
    }
  ];

  return (
    <section className={styles.quickLinksSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Choose Your Learning Path</Heading>
          <p>Whether you're new to Web3 or an experienced developer, we have the right starting point</p>
        </div>
        <div className={styles.quickLinksGrid}>
          {quickLinks.map((link, idx) => (
            <Link key={idx} to={link.url} className={styles.quickLinksCard}>
              <div className={styles.cardHeader}>
                <div className={styles.quickLinksIcon}>{link.icon}</div>
                <span className={styles.quickLinksBadge}>{link.badge}</span>
              </div>
              <Heading as="h4" className={styles.quickLinksTitle}>{link.title}</Heading>
              <p className={styles.quickLinksDescription}>{link.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.learnMore}>Learn more →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Use Cases Section
function UseCasesSection(): ReactNode {
  const useCases = [
    {
      title: 'NFT Minting',
      description: 'Let users mint NFTs without leaving their social feed',
      icon: <FaPaintBrush />,
      examples: ['Art collections', 'Profile pictures', 'Gaming assets']
    },
    {
      title: 'Token Trading',
      description: 'Enable DeFi swaps directly in Twitter/X posts',
      icon: <FaExchangeAlt />,
      examples: ['DEX trading', 'Token swaps', 'Liquidity provision']
    },
    {
      title: 'DAO Governance',
      description: 'Embed voting and proposal creation in communities',
      icon: <FaVoteYea />,
      examples: ['Proposal voting', 'Treasury decisions', 'Protocol upgrades']
    },
    {
      title: 'DeFi Interactions',
      description: 'Provide lending, staking, and yield farming actions',
      icon: <FaChartLine />,
      examples: ['Staking rewards', 'Lending protocols', 'Yield farming']
    },
    {
      title: 'Fundraising',
      description: 'Accept donations and crowdfunding contributions',
      icon: <FaHeart />,
      examples: ['Charity donations', 'Project funding', 'Creator support']
    },
    {
      title: 'Cross-Chain Bridges',
      description: 'Bridge assets between blockchains seamlessly',
      icon: <FaGlobe />,
      examples: ['Asset bridging', 'Multi-chain apps', 'Chain abstraction']
    }
  ];

  return (
    <section className={styles.useCasesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Endless Possibilities</Heading>
          <p>Build mini-apps for any Web3 use case with our flexible SDK</p>
        </div>
        <div className={styles.useCasesGrid}>
          {useCases.map((useCase, idx) => (
            <div key={idx} className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}>{useCase.icon}</div>
              <Heading as="h4">{useCase.title}</Heading>
              <p>{useCase.description}</p>
              <div className={styles.useCaseExamples}>
                {useCase.examples.map((example, i) => (
                  <span key={i} className={styles.exampleTag}>{example}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Community & Support Section
function CommunitySection(): ReactNode {
  return (
    <section className={styles.communitySection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Join the Community</Heading>
          <p>Connect with other developers building the future of social Web3</p>
        </div>
        <div className={styles.communityGrid}>
          <div className={styles.communityCard}>
            <FaUsers className={styles.communityIcon} />
            <h4>Discord Community</h4>
            <p>Get help, share ideas, and collaborate with fellow developers</p>
            <Link to="https://discord.gg/69brTf6J" className="button button--outline">
              Join Discord
            </Link>
          </div>
          <div className={styles.communityCard}>
            <FaCode className={styles.communityIcon} />
            <h4>GitHub Repository</h4>
            <p>Contribute to the SDK, report issues, and access source code</p>
            <Link to="https://github.com/SherryLabs/sherry-sdk" className="button button--outline">
              View on GitHub
            </Link>
          </div>
          <div className={styles.communityCard}>
            <FaShieldAlt className={styles.communityIcon} />
            <h4>Support</h4>
            <p>Get technical support and answers to your questions</p>
            <Link to="https://support.anthropic.com" className="button button--outline">
              Get Support
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection(): ReactNode {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2">Ready to Build the Future of Web3?</Heading>
          <p>
            Join thousands of developers creating the next generation of social Web3 experiences. 
            Start building your first mini-app today.
          </p>
          <div className={styles.ctaButtons}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              <FaRocket style={{ marginRight: '8px' }} />
              Get Started Now
            </Link>
            <Link
              className="button button--outline button--lg"
              to="https://github.com/SherryLabs/sherry-sdk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                border: '2px solid white',
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <FaCode style={{ marginRight: '8px' }} />
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
      title="Build Interactive Web3 Mini-Apps"
      description="Create blockchain actions that can be embedded anywhere. Multi-chain support, TypeScript-first, and developer-friendly SDK for building social Web3 experiences."
    >
      <HomepageHeader />
      <main>
        <QuickLinksSection />
        <KeyFeaturesSection />
        <CodeExampleSection />
        <UseCasesSection />
        <CommunitySection />
        <CTASection />
      </main>
    </Layout>
  );
}