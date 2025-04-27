import { Metadata } from '../../interface/metadata';
import { BlockchainActionValidator } from '../../validators/blockchainActionValidator';
import { HttpActionValidator } from '../../validators/httpActionValidator';
import { TransferActionValidator } from '../../validators/transferActionValidator';

export function analyzeMetadata(metadata: Metadata): Record<string, any> {
    const actions = metadata.actions;
    const blockchainActions = actions.filter(BlockchainActionValidator.isBlockchainActionMetadata);
    const transferActions = actions.filter(TransferActionValidator.isTransferAction);
    const httpActions = actions.filter(HttpActionValidator.isHttpAction);

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
