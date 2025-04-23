import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<'svg'>>;
    description: ReactNode;
};

// Updated FeatureList for Sherry SDK
const FeatureList: FeatureItem[] = [
    {
        title: 'Embed Web3 Actions Anywhere',
        // TODO: Replace with a relevant SVG (e.g., social media icon, link icon)
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                Create interactive Web3 mini-apps (like swaps, votes, mints) that can be embedded
                directly into social media posts or any web context.
            </>
        ),
    },
    {
        title: 'Multi-Chain & Multi-Action',
        // TODO: Replace with a relevant SVG (e.g., chain links, puzzle pieces)
        Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
        description: (
            <>
                Support for multiple blockchains (Avalanche, Celo, Ethereum, etc.) and diverse
                action types including contract calls, transfers, API requests, and multi-step
                flows.
            </>
        ),
    },
    {
        title: 'Developer Focused',
        // TODO: Replace with a relevant SVG (e.g., code icon, gears icon)
        Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
        description: (
            <>
                Built with TypeScript for type safety, includes robust validation, and offers clear
                parameter configuration for a smooth development experience.
            </>
        ),
    },
];

function Feature({ title, Svg, description }: FeatureItem) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img" />
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}