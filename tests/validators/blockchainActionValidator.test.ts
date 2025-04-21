import { describe, expect, it } from '@jest/globals'; // Import jest for mocking console
import { BlockchainActionValidator } from '../../src/validators/blockchainActionValidator';
import {
    BlockchainActionMetadata,
    SelectParameter,
    RadioParameter,
} from '../../src/interface/actions/blockchainAction';
import { ActionValidationError } from '../../src/errors/customErrors';
import { Abi, AbiParameter, AbiFunction } from 'abitype';

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
    {
        name: 'noParamsFunction',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
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
    },
] as const;

// Router ABI for swapExactIn testing
const routerAbi: Abi = [
    {
        name: 'swapExactIn',
        type: 'function',
        stateMutability: 'nonpayable', // Assuming non-payable for this example swap
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
    },
] as const;

// Helper function to create a valid base action
function createValidBaseAction(
    functionName: string = 'testFunction',
    abi: Abi = simpleAbi,
): BlockchainActionMetadata {
    return {
        label: 'Test Action',
        description: 'Test Description',
        address: '0x1234567890123456789012345678901234567890',
        abi: abi,
        functionName: functionName,
        chains: { source: 'fuji' },
    };
}

describe('BlockchainActionValidator', () => {
    // --- Tests for Parameter Validation Logic (implicitly tested via validateBlockchainAction) ---

    describe('Radio Parameter Validation', () => {

        it('validates a correct radio parameter compatible with ABI', () => {
            const validRadioParam: RadioParameter = {
                name: 'param2', // Corresponds to uint256 in simpleAbi
                label: 'Test Radio',
                type: 'radio',
                required: true,
                options: [
                    { label: 'Option 1', value: 1 }, // Number compatible with uint256
                    { label: 'Option 2', value: 2 }, // Number compatible with uint256
                ],
            };
            const action = {
                ...createValidBaseAction(),
                params: [
                    { name: 'param1', label: 'P1', type: 'text', value: 'abc' },
                    validRadioParam, // Insert the radio param
                    { name: 'param3', label: 'P3', type: 'bool', value: true },
                    { name: 'param4', label: 'P4', type: 'address', value: '0x1111111111111111111111111111111111111111' },
                ],
            } as BlockchainActionMetadata;

            expect(() => BlockchainActionValidator.validateBlockchainAction(action)).not.toThrow();
        });

        // Test for "less than 2 options" removed as it's now a warning

        it('throws error when radio parameter has duplicate values', () => {
            const invalidRadioParam: RadioParameter = {
                name: 'param2', // uint256
                label: 'Test Radio',
                type: 'radio',
                required: true,
                options: [
                    { label: 'Option 1', value: 1 },
                    { label: 'Option 2', value: 1 }, // Duplicate value
                ],
            };
             const action = {
                ...createValidBaseAction(),
                params: [
                    { name: 'param1', label: 'P1', type: 'text', value: 'abc' },
                    invalidRadioParam,
                    { name: 'param3', label: 'P3', type: 'bool', value: true },
                    { name: 'param4', label: 'P4', type: 'address', value: '0x1111111111111111111111111111111111111111' },
                ],
            } as BlockchainActionMetadata;

            expect(() => BlockchainActionValidator.validateBlockchainAction(action)).toThrow(
                ActionValidationError,
            );
            // Check the specific error message from validateSelectionOptions
            expect(() => BlockchainActionValidator.validateBlockchainAction(action)).toThrow(
                /has options with duplicate values/,
            );
        });

        it('throws error when radio parameter option value is incompatible with ABI type', () => {
            const invalidRadioParam: RadioParameter = {
                name: 'param2', // uint256
                label: 'Test Radio',
                type: 'radio',
                required: true,
                options: [
                    { label: 'Option 1', value: 1 },
                    { label: 'Option 2', value: 'not-a-number' }, // Incompatible value
                ],
            };
             const action = {
                ...createValidBaseAction(),
                params: [
                    { name: 'param1', label: 'P1', type: 'text', value: 'abc' },
                    invalidRadioParam,
                    { name: 'param3', label: 'P3', type: 'bool', value: true },
                    { name: 'param4', label: 'P4', type: 'address', value: '0x1111111111111111111111111111111111111111' },
                ],
            } as BlockchainActionMetadata;

            expect(() => BlockchainActionValidator.validateBlockchainAction(action)).toThrow(
                ActionValidationError,
            );
            // Check the specific error message from isValueCompatible via validateBlockchainParameters
            expect(() => BlockchainActionValidator.validateBlockchainAction(action)).toThrow(
                /Invalid option value 'not-a-number'.*Expected value compatible with ABI type 'uint256'/,
            );
        });
    });

     describe('Select Parameter Validation', () => {
         it('validates a select parameter with address options for an address ABI type', () => {
             const validSelectParam: SelectParameter = {
                 name: 'param4', // Corresponds to address in simpleAbi
                 label: 'Select Address',
                 type: 'select',
                 required: true,
                 options: [
                     { label: 'Address 1', value: '0x1111111111111111111111111111111111111111' },
                     { label: 'Address 2', value: '0x2222222222222222222222222222222222222222' },
                     { label: 'Sender Keyword', value: 'sender' }, // Also valid
                 ],
             };
             const action = {
                 ...createValidBaseAction(),
                 params: [
                     { name: 'param1', label: 'P1', type: 'text', value: 'abc' },
                     { name: 'param2', label: 'P2', type: 'number', value: 123 },
                     { name: 'param3', label: 'P3', type: 'bool', value: true },
                     validSelectParam, // Insert the select param
                 ],
             } as BlockchainActionMetadata;

             expect(() => BlockchainActionValidator.validateBlockchainAction(action)).not.toThrow();
         });

         it('throws error when select parameter option value is incompatible with ABI type', () => {
             const invalidSelectParam: SelectParameter = {
                 name: 'param4', // address
                 label: 'Select Address',
                 type: 'select',
                 required: true,
                 options: [
                     { label: 'Valid Address', value: '0x1111111111111111111111111111111111111111' },
                     { label: 'Invalid Value', value: 123 }, // Incompatible number for address
                 ],
             };
              const action = {
                 ...createValidBaseAction(),
                 params: [
                     { name: 'param1', label: 'P1', type: 'text', value: 'abc' },
                     { name: 'param2', label: 'P2', type: 'number', value: 123 },
                     { name: 'param3', label: 'P3', type: 'bool', value: true },
                     invalidSelectParam,
                 ],
             } as BlockchainActionMetadata;

             expect(() => BlockchainActionValidator.validateBlockchainAction(action)).toThrow(
                 ActionValidationError,
             );
             expect(() => BlockchainActionValidator.validateBlockchainAction(action)).toThrow(
                 /Invalid option value '123'.*Expected value compatible with ABI type 'address'/,
             );
         });
     });


    describe('Block Action Metadata and Parameter Structure Validation', () => {
        it('validates a correct action metadata (structure only)', () => {
            const validAction = createValidBaseAction('noParamsFunction'); // Use function with no params
            // Test structure validation which happens first
            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadataStructure(validAction),
            ).not.toThrow();
        });

         it('validates a correct action using the main validation function', () => {
            const validAction = createValidBaseAction('noParamsFunction');
            expect(() =>
                BlockchainActionValidator.validateBlockchainAction(validAction),
            ).not.toThrow();
        });


        it('throws error for invalid address', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                address: '0xinvalid',
            };
            // Structure validation should catch this
            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadataStructure(invalidAction),
            ).toThrow(ActionValidationError);
            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadataStructure(invalidAction),
            ).toThrow(/Invalid or missing contract address/);
        });

        it('throws error for non-existent function in ABI', () => {
            const invalidAction = {
                ...createValidBaseAction(),
                functionName: 'nonExistentFunction',
            };
             // Structure validation should catch this
            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadataStructure(invalidAction),
            ).toThrow(ActionValidationError);
            expect(() =>
                BlockchainActionValidator.validateBlockchainActionMetadataStructure(invalidAction),
            ).toThrow(/does not exist in the provided ABI/);
        });

        it('validates action with valid parameters matching ABI order and compatible types', () => {
            const actionWithParams: BlockchainActionMetadata = {
                ...createValidBaseAction(), // Uses testFunction by default
                params: [
                    {
                        name: 'param1', // string
                        label: 'Text Parameter',
                        type: 'text', // UI type compatible with string
                        required: true,
                    },
                    {
                        name: 'param2', // uint256
                        label: 'Number Parameter',
                        type: 'number', // UI type compatible with uint
                        required: true,
                    },
                    {
                        name: 'param3', // bool
                        label: 'Boolean Parameter',
                        type: 'bool', // ABI type matching
                        required: true,
                    },
                    {
                        name: 'param4', // address
                        label: 'Address Parameter',
                        type: 'address', // ABI type matching
                        required: true,
                    },
                ],
            };
            // Main validation function should handle parameter validation
            expect(() =>
                BlockchainActionValidator.validateBlockchainAction(actionWithParams),
            ).not.toThrow();
        });

        it('throws error for parameter count mismatch (too few)', () => {
            const invalidAction = {
                ...createValidBaseAction(), // Expects 4 params
                params: [ // Only providing 1
                    {
                        name: 'param1',
                        label: 'Valid Param',
                        type: 'text',
                        required: true,
                    },
                ],
            } as BlockchainActionMetadata;

            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                ActionValidationError,
            );
            // Expect the count mismatch error from validateBlockchainParameters
            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                /Parameter count mismatch.*expects 4, received 1/,
            );
        });

         it('throws error for parameter count mismatch (too many)', () => {
            const invalidAction = {
                ...createValidBaseAction('noParamsFunction'), // Expects 0 params
                params: [ // Providing 1
                    {
                        name: 'extraParam',
                        label: 'Extra Param',
                        type: 'text',
                        required: true,
                    },
                ],
            } as BlockchainActionMetadata;

            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                /Parameter count mismatch.*expects 0, received 1/,
            );
        });

         it('throws error for parameter name/order mismatch', () => {
            const invalidAction = {
                ...createValidBaseAction(), // Expects param1, param2, ...
                params: [
                    { name: 'param2', label: 'P2', type: 'number' }, // Wrong order
                    { name: 'param1', label: 'P1', type: 'text' },
                    { name: 'param3', label: 'P3', type: 'bool' },
                    { name: 'param4', label: 'P4', type: 'address' },
                ],
            } as BlockchainActionMetadata;

            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                /Parameter name mismatch at index 0.*Expected 'param1', received 'param2'/,
            );
        });


        it('throws error for amount with non-payable function', () => {
            const invalidAction = {
                ...createValidBaseAction(), // testFunction is non-payable
                amount: 0.1,
            };

            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                ActionValidationError,
            );
            expect(() => BlockchainActionValidator.validateBlockchainAction(invalidAction)).toThrow(
                /not payable.*amount.*provided at the top level/,
            );
        });

        it('allows amount with payable function', () => {
            const payableAction = {
                ...createValidBaseAction('payableFunction'), // Use the payable function
                amount: 0.1,
            };
            // Use main validation function
            expect(() =>
                BlockchainActionValidator.validateBlockchainAction(payableAction),
            ).not.toThrow();
        });
    });

    describe('Token Swap Actions Validation - LFJ V1', () => {
        const ROUTER_ADDRESS = '0x45A62B090DF48243F12A21897e7ed91863E2c86b';
        const USDC_ADDRESS = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
        const LOGIC_ADDRESS = '0xC04f291347D21DC663f7646056db22bFf8CE8430';

        it('validates ERC20 approve action with fixed parameters (string amount)', () => {
            const approveAction: BlockchainActionMetadata = {
                label: 'Aprobar USDC',
                description: 'Autoriza al router a usar tus USDC',
                address: USDC_ADDRESS,
                abi: erc20Abi,
                functionName: 'approve',
                chains: { source: 'avalanche' },
                params: [
                    {
                        name: 'spender', // address
                        label: 'Router Address',
                        type: 'address', // ABI type match
                        required: true,
                        value: ROUTER_ADDRESS,
                        fixed: true,
                    },
                    {
                        name: 'amount', // uint256
                        label: 'Monto a Aprobar',
                        // No user type specified, should infer 'number' or similar from ABI uint256
                        type: 'number', // Explicitly setting compatible UI type is also fine
                        required: true,
                        // Value is a string, but isValueCompatible should handle valid integer strings for uint256
                        value: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                        fixed: true,
                    },
                ],
            };

            // This should not throw any error
            expect(() =>
                BlockchainActionValidator.validateBlockchainAction(approveAction),
            ).not.toThrow();
        });

        it('validates swapExactIn with native token input (AVAX)', () => {
            const swapAction: BlockchainActionMetadata = {
                label: 'Swap AVAX por USDC',
                description: 'Intercambia AVAX nativo por USDC',
                address: ROUTER_ADDRESS,
                abi: routerAbi,
                functionName: 'swapExactIn',
                chains: { source: 'avalanche' },
                // Note: swapExactIn is often payable when swapping *from* native token
                // Let's assume the ABI provided is correct (nonpayable) for this test,
                // or adjust if the real ABI is payable and add `amount` property.
                // amount: 0.1, // Add if function is payable and swapping FROM native
                params: [
                    {
                        name: 'logic', // address
                        label: 'Contrato Lógica',
                        type: 'address',
                        required: true,
                        value: LOGIC_ADDRESS,
                        fixed: true,
                    },
                    {
                        name: 'tokenIn', // address
                        label: 'Token de Entrada',
                        type: 'address',
                        required: true,
                        value: '0x0000000000000000000000000000000000000000', // Address 0 for native AVAX
                        fixed: true,
                    },
                    {
                        name: 'tokenOut', // address
                        label: 'Token de Salida',
                        type: 'address',
                        required: true,
                        value: USDC_ADDRESS,
                        fixed: true,
                    },
                    {
                        name: 'amountIn', // uint256
                        label: 'Cantidad de AVAX',
                        type: 'number', // Compatible UI type
                        required: true,
                        // If function is payable, this might be ignored and action.amount used instead.
                        // If non-payable, this value would be used.
                        value: 0, // Using number 0, compatible with uint256
                        fixed: true, // Or false if user inputs amount
                    },
                    {
                        name: 'amountOutMin', // uint256
                        label: 'Mínimo USDC a Recibir',
                        type: 'number',
                        required: true,
                        value: 10, // Number compatible
                        fixed: false, // User likely inputs this
                    },
                    {
                        name: 'to', // address
                        label: 'Destinatario',
                        type: 'address',
                        required: true,
                        value: 'sender', // Special keyword compatible with address
                        fixed: true,
                    },
                    {
                        name: 'deadline', // uint256
                        label: 'Tiempo de Expiración',
                        type: 'number',
                        required: true,
                        value: Math.floor(Date.now() / 1000) + 1200, // Number compatible
                        fixed: true,
                    },
                    {
                        name: 'route', // bytes
                        label: 'Ruta de Swap',
                        type: 'text', // Compatible UI type for bytes (hex string expected)
                        required: true,
                        value: '0x', // Valid hex string compatible with bytes
                        fixed: true,
                    },
                ],
            };

            // This should not throw any error with our new validation logic
            expect(() =>
                BlockchainActionValidator.validateBlockchainAction(swapAction),
            ).not.toThrow();
        });

        // Duplicate test removed
    });

    describe('validateBlockchainAction - Full Action Processing', () => {
        it('processes blockchain action correctly and adds abiParams/blockchainActionType', () => {
            const validActionMeta = createValidBaseAction(); // Uses testFunction
            const processedAction = BlockchainActionValidator.validateBlockchainAction(validActionMeta);

            expect(processedAction.blockchainActionType).toBe('nonpayable');
            expect(Array.isArray(processedAction.abiParams)).toBe(true);
            // Ensure abiParams is a mutable copy and matches expected length
            expect(processedAction.abiParams).toHaveLength((simpleAbi[0] as AbiFunction).inputs.length);
            expect(processedAction.abiParams).toEqual((simpleAbi[0] as AbiFunction).inputs);
            // Check if it's a distinct array instance
            expect(processedAction.abiParams).not.toBe((simpleAbi[0] as AbiFunction).inputs);
        });
    });
});