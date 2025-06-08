import { describe, expect, it } from '@jest/globals';
import { 
    FileParameter, 
    ImageParameter, 
    Parameter,
    FileInputType,
    BaseInputType 
} from '../../src/interface/inputs';

describe('Input Interfaces', () => {
    describe('FileParameter', () => {
        it('should create valid file parameter', () => {
            const fileParam: FileParameter = {
                name: 'document',
                label: 'Upload Document',
                type: 'file',
                required: true,
                accept: '.pdf,.doc,.docx',
                maxSize: 5 * 1024 * 1024,
                multiple: false,
            };

            expect(fileParam.type).toBe('file');
            expect(fileParam.name).toBe('document');
            expect(fileParam.label).toBe('Upload Document');
            expect(fileParam.accept).toBe('.pdf,.doc,.docx');
            expect(fileParam.maxSize).toBe(5 * 1024 * 1024);
            expect(fileParam.multiple).toBe(false);
        });

        it('should allow optional properties', () => {
            const fileParam: FileParameter = {
                name: 'file',
                label: 'File',
                type: 'file',
            };

            expect(fileParam.accept).toBeUndefined();
            expect(fileParam.maxSize).toBeUndefined();
            expect(fileParam.multiple).toBeUndefined();
        });
    });

    describe('ImageParameter', () => {
        it('should create valid image parameter', () => {
            const imageParam: ImageParameter = {
                name: 'avatar',
                label: 'Profile Avatar',
                type: 'image',
                required: true,
                accept: 'image/jpeg,image/png',
                maxSize: 2 * 1024 * 1024,
                multiple: false,
                maxWidth: 512,
                maxHeight: 512,
                aspectRatio: '1:1',
            };

            expect(imageParam.type).toBe('image');
            expect(imageParam.name).toBe('avatar');
            expect(imageParam.maxWidth).toBe(512);
            expect(imageParam.maxHeight).toBe(512);
            expect(imageParam.aspectRatio).toBe('1:1');
        });

        it('should allow multiple images', () => {
            const imageParam: ImageParameter = {
                name: 'gallery',
                label: 'Photo Gallery',
                type: 'image',
                multiple: true,
                maxSize: 5 * 1024 * 1024,
            };

            expect(imageParam.multiple).toBe(true);
        });

        it('should support various aspect ratios', () => {
            const wideImage: ImageParameter = {
                name: 'banner',
                label: 'Banner Image',
                type: 'image',
                aspectRatio: '16:9',
            };

            const squareImage: ImageParameter = {
                name: 'thumbnail',
                label: 'Thumbnail',
                type: 'image',
                aspectRatio: '1:1',
            };

            expect(wideImage.aspectRatio).toBe('16:9');
            expect(squareImage.aspectRatio).toBe('1:1');
        });
    });

    describe('Parameter Union Type', () => {
        it('should accept file parameter in union', () => {
            const fileParam: Parameter = {
                name: 'document',
                label: 'Document',
                type: 'file',
                accept: '.pdf',
            } as FileParameter;

            expect(fileParam.type).toBe('file');
        });

        it('should accept image parameter in union', () => {
            const imageParam: Parameter = {
                name: 'photo',
                label: 'Photo',
                type: 'image',
                maxWidth: 1024,
            } as ImageParameter;

            expect(imageParam.type).toBe('image');
        });
    });

    describe('Type Definitions', () => {
        it('should include file types in FileInputType', () => {
            const fileType: FileInputType = 'file';
            const imageType: FileInputType = 'image';

            expect(fileType).toBe('file');
            expect(imageType).toBe('image');
        });

        it('should include file types in BaseInputType', () => {
            const fileType: BaseInputType = 'file';
            const imageType: BaseInputType = 'image';

            expect(fileType).toBe('file');
            expect(imageType).toBe('image');
        });
    });
});
