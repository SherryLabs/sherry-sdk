import { BlockchainAction } from '../../interface/actions/blockchainAction';
import { HttpAction } from '../../interface/actions/httpAction';
import { TransferAction } from '../../interface/actions/transferAction';
import { BlockchainActionValidator } from '../../validators/blockchainActionValidator';
import { isTransferAction, isHttpAction } from '../../validators/validator';

type AnyAction = BlockchainAction | TransferAction | HttpAction;

export function filterActionsByType(
    actions: AnyAction[],
    type: 'blockchain' | 'transfer' | 'http',
): AnyAction[] {
    return actions.filter(action => {
        if (type === 'blockchain') return BlockchainActionValidator.isBlockchainAction(action);
        if (type === 'transfer') return isTransferAction(action);
        if (type === 'http') return isHttpAction(action);
        return false;
    });
}

export function categorizeActions(actions: AnyAction[]): Record<string, AnyAction[]> {
    return {
        blockchain: actions.filter(BlockchainActionValidator.isBlockchainAction),
        transfer: actions.filter(isTransferAction),
        http: actions.filter(isHttpAction),
    };
}
