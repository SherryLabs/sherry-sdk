// create-metadata.ts
import { Metadata, ValidatedMetadata } from '../interface/metadata';
import { ValidatedAction } from '../interface/action';
import { ActionFlow } from '../interface/nestedAction';
import { isActionFlow } from '../validators/flowValidator';
import {
    BlockchainActionValidator,
    isBlockchainAction,
    isBlockchainActionMetadata,
} from '../validators/blockchainActionValidator';
import { validateChainContext } from '../validators/chainValidator';
import { validateParameter } from '../validators/parameterValidator';
import { createMetadata } from '../validators/metadataValidator';

// Re-export all the functions for backward compatibility
export {
    isBlockchainAction,
    isBlockchainActionMetadata,
    validateChainContext,
    validateParameter,
    createMetadata,
    isActionFlow,
};
