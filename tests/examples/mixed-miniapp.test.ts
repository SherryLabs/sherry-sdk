import { describe, expect, it } from '@jest/globals';
import { mixedActionMiniApp } from '../../src/examples/mixed-miniapp';
import { MetadataValidator } from '../../src/validators/metadataValidator';
import { BlockchainActionValidator } from '../../src/validators/blockchainActionValidator';
import { HttpActionValidator, TransferActionValidator } from '../../src';
import { HttpAction } from '../../src/interface/actions/httpAction';
import { TransferAction } from '../../src/interface/actions/transferAction';
import { BlockchainAction, ValidatedMetadata } from '../../src/interface';

describe('Mixed Action Mini-App', () => {
    it('should have the correct structure and properties', () => {
        expect(mixedActionMiniApp).toHaveProperty('url');
        expect(mixedActionMiniApp).toHaveProperty('icon');
        expect(mixedActionMiniApp).toHaveProperty('title');
        expect(mixedActionMiniApp).toHaveProperty('description');
        expect(mixedActionMiniApp).toHaveProperty('actions');
        expect(mixedActionMiniApp.actions).toHaveLength(3);
    });

    it('should contain one action of each type', () => {
        // Get the actions
        const [httpAction, transferAction, blockchainAction] = mixedActionMiniApp.actions;

        //console.log('httpAction : ', httpAction);
        //console.log('transferAction : ', transferAction);
        //console.log('blockchainAction : ', blockchainAction);

        // Verify action types using the type guard functions
        //expect(isHttpAction(httpAction)).toBe(true);
        //expect(isTransferAction(transferAction)).toBe(true);
        expect(BlockchainActionValidator.isBlockchainAction(blockchainAction)).toBe(false); // It's BlockchainActionMetadata, not BlockchainAction yet
    });

    /*
    it.skip('should successfully validate and process the mini-app', () => {
        // Processing should convert BlockchainActionMetadata to BlockchainAction
        const validatedApp = createMetadata(mixedActionMiniApp);

        expect(validatedApp.actions).toHaveLength(3);

        // First action should remain HttpAction
        expect(isHttpAction(validatedApp.actions[0])).toBe(true);
        expect(validatedApp.actions[0]).toHaveProperty('path');

        // Second action should remain TransferAction
        expect(isTransferAction(validatedApp.actions[1])).toBe(true);
        expect(validatedApp.actions[1]).toHaveProperty('amountConfig');

        // Third action should now be BlockchainAction with the additional properties
        expect(BlockchainActionValidator.isBlockchainAction(validatedApp.actions[2])).toBe(true);
        expect(validatedApp.actions[2]).toHaveProperty('blockchainActionType');
        expect(validatedApp.actions[2]).toHaveProperty('abiParams');
    });
    */

    it('should have correctly configured action parameters after processing', () => {
        // First process the metadata to get validated actions
        let validatedApp = {} as ValidatedMetadata;

        validatedApp = MetadataValidator.createMetadata(mixedActionMiniApp);

        const [httpAction, transferAction, blockchainAction] = validatedApp.actions as [
            HttpAction,
            TransferAction,
            BlockchainAction,
        ];

        // HTTP action validation - check if it maintains core properties
        expect(HttpActionValidator.isHttpAction(httpAction)).toBe(true);
        expect(httpAction).toHaveProperty('path', 'https://api.example.com/feedback');
        expect(httpAction).toHaveProperty('params');
        expect(httpAction.params).toHaveLength(3);

        // Transfer action validation - check if it maintains core properties
        expect(TransferActionValidator.isTransferAction(transferAction)).toBe(true);
        expect(transferAction).toHaveProperty('to', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
        expect(transferAction).toHaveProperty('chains');
        expect(transferAction.chains).toHaveProperty('source', 43114);

        // Verify amountConfig if it exists (optional check to avoid undefined property access)
        if (transferAction.amountConfig) {
            expect(transferAction.amountConfig).toHaveProperty('options');
            expect(Array.isArray(transferAction.amountConfig.options)).toBe(true);
        }

        // Blockchain action validation - check if it has been properly processed
        expect(BlockchainActionValidator.isBlockchainAction(blockchainAction)).toBe(true);
        expect(blockchainAction).toHaveProperty(
            'address',
            '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
        );
        expect(blockchainAction).toHaveProperty('functionName', 'approve');

        // Check properties added during processing
        expect(blockchainAction).toHaveProperty('blockchainActionType');
        expect(blockchainAction).toHaveProperty('abiParams');

        // Check if abiParams array exists and has the right structure
        if (blockchainAction.abiParams) {
            expect(Array.isArray(blockchainAction.abiParams)).toBe(true);
            expect(blockchainAction.abiParams.length).toBe(2);
        }
    });
});
