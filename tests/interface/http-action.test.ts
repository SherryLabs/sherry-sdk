import { describe, expect, it } from '@jest/globals';
import { HttpAction } from '../../src/interface/actions/httpAction';
import { HttpActionValidator } from '../../src/validators/httpActionValidator';
import { InvalidMetadataError } from '../../src/errors/customErrors';

describe('HttpAction Validation', () => {
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
});

describe('HTTP Action in Metadata', () => {
    /*
    it('should process HTTP action within metadata', () => {
        const metadata: Metadata = {
            url: 'https://myapp.com',
            icon: 'https://myapp.com/icon.png',
            title: 'Newsletter Subscription',
            description: 'Subscribe to our newsletter',
            actions: [
                {
                    label: 'Subscribe',
                    path: 'https://api.example.com/subscribe',
                    params: [
                        {
                            name: 'email',
                            label: 'Email Address',
                            type: 'email',
                            required: true,
                        },
                    ],
                },
            ],
        };

        const validatedMetadata = createMetadata(metadata);
        expect(validatedMetadata.actions[0]).toBeTruthy();
    });
    */

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
        expect(validatedAction.params).toBeDefined();
        expect(validatedAction.params).toHaveLength(1);
        expect(validatedAction.params![0].type).toBe('radio');
    });
});
