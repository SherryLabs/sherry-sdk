import { describe, expect, it } from '@jest/globals';
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
    },
];

// ERC20 approve ABI for token swap testing
const erc20Abi: Abi = [
    {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    }
] as const;

// Router ABI for swapExactIn testing
const routerAbi: Abi = [
    {
        name: 'swapExactIn',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'logic', type: 'address' },
            { name: 'tokenIn', type: 'address' },
            { name: 'tokenOut', type: 'address' },
            { name: 'amountIn', type: 'uint256' },
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' },
            { name: 'route', type: 'bytes' },
        ],
        outputs: [
            { name: 'totalIn', type: 'uint256' },
            { name: 'totalOut', type: 'uint256' },
        ],
    }
] as const;

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

            expect(() =>
                BlockchainActionValidator.validateBlockchainParameters(
                    [validRadioParam],
                    abiParams,
                ),
            ).not.toThrow();
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

            expect(() =>
                BlockchainActionValidator.validateBlockchainParameters(
                    [invalidRadioParam],
                    abiParams,
                ),
            ).toThrow(ActionValidationError);
            expect(() =>
                BlockchainActionValidator.validateBlockchainParameters(
                    [invalidRadioParam],
                    abiParams,
                ),
            ).toThrow(/must have at least 2 options/);
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

            expect(() =>
                BlockchainActionValidator.validateBlockchainParameters(
                    [invalidRadioParam],
                    abiParams,
                ),
            ).toThrow(ActionValidationError);
            expect(() =>
                BlockchainActionValidator.validateBlockchainParameters(
                    [invalidRadioParam],
                    abiParams,
                ),
            ).toThrow(/has options with duplicate values/);
        });
    });

    describe('Block Action Metadata Validation', () => {
        it('validates a correct action metadata', () => {
            const validAction = createValidBaseAction();
            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadata(validAction),
            ).not.toThrow();
        });

        it('throws error for invalid address', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                address: '0xinvalid',
            };

            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction),
            ).toThrow(ActionValidationError);
            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction),
            ).toThrow(/Invalid address/);
        });

        it('throws error for non-existent function in ABI', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                functionName: 'nonExistentFunction',
            };

            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction),
            ).toThrow(ActionValidationError);
            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction),
            ).toThrow(/does not exist in/);
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

            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadata(actionWithParams),
            ).not.toThrow();
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

            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction),
            ).toThrow(ActionValidationError);
            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadata(invalidAction),
            ).toThrow(/does not exist in the function's ABI/);
        });

        it('throws error for amount with non-payable function', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                amount: 0.1, // Cannot specify amount for non-payable
            };

            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                /not payable/,
            );
        });

        it('allows amount with payable function', () => {
            const payableAction = {
                ...createValidBaseAction(),
                functionName: 'payableFunction',
                amount: 0.1,
            };

            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadata(payableAction),
            ).not.toThrow();
        });
    });

    describe('Token Swap Actions Validation - LFJ V1', () => {
        const ROUTER_ADDRESS = '0x45A62B090DF48243F12A21897e7ed91863E2c86b';
        const USDC_ADDRESS = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
        const LOGIC_ADDRESS = '0xC04f291347D21DC663f7646056db22bFf8CE8430';
        
        it('validates ERC20 approve action with fixed parameters', () => {
            const approveAction: BlockchainActionMetadata = {
                label: 'Aprobar USDC',
                description: 'Autoriza al router a usar tus USDC',
                address: USDC_ADDRESS,
                abi: erc20Abi,
                functionName: 'approve',
                chains: { source: 'avalanche' },
                params: [
                    {
                        name: 'spender',
                        label: 'Router Address',
                        type: 'address',
                        required: true,
                        value: ROUTER_ADDRESS,
                        fixed: true,
                    },
                    {
                        name: 'amount',
                        label: 'Monto a Aprobar',
                        type: 'number',
                        required: true,
                        value: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                        fixed: true,
                    },
                ],
            };
            
            // This should not throw any error
            expect(() => BlockchainActionValidator.validateBlockchainAction(approveAction)).not.toThrow();
        });
        
        it('validates swapExactIn with native token input (AVAX)', () => {
            const swapAction: BlockchainActionMetadata = {
                label: 'Swap AVAX por USDC',
                description: 'Intercambia AVAX nativo por USDC',
                address: ROUTER_ADDRESS,
                abi: routerAbi,
                functionName: 'swapExactIn',
                chains: { source: 'avalanche' },
                params: [
                    {
                        name: 'logic',
                        label: 'Contrato Lógica',
                        type: 'address',
                        required: true,
                        value: LOGIC_ADDRESS,
                        fixed: true,
                    },
                    {
                        name: 'tokenIn',
                        label: 'Token de Entrada',
                        type: 'address',
                        required: true,
                        value: '0x0000000000000000000000000000000000000000', // Address 0 for native AVAX
                        fixed: true,
                    },
                    {
                        name: 'tokenOut',
                        label: 'Token de Salida',
                        type: 'address',
                        required: true,
                        value: USDC_ADDRESS,
                        fixed: true,
                    },
                    {
                        name: 'amountIn',
                        label: 'Cantidad de AVAX',
                        type: 'number',
                        required: true,
                        value: '0',
                        fixed: true,
                    },
                    {
                        name: 'amountOutMin',
                        label: 'Mínimo USDC a Recibir',
                        type: 'number',
                        required: true,
                        value: '10',
                        fixed: false,
                    },
                    {
                        name: 'to',
                        label: 'Destinatario',
                        type: 'address',
                        required: true,
                        value: 'sender',
                        fixed: true,
                    },
                    {
                        name: 'deadline',
                        label: 'Tiempo de Expiración',
                        type: 'number',
                        required: true,
                        value: Math.floor(Date.now() / 1000) + 1200,
                        fixed: true,
                    },
                    {
                        name: 'route',
                        label: 'Ruta de Swap',
                        type: 'text',
                        required: true,
                        value: '0x',
                        fixed: true,
                    },
                ],
            };
            
            // This should not throw any error with our new validation logic
            expect(() => BlockchainActionValidator.validateBlockchainAction(swapAction)).not.toThrow();
        });
        
        it('throws error for amount with non-payable function when not related to swaps', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                amount: 0.1, // Cannot specify amount for non-payable
            };
            
            // This should still throw an error as it's not a token swap
            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                /not payable/,
            );
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
