import { ChainContext } from '../chains';
import { StandardParameter } from '../inputs';

export interface DynamicAction {
    type: 'dynamic';
    label: string;
    description?: string;
    chains: ChainContext;
    path: string;
    params?: StandardParameter[];
}
