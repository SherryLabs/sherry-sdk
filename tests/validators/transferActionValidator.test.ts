import { describe, expect, it } from '@jest/globals';
import { TransferActionValidator } from '../../src/validators/transferActionValidator';
import { TransferAction } from '../../src/interface/transferAction';
import { InvalidMetadataError } from '../../src/errors/customErrors';

describe('TransferActionValidator', () => {
    const validTransferAction: TransferAction = {
        label: 'Transfer AVAX',
        description: 'Send AVAX to a recipient',
        chains: { source: 'avalanche' },
        to: '0x1234567890123456789012345678901234567890',
        amount: 0.1
    };

    describe('isTransferAction', () => {
        it('identifies valid transfer actions', () => {
            expect(TransferActionValidator.isTransferAction(validTransferAction)).toBe(true);
        });

        it('rejects non-transfer actions', () => {
            const blockchainAction = {
                label: 'Call Contract',
                address: '0x1234567890123456789012345678901234567890',
                abi: [],
                functionName: 'test',
                chains: { source: 'avalanche' }
            };
            expect(TransferActionValidator.isTransferAction(blockchainAction)).toBe(false);
        });

        it('rejects invalid objects', () => {
            expect(TransferActionValidator.isTransferAction(null)).toBe(false);
            expect(TransferActionValidator.isTransferAction({})).toBe(false);
            expect(TransferActionValidator.isTransferAction({ label: 'Test' })).toBe(false);
        });
    });

    describe('validateTransferAction', () => {
        it('validates correct transfer action', () => {
            expect(() => TransferActionValidator.validateTransferAction(validTransferAction)).not.toThrow();
            const result = TransferActionValidator.validateTransferAction(validTransferAction);
            expect(result).toEqual(validTransferAction);
        });

        it('validates transfer action with recipient config', () => {
            const actionWithRecipientConfig: TransferAction = {
                label: 'Transfer Tokens',
                chains: { source: 'avalanche' },
                recipient: {
                    inputType: 'select',
                    options: [
                        { label: 'Option 1', value: '0x1234567890123456789012345678901234567890' },
                        { label: 'Option 2', value: '0x2345678901234567890123456789012345678901' }
                    ]
                },
                amount: 0.1
            };
            
            expect(() => TransferActionValidator.validateTransferAction(actionWithRecipientConfig)).not.toThrow();
        });
        
        it('validates transfer action with amount config', () => {
            const actionWithAmountConfig: TransferAction = {
                label: 'Transfer Tokens',
                chains: { source: 'avalanche' },
                to: '0x1234567890123456789012345678901234567890',
                amountConfig: {
                    inputType: 'select',
                    options: [
                        { label: 'Small', value: 0.1, description: '0.1 AVAX' },
                        { label: 'Medium', value: 0.5, description: '0.5 AVAX' }
                    ]
                }
            };
            
            expect(() => TransferActionValidator.validateTransferAction(actionWithAmountConfig)).not.toThrow();
        });

        it('rejects transfer without recipient', () => {
            const invalidAction = {
                ...validTransferAction,
                to: undefined
            };
            
            expect(() => TransferActionValidator.validateTransferAction(invalidAction as TransferAction))
                .toThrow(InvalidMetadataError);
            expect(() => TransferActionValidator.validateTransferAction(invalidAction as TransferAction))
                .toThrow('Either "to" or "recipient" must be provided');
        });

        it('rejects transfer with invalid chain', () => {
            const invalidAction = {
                ...validTransferAction,
                chains: { source: 'invalid-chain' }
            };
            
            expect(() => TransferActionValidator.validateTransferAction(invalidAction as TransferAction))
                .toThrow(InvalidMetadataError);
            expect(() => TransferActionValidator.validateTransferAction(invalidAction as TransferAction))
                .toThrow('Invalid source chain');
        });
        
        it('rejects transfer with negative amount', () => {
            const invalidAction = {
                ...validTransferAction,
                amount: -0.1
            };
            
            expect(() => TransferActionValidator.validateTransferAction(invalidAction as TransferAction))
                .toThrow(InvalidMetadataError);
            expect(() => TransferActionValidator.validateTransferAction(invalidAction as TransferAction))
                .toThrow('Amount must be a positive number');
        });
    });
});
