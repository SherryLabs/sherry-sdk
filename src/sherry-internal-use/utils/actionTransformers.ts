import { BlockchainActionMetadata } from '../../interface/blockchainAction';
import { HttpAction } from '../../interface/httpAction';
import { TransferAction } from '../../interface/transferAction';
import { isBlockchainActionMetadata } from '../../utils/createMetadata';
import { isTransferAction, isHttpAction } from '../../utils/validator';

type AnyAction = BlockchainActionMetadata | TransferAction | HttpAction;

export function convertToTutorialFormat(action: AnyAction): string {
    if (isBlockchainActionMetadata(action)) {
        return `# Blockchain Action Tutorial
To execute the "${action.label}" action:
1. Connect to the ${action.chains.source} blockchain
2. Call the ${action.functionName} function on contract ${action.address}`;
    }

    if (isTransferAction(action)) {
        return `# Transfer Tutorial
To execute the "${action.label}" transfer:
1. Connect to the ${action.chains.source} blockchain
2. Send ${action.amount || 'the specified amount'} to ${action.to || 'the recipient'}`;
    }

    if (isHttpAction(action)) {
        return `# API Request Tutorial
To execute the "${action.label}" API call:
1. Send a request to ${action.endpoint}
2. Include the following parameters: ${action.params.map(p => p.name).join(', ')}`;
    }

    return 'Unknown action type';
}
