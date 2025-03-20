import { BlockchainActionMetadata, BlockchainAction } from '../interface/blockchainAction';
import { HttpAction } from './httpAction';
import { TransferAction } from './transferAction';

export interface Metadata {
    url: string;
    icon: string;
    title: string;
    description: string;
    actions: (BlockchainActionMetadata | TransferAction | HttpAction)[];
}

export interface ValidatedMetadata extends Omit<Metadata, 'actions'> {
    actions: (BlockchainAction | TransferAction | HttpAction)[];
}
