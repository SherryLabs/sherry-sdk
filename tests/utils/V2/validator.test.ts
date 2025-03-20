import { describe, expect, it, test } from '@jest/globals';
import {
    validateBlockchainActionMetadata,
    validateBlockchainParameters,
    ActionValidationError,
    isStandardParameter,
    isSelectParameter,
    isRadioParameter,
} from '../../../src/utils/V2/validator';
import {
    BlockchainActionMetadataV2,
    StandardParameter,
    SelectParameter,
    RadioParameter,
} from '../../../src/interface/V2/blockchainActionV2';
import {
    tokenSwapMiniApp,
    nftMarketplaceMiniApp,
    daoVotingMiniApp,
} from '../../../src/interface/V2/examplesV2';
import { PARAM_TEMPLATES } from '../../../src/interface/V2/templates';

// Basic ABI for testing
const simpleAbi = [
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
] as const;

// Helper function to create a valid base action
function createValidBaseAction(): BlockchainActionMetadataV2 {
    return {
        label: 'Test Action',
        title: 'Test Title',
        description: 'Test Description',
        address: '0x1234567890123456789012345678901234567890',
        abi: simpleAbi,
        functionName: 'testFunction',
        chains: { source: 'fuji' },
    };
}

describe('Parameter Type Detection', () => {
    it('correctly identifies standard parameters', () => {
        const standardParam: StandardParameter = {
            name: 'testParam',
            label: 'Test Param',
            type: 'text',
            required: true,
        };

        expect(isStandardParameter(standardParam)).toBe(true);
        expect(isSelectParameter(standardParam)).toBe(false);
        expect(isRadioParameter(standardParam)).toBe(false);
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

        expect(isStandardParameter(selectParam)).toBe(false);
        expect(isSelectParameter(selectParam)).toBe(true);
        expect(isRadioParameter(selectParam)).toBe(false);
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

        expect(isStandardParameter(radioParam)).toBe(false);
        expect(isSelectParameter(radioParam)).toBe(false);
        expect(isRadioParameter(radioParam)).toBe(true);
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

        // This should not throw any error
        const action = createValidBaseAction();
        const abiParams = [{ name: 'testRadio', type: 'uint256' }];

        expect(() => validateBlockchainParameters([validRadioParam], abiParams)).not.toThrow();
    });

    it('throws error when radio parameter has less than 2 options', () => {
        const invalidRadioParam: RadioParameter = {
            name: 'testRadio',
            label: 'Test Radio',
            type: 'radio',
            required: true,
            options: [{ label: 'Option 1', value: 1 }],
        };

        const abiParams = [{ name: 'testRadio', type: 'uint256' }];

        expect(() => validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
            ActionValidationError,
        );
        expect(() => validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
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

        const abiParams = [{ name: 'testRadio', type: 'uint256' }];

        expect(() => validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
            ActionValidationError,
        );
        expect(() => validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
            /valores duplicados/,
        );
    });

    it('throws error when radio parameter has duplicate labels', () => {
        const invalidRadioParam: RadioParameter = {
            name: 'testRadio',
            label: 'Test Radio',
            type: 'radio',
            required: true,
            options: [
                { label: 'Same Label', value: 1 },
                { label: 'Same Label', value: 2 }, // Duplicate label
            ],
        };

        const abiParams = [{ name: 'testRadio', type: 'uint256' }];

        expect(() => validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
            ActionValidationError,
        );
        expect(() => validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
            /etiquetas duplicadas/,
        );
    });

    it('throws error when radio parameter default value is not in options', () => {
        const invalidRadioParam: RadioParameter = {
            name: 'testRadio',
            label: 'Test Radio',
            type: 'radio',
            required: true,
            options: [
                { label: 'Option 1', value: 1 },
                { label: 'Option 2', value: 2 },
            ],
            value: 3, // Not in options
        };

        const abiParams = [{ name: 'testRadio', type: 'uint256' }];

        expect(() => validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
            ActionValidationError,
        );
        expect(() => validateBlockchainParameters([invalidRadioParam], abiParams)).toThrow(
            /no está entre las opciones disponibles/,
        );
    });

    it('validates a radio parameter with a valid default value', () => {
        const validRadioParam: RadioParameter = {
            name: 'testRadio',
            label: 'Test Radio',
            type: 'radio',
            required: true,
            options: [
                { label: 'Option 1', value: 1 },
                { label: 'Option 2', value: 2 },
            ],
            value: 2, // Valid option value
        };

        const abiParams = [{ name: 'testRadio', type: 'uint256' }];

        expect(() => validateBlockchainParameters([validRadioParam], abiParams)).not.toThrow();
    });
});

describe('Block Action Metadata Validation', () => {
    it('validates a correct action metadata', () => {
        const validAction = createValidBaseAction();
        expect(() => validateBlockchainActionMetadata(validAction)).not.toThrow();
    });

    it('throws error for invalid address', () => {
        const invalidAction = {
            ...createValidBaseAction(),
            address: '0xinvalid',
        };

        expect(() => validateBlockchainActionMetadata(invalidAction)).toThrow(
            ActionValidationError,
        );
        expect(() => validateBlockchainActionMetadata(invalidAction)).toThrow(/Dirección inválida/);
    });

    it('throws error for non-existent function in ABI', () => {
        const invalidAction = {
            ...createValidBaseAction(),
            functionName: 'nonExistentFunction',
        };

        expect(() => validateBlockchainActionMetadata(invalidAction)).toThrow(
            ActionValidationError,
        );
        expect(() => validateBlockchainActionMetadata(invalidAction)).toThrow(
            /no existe en el ABI/,
        );
    });

    it('throws error for invalid chain', () => {
        const invalidAction = {
            ...createValidBaseAction(),
            chains: { source: 'invalid-chain' },
        };

        expect(() => validateBlockchainActionMetadata(invalidAction)).toThrow(
            ActionValidationError,
        );
        expect(() => validateBlockchainActionMetadata(invalidAction)).toThrow(/chains válida/);
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

        expect(() => validateBlockchainActionMetadata(actionWithParams)).not.toThrow();
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

        expect(() => validateBlockchainActionMetadata(invalidAction)).toThrow(
            ActionValidationError,
        );
        expect(() => validateBlockchainActionMetadata(invalidAction)).toThrow(
            /no existe en el ABI/,
        );
    });
});

describe('Integration with example actions', () => {
    it('validates token swap mini app actions', () => {
        for (const action of tokenSwapMiniApp.actions) {
            expect(() => validateBlockchainActionMetadata(action)).not.toThrow();
        }
    });

    it('validates NFT marketplace mini app actions', () => {
        for (const action of nftMarketplaceMiniApp.actions) {
            expect(() => validateBlockchainActionMetadata(action)).not.toThrow();
        }
    });

    it('validates DAO voting mini app actions', () => {
        for (const action of daoVotingMiniApp.actions) {
            expect(() => validateBlockchainActionMetadata(action)).not.toThrow();
        }
    });
});

describe('Template parameters validation', () => {
    it('validates standard parameter templates', () => {
        const abiParams = [{ name: 'testParam', type: 'string' }];
        expect(() =>
            validateBlockchainParameters(
                [{ ...PARAM_TEMPLATES.TEXT, name: 'testParam' }],
                abiParams,
            ),
        ).not.toThrow();

        expect(() =>
            validateBlockchainParameters(
                [{ ...PARAM_TEMPLATES.EMAIL, name: 'testParam' }],
                abiParams,
            ),
        ).not.toThrow();
    });

    it('validates select parameter templates', () => {
        const abiParams = [{ name: 'testParam', type: 'string' }];
        expect(() =>
            validateBlockchainParameters(
                [{ ...PARAM_TEMPLATES.TOKEN_SELECT, name: 'testParam' }],
                abiParams,
            ),
        ).not.toThrow();
    });

    it('validates radio parameter templates', () => {
        const abiParams = [{ name: 'testParam', type: 'bool' }];
        expect(() =>
            validateBlockchainParameters(
                [{ ...PARAM_TEMPLATES.YES_NO, name: 'testParam' }],
                abiParams,
            ),
        ).not.toThrow();

        expect(() =>
            validateBlockchainParameters(
                [{ ...PARAM_TEMPLATES.PRIORITY, name: 'testParam' }],
                abiParams,
            ),
        ).not.toThrow();
    });
});
