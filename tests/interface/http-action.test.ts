import { describe, expect, it } from '@jest/globals';
import { HttpAction } from '../../src/interface/httpAction';
import { HttpActionValidator } from '../../src/validators/httpActionValidator';
import { Metadata } from '../../src/interface/metadata';
import { createMetadata } from '../../src/utils/createMetadata';
import { InvalidMetadataError } from '../../src/errors/customErrors';

describe('HttpAction Validation', () => {
    const validHttpAction: HttpAction = {
        label: 'Subscribe to Newsletter',
        endpoint: 'https://api.example.com/subscribe',
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
        expect(validatedAction.params.length).toBe(2);
    });

    it('should fail with invalid endpoint', () => {
        const invalidAction: HttpAction = {
            ...validHttpAction,
            endpoint: 'not-a-valid-url',
        };

        expect(() => {
            HttpActionValidator.validateHttpAction(invalidAction);
        }).toThrow(InvalidMetadataError);
    });

    it('should validate select parameters', () => {
        const actionWithSelect: HttpAction = {
            label: 'Choose Plan',
            endpoint: 'https://api.example.com/subscribe',
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
        expect(validatedAction.params[0].type).toBe('select');
    });

    it('should fail with empty select options', () => {
        const invalidSelect: HttpAction = {
            label: 'Choose Plan',
            endpoint: 'https://api.example.com/subscribe',
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
                    endpoint: 'https://api.example.com/subscribe',
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
            label: 'Contact Form',
            endpoint: 'https://api.example.com/contact',
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
        expect(validatedAction.params).toHaveLength(2);
        expect(validatedAction.params[0].type).toBe('text');
        expect(validatedAction.params[1].type).toBe('email');
    });

    it('should validate radio inputs', () => {
        const actionWithRadio: HttpAction = {
            label: 'Choose Payment',
            endpoint: 'https://api.example.com/payment',
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
        expect(validatedAction.params[0].type).toBe('radio');
    });
});
