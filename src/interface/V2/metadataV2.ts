import { BlockchainActionMetadataV2, BlockchainActionV2 } from './blockchainActionV2';
import { HttpAction } from '../httpAction';
import { TransferAction } from '../blockchainAction';

export interface MetadataV2 {
    url: string;
    icon: string;
    title: string;
    description: string;
    actions: (BlockchainActionMetadataV2 | TransferAction | HttpAction)[];
}

export interface ValidatedMetadataV2 extends Omit<MetadataV2, 'actions'> {
    actions: (BlockchainActionV2 | TransferAction | HttpAction)[];
}
