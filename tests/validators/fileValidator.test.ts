import { describe, expect, it, beforeEach } from '@jest/globals';
import { validateFileParameter, validateImageDimensions } from '../../src/validators/fileValidator';
import { FileParameter, ImageParameter } from '../../src/interface/inputs';

// Mock File class for testing
class MockFile {
    name: string;
    size: number;
    type: string;

    constructor(name: string, size: number, type: string) {
        this.name = name;
        this.size = size;
        this.type = type;
    }
}

// Mock HTMLImageElement for testing
class MockHTMLImageElement {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}

describe('FileValidator', () => {
    describe('validateFileParameter', () => {
        let fileParam: FileParameter;
        let imageParam: ImageParameter;

        beforeEach(() => {
            fileParam = {
                name: 'document',
                label: 'Document Upload',
                type: 'file',
                required: true,
                maxSize: 5 * 1024 * 1024, // 5MB
                accept: '.pdf,.doc,.docx',
                multiple: false,
            };

            imageParam = {
                name: 'profilePic',
                label: 'Profile Picture',
                type: 'image',
                required: true,
                maxSize: 2 * 1024 * 1024, // 2MB
                accept: 'image/*',
                multiple: false,
                maxWidth: 1024,
                maxHeight: 768,
                aspectRatio: '4:3',
            };
        });

        it('should validate valid file within size limit', () => {
            const file = new MockFile('document.pdf', 1024 * 1024, 'application/pdf') as unknown as File;
            const result = validateFileParameter(file, fileParam);
            expect(result).toBeNull();
        });

        it('should reject file exceeding size limit', () => {
            const file = new MockFile('large-document.pdf', 10 * 1024 * 1024, 'application/pdf') as unknown as File;
            const result = validateFileParameter(file, fileParam);
            expect(result).toContain('File size must be less than');
            expect(result).toContain('MB');
        });

        it('should validate file with accepted extension', () => {
            const file = new MockFile('document.docx', 1024 * 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') as unknown as File;
            const result = validateFileParameter(file, fileParam);
            expect(result).toBeNull();
        });

        it('should reject file with unaccepted extension', () => {
            const file = new MockFile('image.jpg', 1024 * 1024, 'image/jpeg') as unknown as File;
            const result = validateFileParameter(file, fileParam);
            expect(result).toContain('File type not supported');
            expect(result).toContain('.pdf,.doc,.docx');
        });

        it('should validate file with wildcard mime type', () => {
            const file = new MockFile('image.jpg', 1024 * 1024, 'image/jpeg') as unknown as File;
            const result = validateFileParameter(file, imageParam);
            expect(result).toBeNull();
        });

        it('should validate file with exact mime type match', () => {
            fileParam.accept = 'application/pdf,image/jpeg';
            const file = new MockFile('image.jpg', 1024 * 1024, 'image/jpeg') as unknown as File;
            const result = validateFileParameter(file, fileParam);
            expect(result).toBeNull();
        });

        it('should handle file without extension', () => {
            // Use MIME types in accept parameter for better validation
            fileParam.accept = 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            const file = new MockFile('document', 1024 * 1024, 'application/pdf') as unknown as File;
            const result = validateFileParameter(file, fileParam);
            expect(result).toBeNull(); // Should pass based on mime type
        });

        it('should handle parameter without accept restriction', () => {
            delete fileParam.accept;
            const file = new MockFile('any-file.xyz', 1024 * 1024, 'application/unknown') as unknown as File;
            const result = validateFileParameter(file, fileParam);
            expect(result).toBeNull();
        });

        it('should handle parameter without size restriction', () => {
            delete fileParam.maxSize;
            const file = new MockFile('huge-file.pdf', 100 * 1024 * 1024, 'application/pdf') as unknown as File;
            const result = validateFileParameter(file, fileParam);
            expect(result).toBeNull();
        });

        it('should validate case insensitive file extensions', () => {
            const file = new MockFile('DOCUMENT.PDF', 1024 * 1024, 'application/pdf') as unknown as File;
            const result = validateFileParameter(file, fileParam);
            expect(result).toBeNull();
        });
    });

    describe('validateImageDimensions', () => {
        let imageParam: ImageParameter;

        beforeEach(() => {
            imageParam = {
                name: 'profilePic',
                label: 'Profile Picture',
                type: 'image',
                required: true,
                maxWidth: 1024,
                maxHeight: 768,
                aspectRatio: '4:3',
            };
        });

        it('should validate image within dimension limits', () => {
            const image = new MockHTMLImageElement(800, 600) as unknown as HTMLImageElement;
            const result = validateImageDimensions(image, imageParam);
            expect(result).toBeNull();
        });

        it('should reject image exceeding width limit', () => {
            const image = new MockHTMLImageElement(1200, 600) as unknown as HTMLImageElement;
            const result = validateImageDimensions(image, imageParam);
            expect(result).toContain('Image width must be less than 1024px');
        });

        it('should reject image exceeding height limit', () => {
            const image = new MockHTMLImageElement(800, 900) as unknown as HTMLImageElement;
            const result = validateImageDimensions(image, imageParam);
            expect(result).toContain('Image height must be less than 768px');
        });

        it('should validate correct aspect ratio', () => {
            const image = new MockHTMLImageElement(800, 600) as unknown as HTMLImageElement; // 4:3 ratio
            const result = validateImageDimensions(image, imageParam);
            expect(result).toBeNull();
        });

        it('should reject incorrect aspect ratio', () => {
            const image = new MockHTMLImageElement(800, 400) as unknown as HTMLImageElement; // 2:1 ratio
            const result = validateImageDimensions(image, imageParam);
            expect(result).toContain('Image aspect ratio should be 4:3');
        });

        it('should handle aspect ratio with tolerance', () => {
            imageParam.aspectRatio = '16:9';
            imageParam.maxWidth = 2000; // Increase max width to allow the test image
            imageParam.maxHeight = 1200; // Increase max height to allow the test image
            const image = new MockHTMLImageElement(1600, 905) as unknown as HTMLImageElement; // Slightly off 16:9
            const result = validateImageDimensions(image, imageParam);
            expect(result).toBeNull(); // Should pass within tolerance
        });

        it('should handle square aspect ratio', () => {
            imageParam.aspectRatio = '1:1';
            const image = new MockHTMLImageElement(500, 500) as unknown as HTMLImageElement;
            const result = validateImageDimensions(image, imageParam);
            expect(result).toBeNull();
        });

        it('should handle image without width restriction', () => {
            delete imageParam.maxWidth;
            delete imageParam.aspectRatio; // Remove aspect ratio restriction for this test
            const image = new MockHTMLImageElement(2000, 600) as unknown as HTMLImageElement;
            const result = validateImageDimensions(image, imageParam);
            expect(result).toBeNull();
        });

        it('should handle image without height restriction', () => {
            delete imageParam.maxHeight;
            delete imageParam.aspectRatio; // Remove aspect ratio restriction for this test
            const image = new MockHTMLImageElement(800, 1200) as unknown as HTMLImageElement;
            const result = validateImageDimensions(image, imageParam);
            expect(result).toBeNull();
        });

        it('should handle image without aspect ratio restriction', () => {
            delete imageParam.aspectRatio;
            const image = new MockHTMLImageElement(800, 400) as unknown as HTMLImageElement;
            const result = validateImageDimensions(image, imageParam);
            expect(result).toBeNull();
        });

        it('should handle unusual aspect ratios', () => {
            imageParam.aspectRatio = '21:9'; // Ultra-wide
            imageParam.maxWidth = 2500; // Increase max width to allow the test image
            imageParam.maxHeight = 1200; // Increase max height to allow the test image
            const image = new MockHTMLImageElement(2100, 900) as unknown as HTMLImageElement;
            const result = validateImageDimensions(image, imageParam);
            expect(result).toBeNull();
        });
    });
});
