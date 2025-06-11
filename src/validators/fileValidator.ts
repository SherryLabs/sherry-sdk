import { FileParameter, ImageParameter } from '../interface/inputs';

export function validateFileParameter(
    file: File,
    param: FileParameter | ImageParameter,
): string | null {
    // Validate file size
    if (param.maxSize && file.size > param.maxSize) {
        return `File size must be less than ${(param.maxSize / 1024 / 1024).toFixed(2)}MB`;
    }

    // Validate file type
    if (param.accept) {
        const acceptedTypes = param.accept.split(',').map(type => type.trim());
        const fileNameParts = file.name.split('.');
        const fileExtension =
            fileNameParts.length > 1 ? '.' + fileNameParts.pop()?.toLowerCase() : '';
        const mimeType = file.type;

        const isValidType = acceptedTypes.some(
            accepted =>
                accepted === mimeType ||
                (fileExtension && accepted === fileExtension) ||
                (accepted.includes('*') && mimeType.startsWith(accepted.replace(/\*/g, ''))),
        );

        if (!isValidType) {
            return `File type not supported. Accepted types: ${param.accept}`;
        }
    }

    return null; // No errors
}

// Function to validate image dimensions (requires loading the image)
export function validateImageDimensions(
    image: HTMLImageElement,
    param: ImageParameter,
): string | null {
    if (param.maxWidth && image.width > param.maxWidth) {
        return `Image width must be less than ${param.maxWidth}px`;
    }

    if (param.maxHeight && image.height > param.maxHeight) {
        return `Image height must be less than ${param.maxHeight}px`;
    }

    if (param.aspectRatio) {
        const [widthRatio, heightRatio] = param.aspectRatio.split(':').map(Number);
        const expectedRatio = widthRatio / heightRatio;
        const actualRatio = image.width / image.height;
        const tolerance = 0.1; // 10% tolerance

        if (Math.abs(actualRatio - expectedRatio) > tolerance) {
            return `Image aspect ratio should be ${param.aspectRatio}`;
        }
    }

    return null;
}
