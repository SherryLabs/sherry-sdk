import { ChainContext } from '../chains';
import { BlockchainParameter } from './blockchainAction';

export interface DynamicAction {
    type: 'dynamic';
    label: string;
    description?: string;
    chains: ChainContext;
    path: string;
    params?: BlockchainParameter[];
}
