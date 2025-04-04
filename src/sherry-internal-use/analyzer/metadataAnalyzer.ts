import { Metadata } from '../../interface/metadata';
import { isBlockchainActionMetadata } from '../../utils/createMetadata';
import { isTransferAction, isHttpAction } from '../../validators/validator';

export function analyzeMetadata(metadata: Metadata): Record<string, any> {
    const actions = metadata.actions;
    const blockchainActions = actions.filter(isBlockchainActionMetadata);
    const transferActions = actions.filter(isTransferAction);
    const httpActions = actions.filter(isHttpAction);

    return {
        totalActions: actions.length,
        actionTypes: {
            blockchain: blockchainActions.length,
            transfer: transferActions.length,
            http: httpActions.length,
        },
        chainDistribution: getChainDistribution([...blockchainActions, ...transferActions]),
        complexityScore: calculateComplexityScore(metadata),
    };
}

function getChainDistribution(chainActions: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    chainActions.forEach(action => {
        const source = action.chains?.source;
        if (source) {
            distribution[source] = (distribution[source] || 0) + 1;
        }
    });

    return distribution;
}

function calculateComplexityScore(_metadata: Metadata): number {
    // Calculate complexity based on number and types of actions
    // (implementation details)
    return 0;
}
