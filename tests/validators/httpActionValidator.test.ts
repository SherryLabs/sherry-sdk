import { describe, expect, it } from '@jest/globals';
import { HttpAction } from '../../src/interface/actions/httpAction';
import { HttpActionValidator } from '../../src/validators/httpActionValidator';
import { InvalidMetadataError } from '../../src/errors/customErrors';

describe('HttpActionValidator', () => {
    const validHttpAction: HttpAction = {
        type: 'http',
        label: 'Subscribe to Newsletter',
        miniAppId: '12345678-1234-5678-9012-123456789abc',
        params: [
            {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                required: true,
            },
            {
                name: 'name',
                label: 'Full Name',
                type: 'text',
                required: false,
            },
        ],
    };

    it('should validate a correct HTTP action', () => {
        const validatedAction = HttpActionValidator.validateHttpAction(validHttpAction);
        expect(validatedAction).toBeTruthy();
        expect(validatedAction.params).toBeDefined();
        expect(validatedAction.params!.length).toBe(2);
    });

    it('should fail with invalid miniAppId', () => {
        const invalidAction: HttpAction = {
            ...validHttpAction,
            miniAppId: 'not-a-valid-uuid',
        };

        expect(() => {
            HttpActionValidator.validateHttpAction(invalidAction);
        }).toThrow(InvalidMetadataError);
    });

    it('should validate select parameters', () => {
        const actionWithSelect: HttpAction = {
            type: 'http',
            label: 'Choose Plan',
            miniAppId: '87654321-4321-8765-4321-876543210def',
            params: [
                {
                    name: 'plan',
                    label: 'Subscription Plan',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Basic', value: 'basic' },
                        { label: 'Pro', value: 'pro' },
                    ],
                },
            ],
        };

        const validatedAction = HttpActionValidator.validateHttpAction(actionWithSelect);
        expect(validatedAction.params).toBeDefined();
        expect(validatedAction.params).toHaveLength(1);
        expect(validatedAction.params![0].type).toBe('select');
    });

    it('should fail with empty select options', () => {
        const invalidSelect: HttpAction = {
            type: 'http',
            label: 'Choose Plan',
            miniAppId: '87654321-4321-8765-4321-876543210def',
            params: [
                {
                    name: 'plan',
                    label: 'Subscription Plan',
                    type: 'select',
                    required: true,
                    options: [],
                },
            ],
        };

        expect(() => {
            HttpActionValidator.validateHttpAction(invalidSelect);
        }).toThrow(InvalidMetadataError);
    });

    it('should validate form with text and email inputs', () => {
        const formAction: HttpAction = {
            type: 'http',
            label: 'Contact Form',
            miniAppId: 'abcdef12-3456-7890-abcd-ef1234567890',
            params: [
                {
                    name: 'name',
                    label: 'Full Name',
                    type: 'text',
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                },
            ],
        };

        const validatedAction = HttpActionValidator.validateHttpAction(formAction);
        expect(validatedAction).toBeTruthy();
        expect(validatedAction.params).toBeDefined();
        expect(validatedAction.params).toHaveLength(2);
        expect(validatedAction.params![0].type).toBe('text');
        expect(validatedAction.params![1].type).toBe('email');
    });

    it('should validate radio inputs', () => {
        const actionWithRadio: HttpAction = {
            type: 'http',
            label: 'Choose Payment',
            miniAppId: 'fedcba09-8765-4321-abcd-ba9876543210',
            params: [
                {
                    name: 'paymentType',
                    label: 'Payment Type',
                    type: 'radio',
                    required: true,
                    options: [
                        { label: 'Credit Card', value: 'card' },
                        { label: 'PayPal', value: 'paypal' },
                    ],
                },
            ],
        };

        const validatedAction = HttpActionValidator.validateHttpAction(actionWithRadio);
        expect(validatedAction).toBeTruthy();
        expect(validatedAction.params).toBeDefined();
        expect(validatedAction.params![0].type).toBe('radio');
    });

    it('should identify valid HTTP actions', () => {
        expect(HttpActionValidator.isHttpAction(validHttpAction)).toBe(true);
    });

    it('should reject blockchain actions as HTTP actions', () => {
        const blockchainAction = {
            label: 'Call Contract',
            address: '0x1234',
            abi: [],
            functionName: 'test',
            chains: { source: 43114 },
        };
        expect(HttpActionValidator.isHttpAction(blockchainAction)).toBe(false);
    });
});
