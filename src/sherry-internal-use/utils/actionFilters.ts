import { BlockchainAction } from '../../interface/blockchainAction';
import { HttpAction } from '../../interface/httpAction';
import { TransferAction } from '../../interface/transferAction';
import { isBlockchainAction } from '../../utils/createMetadata';
import { isTransferAction, isHttpAction } from '../../utils/validator';

type AnyAction = BlockchainAction | TransferAction | HttpAction;

export function filterActionsByType(actions: AnyAction[], type: 'blockchain' | 'transfer' | 'http'): AnyAction[] {
  return actions.filter(action => {
    if (type === 'blockchain') return isBlockchainAction(action);
    if (type === 'transfer') return isTransferAction(action);
    if (type === 'http') return isHttpAction(action);
    return false;
  });
}

export function categorizeActions(actions: AnyAction[]): Record<string, AnyAction[]> {
  return {
    blockchain: actions.filter(isBlockchainAction),
    transfer: actions.filter(isTransferAction),
    http: actions.filter(isHttpAction),
  };
}
