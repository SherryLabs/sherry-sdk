import { ChainContext } from '../chains';
import { BlockchainParameter } from './blockchainAction';

export interface DynamicAction {
    type: 'dynamic';
    label: string;
    description?: string;
    chains: ChainContext;
    endpoint: string;
    params?: BlockchainParameter[];
}
