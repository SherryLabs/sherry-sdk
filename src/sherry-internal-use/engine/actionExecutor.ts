import { BlockchainAction } from '../../interface/blockchainAction';
import { HttpAction } from '../../interface/httpAction';
import { TransferAction } from '../../interface/transferAction';
import { isBlockchainAction } from '../../utils/createMetadata';
import { isTransferAction, isHttpAction } from '../../validators/validator';

export async function executeAction(
    action: BlockchainAction | TransferAction | HttpAction,
): Promise<any> {
    try {
        if (isBlockchainAction(action)) {
            return await executeBlockchainAction(action);
        } else if (isTransferAction(action)) {
            return await executeTransferAction(action);
        } else if (isHttpAction(action)) {
            return await executeHttpAction(action);
        } else {
            throw new Error('Unknown action type');
        }
    } catch (error) {
        console.error('Error executing action:', error);
        throw error;
    }
}

async function executeBlockchainAction(action: BlockchainAction): Promise<any> {
    console.log(
        `Executing blockchain action: ${action.functionName} on contract ${action.address}`,
    );
    // Implement blockchain interaction logic
}

async function executeTransferAction(action: TransferAction): Promise<any> {
    console.log(`Executing transfer: ${action.amount} to ${action.to || 'user-specified address'}`);
    // Implement transfer logic
}

async function executeHttpAction(action: HttpAction): Promise<any> {
    console.log(`Executing HTTP request to: ${action.endpoint}`);
    // Implement HTTP request logic
}
