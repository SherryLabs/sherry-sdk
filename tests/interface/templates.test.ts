import { describe, expect, it } from '@jest/globals';
import {
    PARAM_TEMPLATES,
    createSelectOptions,
    createSelectParam,
    createRadioParam,
    createParameter,
} from '../../src/templates/templates';

describe('Template parameters', () => {
    it('includes all expected template types', () => {
        // Check a subset of important templates
        expect(PARAM_TEMPLATES.ADDRESS).toBeDefined();
        expect(PARAM_TEMPLATES.TEXT).toBeDefined();
        expect(PARAM_TEMPLATES.EMAIL).toBeDefined();
        expect(PARAM_TEMPLATES.TOKEN_SELECT).toBeDefined();
        expect(PARAM_TEMPLATES.YES_NO).toBeDefined();
        expect(PARAM_TEMPLATES.BOOLEAN_RADIO).toBeDefined();
    });

    it('ADDRESS template has correct properties', () => {
        const address = PARAM_TEMPLATES.ADDRESS;
        expect(address.type).toBe('address');
        expect(address.pattern).toBe('^0x[a-fA-F0-9]{40}$');
        expect(address.required).toBe(true);
    });

    it('EMAIL template has correct properties', () => {
        const email = PARAM_TEMPLATES.EMAIL;
        expect(email.type).toBe('email');
        expect(email.pattern).toBeDefined();
        expect(email.required).toBe(true);
    });

    it('YES_NO radio template has correct options', () => {
        const yesNo = PARAM_TEMPLATES.YES_NO;
        expect(yesNo.type).toBe('radio');
        expect(yesNo.options).toHaveLength(2);
        expect(yesNo.options[0].value).toBe(true);
        expect(yesNo.options[1].value).toBe(false);
    });
});

describe('Template helper functions', () => {
    it('creates select options correctly', () => {
        const options = createSelectOptions([
            { label: 'Option 1', value: 1, description: 'First option' },
            { label: 'Option 2', value: 2 },
        ]);

        expect(options).toHaveLength(2);
        expect(options[0].label).toBe('Option 1');
        expect(options[0].value).toBe(1);
        expect(options[0].description).toBe('First option');
        expect(options[1].description).toBeUndefined();
    });

    it('creates select parameters correctly', () => {
        const selectParam = createSelectParam(
            'testSelect',
            'Test Selection',
            [
                { label: 'Option 1', value: 1 },
                { label: 'Option 2', value: 2 },
            ],
            true,
            'Select an option',
        );

        expect(selectParam.name).toBe('testSelect');
        expect(selectParam.label).toBe('Test Selection');
        expect(selectParam.type).toBe('select');
        expect(selectParam.required).toBe(true);
        expect(selectParam.description).toBe('Select an option');
        expect(selectParam.options).toHaveLength(2);
    });

    it('creates radio parameters correctly', () => {
        const radioParam = createRadioParam(
            'testRadio',
            'Test Radio',
            [
                { label: 'Yes', value: true },
                { label: 'No', value: false },
            ],
            false,
            'Choose one option',
        );

        expect(radioParam.name).toBe('testRadio');
        expect(radioParam.label).toBe('Test Radio');
        expect(radioParam.type).toBe('radio');
        expect(radioParam.required).toBe(false);
        expect(radioParam.description).toBe('Choose one option');
        expect(radioParam.options).toHaveLength(2);
    });

    it('creates parameters with customizations', () => {
        const customized = createParameter(PARAM_TEMPLATES.TEXT, {
            name: 'customText',
            label: 'Custom Label',
            required: false,
            minLength: 5,
            maxLength: 20,
        });

        expect(customized.name).toBe('customText');
        expect(customized.label).toBe('Custom Label');
        expect(customized.type).toBe('text');
        expect(customized.required).toBe(false);
        expect(customized.minLength).toBe(5);
        expect(customized.maxLength).toBe(20);
    });
});
