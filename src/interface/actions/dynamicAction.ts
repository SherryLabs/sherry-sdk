import { ChainContext } from '../chains';
import { Parameter } from '../inputs';

export interface DynamicAction {
    type: 'dynamic';
    label: string;
    description?: string;
    chains: ChainContext;
    path: string;
    params?: Parameter[];
}
