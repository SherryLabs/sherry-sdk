import { describe, expect, it } from '@jest/globals';
import { ParameterValidator } from '../../src/validators/parameterValidator';
import { 
    FileParameter, 
    ImageParameter,
    TextBasedParameter,
    NumberBasedParameter,
    SelectParameter,
    RadioParameter 
} from '../../src/interface/inputs';
import { SherryValidationError } from '../../src/errors/customErrors';

describe('ParameterValidator', () => {
    // ...existing code...

    describe('validateParameter with file types', () => {
        it('should validate file parameter', () => {
            const fileParam: FileParameter = {
                name: 'document',
                label: 'Document Upload',
                type: 'file',
                required: true,
                maxSize: 5 * 1024 * 1024,
                accept: '.pdf,.doc,.docx',
                multiple: false,
            };

            expect(() => ParameterValidator.validateParameter(fileParam)).not.toThrow();
        });

        it('should validate image parameter', () => {
            const imageParam: ImageParameter = {
                name: 'profilePic',
                label: 'Profile Picture',
                type: 'image',
                required: true,
                maxSize: 2 * 1024 * 1024,
                accept: 'image/*',
                multiple: true,
                maxWidth: 1024,
                maxHeight: 768,
                aspectRatio: '4:3',
            };

            expect(() => ParameterValidator.validateParameter(imageParam)).not.toThrow();
        });

        it('should reject file parameter with invalid maxSize', () => {
            const fileParam: FileParameter = {
                name: 'document',
                label: 'Document Upload',
                type: 'file',
                required: true,
                maxSize: -1, // Invalid negative size
                accept: '.pdf',
            };

            expect(() => ParameterValidator.validateParameter(fileParam)).toThrow(SherryValidationError);
        });

        it('should reject image parameter with invalid dimensions', () => {
            const imageParam: ImageParameter = {
                name: 'profilePic',
                label: 'Profile Picture',
                type: 'image',
                required: true,
                maxWidth: -100, // Invalid negative width
                maxHeight: 768,
            };

            expect(() => ParameterValidator.validateParameter(imageParam)).toThrow(SherryValidationError);
        });

        it('should reject file parameter without name', () => {
            const fileParam = {
                label: 'Document Upload',
                type: 'file',
                required: true,
            } as FileParameter;

            expect(() => ParameterValidator.validateParameter(fileParam)).toThrow(SherryValidationError);
            expect(() => ParameterValidator.validateParameter(fileParam)).toThrow('name');
        });

        it('should reject image parameter without label', () => {
            const imageParam = {
                name: 'image',
                type: 'image',
                required: true,
            } as ImageParameter;

            expect(() => ParameterValidator.validateParameter(imageParam)).toThrow(SherryValidationError);
            expect(() => ParameterValidator.validateParameter(imageParam)).toThrow('label');
        });

        it('should validate file parameter with all optional fields', () => {
            const fileParam: FileParameter = {
                name: 'file',
                label: 'Optional File',
                type: 'file',
                required: false,
                description: 'This is optional',
                fixed: false,
                value: null,
                accept: 'image/*,application/pdf',
                maxSize: 10 * 1024 * 1024,
                multiple: true,
            };

            expect(() => ParameterValidator.validateParameter(fileParam)).not.toThrow();
        });

        it('should validate image parameter with minimal configuration', () => {
            const imageParam: ImageParameter = {
                name: 'image',
                label: 'Simple Image',
                type: 'image',
            };

            expect(() => ParameterValidator.validateParameter(imageParam)).not.toThrow();
        });
    });

    // ...existing code...
});