import { UIParameter, TransferAction } from '../interface/blockchainAction';
import { InvalidMetadataError } from '../utils/customErrors';
import { isAddress } from '../index';

export class BlockchainActionValidator {
    static validateUIParameter(param: UIParameter, value: any, name: string): void {
        if (param.minValue !== undefined && value < param.minValue) {
            throw new InvalidMetadataError(`${name}: Value must be greater than ${param.minValue}`);
        }

        if (param.maxValue !== undefined && value > param.maxValue) {
            throw new InvalidMetadataError(`${name}: Value must be less than ${param.maxValue}`);
        }
    }

    static validateTransferAction(action: TransferAction): void {
        if (action.ui?.amountConfig) {
            const config = action.ui.amountConfig;
            if (action.amount !== undefined) {
                if (config.minValue !== undefined && action.amount < config.minValue) {
                    throw new InvalidMetadataError(
                        config.errorMessage || `Amount must be greater than ${config.minValue}`,
                    );
                }
                if (config.maxValue !== undefined && action.amount > config.maxValue) {
                    throw new InvalidMetadataError(
                        config.errorMessage || `Amount must be less than ${config.maxValue}`,
                    );
                }
            }
        }

        if (action.ui?.addressConfig && action.to) {
            if (!isAddress(action.to)) {
                throw new InvalidMetadataError(
                    action.ui.addressConfig.errorMessage || 'Invalid address format',
                );
            }
        }
    }
}
