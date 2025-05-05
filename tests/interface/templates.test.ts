import { describe, expect, it } from '@jest/globals';
import {
    PARAM_TEMPLATES,
    createSelectOptions,
    createSelectParam,
    createRadioParam,
    createParameter,
} from '../../src/templates/templates';
import { 
    TextBasedParameter,
    AddressParameter,
    SelectParameter,
    RadioParameter
} from '../../src/interface/inputs';

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
        const address = PARAM_TEMPLATES.ADDRESS as AddressParameter;
        expect(address.type).toBe('address');
        expect(address.pattern).toBe('^0x[a-fA-F0-9]{40}$');
        expect(address.required).toBe(true);
    });

    it('EMAIL template has correct properties', () => {
        const email = PARAM_TEMPLATES.EMAIL as TextBasedParameter;
        expect(email.type).toBe('email');
        expect(email.pattern).toBeDefined();
        expect(email.required).toBe(true);
    });

    it('YES_NO radio template has correct options', () => {
        const yesNo = PARAM_TEMPLATES.YES_NO as RadioParameter;
        expect(yesNo.type).toBe('radio');
        expect(yesNo.options).toHaveLength(2);
        expect(yesNo.options[0].value).toBe(true);
        expect(yesNo.options[1].value).toBe(false);
    });
});

describe('Template helper functions', () => {
    // Resto de tests con los tipos correctos
    
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