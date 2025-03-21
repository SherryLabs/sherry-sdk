import { describe, expect, it, test } from '@jest/globals';
import { BlockchainActionValidator } from '../../src/validators/blockchainActionValidator';
import {
    BlockchainActionMetadata,
    StandardParameter,
    SelectParameter,
    RadioParameter,
} from '../../src/interface/blockchainAction';
import { ActionValidationError } from '../../src/errors/customErrors';
import { Abi } from 'abitype';

// Basic ABI for testing
const simpleAbi: Abi = [
    {
        name: 'testFunction',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'param1', type: 'string' },
            { name: 'param2', type: 'uint256' },
            { name: 'param3', type: 'bool' },
            { name: 'param4', type: 'address' },
        ],
        outputs: [],
    },
    {
        name: 'payableFunction',
        type: 'function',
        stateMutability: 'payable',
        inputs: [],
        outputs: [],
    }
];

// Helper function to create a valid base action
function createValidBaseAction(): BlockchainActionMetadata {
    return {
        label: 'Test Action',
        description: 'Test Description',
        address: '0x1234567890123456789012345678901234567890',
        abi: simpleAbi,
        functionName: 'testFunction',
        chains: { source: 'fuji' },
    };
}

describe('BlockchainActionValidator', () => {
    describe('Parameter Type Detection', () => {
        it('correctly identifies standard parameters', () => {
            const standardParam: StandardParameter = {
                name: 'testParam',
                label: 'Test Param',
                type: 'text',
                required: true,
            };

            expect(BlockchainActionValidator.isStandardParameter(standardParam)).toBe(true);
            expect(BlockchainActionValidator.isSelectParameter(standardParam)).toBe(false);
            expect(BlockchainActionValidator.isRadioParameter(standardParam)).toBe(false);
        });

        it('correctly identifies select parameters', () => {
            const selectParam: SelectParameter = {
                name: 'testParam',
                label: 'Test Param',
                type: 'select',
                required: true,
                options: [
                    { label: 'Option 1', value: 1 },
                    { label: 'Option 2', value: 2 },
                ],
            };

            expect(BlockchainActionValidator.isStandardParameter(selectParam)).toBe(false);
            expect(BlockchainActionValidator.isSelectParameter(selectParam)).toBe(true);
            expect(BlockchainActionValidator.isRadioParameter(selectParam)).toBe(false);
        });

        it('correctly identifies radio parameters', () => {
            const radioParam: RadioParameter = {
                name: 'testParam',
                label: 'Test Param',
                type: 'radio',
                required: true,
                options: [
                    { label: 'Option 1', value: 1 },
                    { label: 'Option 2', value: 2 },
                ],
            };

            expect(BlockchainActionValidator.isStandardParameter(radioParam)).toBe(false);
            expect(BlockchainActionValidator.isSelectParameter(radioParam)).toBe(false);
            expect(BlockchainActionValidator.isRadioParameter(radioParam)).toBe(true);
        });
    });

    describe('Radio Parameter Validation', () => {
        it('validates a correct radio parameter', () => {
            const validRadioParam: RadioParameter = {
                name: 'testRadio',
                label: 'Test Radio',
                type: 'radio',
                required: true,
                options: [
                    { label: 'Option 1', value: 1 },
                    { label: 'Option 2', value: 2 },
                ],
            };

            const abiParams = [{ name: 'testRadio', type: 'uint256' }] as const;

            expect(() => BlockchainActionValidator.validateBlockchainParameters([validRadioParam], abiParams)).not.toThrow();
        });

        it('throws error when radio parameter has less than 2 options', () => {
            const invalidRadioParam: RadioParameter = {
                name: 'testRadio',
                label: 'Test Radio',
                type: 'radio',
                required: true,
                options: [{ label: 'Option 1', value: 1 }],
            };

            const abiParams = [{ name: 'testRadio', type: 'uint256' }] as const;

            expect(() => BlockchainActionValidator.validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
                /debe tener al menos 2 opciones/,
            );
        });

        it('throws error when radio parameter has duplicate values', () => {
            const invalidRadioParam: RadioParameter = {
                name: 'testRadio',
                label: 'Test Radio',
                type: 'radio',
                required: true,
                options: [
                    { label: 'Option 1', value: 1 },
                    { label: 'Option 2', value: 1 }, // Duplicate value
                ],
            };

            const abiParams = [{ name: 'testRadio', type: 'uint256' }] as const;

            expect(() => BlockchainActionValidator.validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
                /valores duplicados/,
            );
        });
    });

    describe('Block Action Metadata Validation', () => {
        it('validates a correct action metadata', () => {
            const validAction = createValidBaseAction();
            expect(() => BlockchainActionValidator.validateBlockchainActionMetadata(validAction)).not.toThrow();
        });

        it('throws error for invalid address', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                address: '0xinvalid',
            };

            expect(() => BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction)).toThrow(/Dirección inválida/);
        });

        it('throws error for non-existent function in ABI', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                functionName: 'nonExistentFunction',
            };

            expect(() => BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction)).toThrow(
                /no existe en el ABI/,
            );
        });

        it('validates action with valid parameters', () => {
            const actionWithParams = {
                ...createValidBaseAction(),
                params: [
                    {
                        name: 'param1',
                        label: 'Text Parameter',
                        type: 'text',
                        required: true,
                    },
                    {
                        name: 'param2',
                        label: 'Number Parameter',
                        type: 'number',
                        required: true,
                    },
                    {
                        name: 'param3',
                        label: 'Boolean Parameter',
                        type: 'boolean',
                        required: true,
                    },
                    {
                        name: 'param4',
                        label: 'Address Parameter',
                        type: 'address',
                        required: true,
                    },
                ],
            };

            expect(() => BlockchainActionValidator.validateBlockchainActionMetadata(actionWithParams)).not.toThrow();
        });

        it('throws error for parameter that does not exist in ABI', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                params: [
                    {
                        name: 'nonExistentParam',
                        label: 'Invalid Param',
                        type: 'text',
                        required: true,
                    },
                ],
            };

            expect(() => BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction)).toThrow(
                /no existe en el ABI/,
            );
        });
        
        it('throws error for amount with non-payable function', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                amount: 0.1, // Cannot specify amount for non-payable
            };

            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                ActionValidationError,
            );
        });
        
        it('allows amount with payable function', () => {
            const payableAction = {
                ...createValidBaseAction(),
                functionName: 'payableFunction',
                amount: 0.1,
            };

            expect(() => BlockchainActionValidator.validateBlockchainActionMetadata(payableAction)).not.toThrow();
        });
    });
    
    describe('validateBlockchainAction - Full Action Processing', () => {
        it('processes blockchain action correctly', () => {
            const validAction = createValidBaseAction();
            const processedAction = BlockchainActionValidator.validateBlockchainAction(validAction);
            
            expect(processedAction.blockchainActionType).toBe('nonpayable');
            expect(Array.isArray(processedAction.abiParams)).toBe(true);
            expect(processedAction.abiParams).toHaveLength(4);
        });
    });
});
