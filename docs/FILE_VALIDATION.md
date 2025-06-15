# File Validation Documentation

This document outlines how to define and validate file and image parameters within the Sherry SDK.

## Table of Contents

1. [Overview](#overview)
2. [File Parameters](#file-parameters)
3. [Image Parameters](#image-parameters)
4. [Validation Functions](#validation-functions)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Error Handling](#error-handling)
8. [Type Safety](#type-safety)

## Overview

The Sherry SDK provides robust file validation capabilities through two main parameter types:

- **FileParameter**: For general file uploads (documents, PDFs, etc.)
- **ImageParameter**: For image uploads with additional dimension and aspect ratio validation

Both types support:

- File size validation
- MIME type and extension validation
- Multiple file uploads
- Comprehensive error messages

## File Parameters

File parameters allow users to upload generic files.

### Interface Definition

```typescript
interface FileParameter extends BaseParameter {
  type: 'file';
  accept?: string;    // Accepted file types (MIME types or extensions)
  maxSize?: number;   // Maximum file size in bytes
  multiple?: boolean; // Allow multiple file selection
}
```

### Properties

| Property      | Type      | Required | Description                                    |
| ------------- | --------- | -------- | ---------------------------------------------- |
| `type`        | `'file'`  | ✅       | Parameter type identifier.                     |
| `name`        | `string`  | ✅       | Unique parameter name.                         |
| `label`       | `string`  | ✅       | User-friendly label.                           |
| `accept`      | `string`  | ❌       | Accepted file types (e.g., "application/pdf", ".txt"). |
| `maxSize`     | `number`  | ❌       | Maximum file size in bytes.                    |
| `multiple`    | `boolean` | ❌       | Allow multiple file selection (default: false). |
| `required`    | `boolean` | ❌       | Whether the field is required.                 |
| `description` | `string`  | ❌       | Additional help text.                          |

### Accept Format Examples

```typescript
// MIME types (recommended)
accept: 'application/pdf';
accept: 'application/pdf,application/msword';
accept: 'image/*';
accept: 'text/*';

// File extensions (legacy support)
accept: '.pdf,.doc,.docx';
accept: '.jpg,.jpeg,.png';

// Mixed format
accept: 'image/jpeg,image/png,.gif';
```

## Image Parameters

Image parameters are a specialization of file parameters, tailored for image uploads with additional validation options.

### Interface Definition

```typescript
interface ImageParameter extends BaseParameter {
  type: 'image';
  accept?: string;      // Accepted image types (e.g., "image/jpeg,image/png")
  maxSize?: number;     // Maximum size in bytes
  multiple?: boolean;   // Allow multiple images
  maxWidth?: number;    // Maximum width in pixels
  maxHeight?: number;   // Maximum height in pixels
  aspectRatio?: string; // Desired aspect ratio (e.g., "16:9", "1:1")
}
```

### Additional Properties

| Property      | Type     | Required | Description                                 |
| ------------- | -------- | -------- | ------------------------------------------- |
| `maxWidth`    | `number` | ❌       | Maximum image width in pixels.              |
| `maxHeight`   | `number` | ❌       | Maximum image height in pixels.             |
| `aspectRatio` | `string` | ❌       | Required aspect ratio (e.g., "16:9", "1:1").|

### Aspect Ratio Format

```typescript
aspectRatio: '16:9'; // Widescreen
aspectRatio: '4:3'; // Standard
aspectRatio: '1:1'; // Square
aspectRatio: '21:9'; // Ultra-wide
```

## Validation Functions

### validateFileParameter

Validates a file against parameter constraints.

```typescript
function validateFileParameter(file: File, param: FileParameter | ImageParameter): string | null;
```

**Parameters:**

- `file`: The File object to validate
- `param`: The parameter definition with constraints

**Returns:**

- `null`: File is valid
- `string`: Error message describing the validation failure

**Validation Checks:**

1. File size against `maxSize`
2. File type against `accept` (MIME type and extension)
3. Wildcard MIME type matching (e.g., `image/*`)

### validateImageDimensions

Validates image dimensions and aspect ratio.

```typescript
function validateImageDimensions(image: HTMLImageElement, param: ImageParameter): string | null;
```

**Parameters:**

- `image`: Loaded HTMLImageElement with width/height
- `param`: Image parameter with dimension constraints

**Returns:**

- `null`: Image dimensions are valid
- `string`: Error message describing the validation failure

**Validation Checks:**

1. Width against `maxWidth`
2. Height against `maxHeight`
3. Aspect ratio with 10% tolerance

## Usage Examples

### Basic File Upload

```typescript
import { FileParameter, validateFileParameter } from '@sherry/sdk';

const documentParam: FileParameter = {
  name: 'contract',
  label: 'Contract Document',
  type: 'file',
  accept: 'application/pdf',
  maxSize: 5 * 1024 * 1024, // 5MB
  required: true,
};

// Validate a file
const file = document.querySelector('input[type="file"]').files[0];
const error = validateFileParameter(file, documentParam);

if (error) {
  console.error('Validation failed:', error);
} else {
  console.log('File is valid!');
}
```

### Image Upload with Dimensions

```typescript
import { ImageParameter, validateFileParameter, validateImageDimensions } from '@sherry/sdk';

const avatarParam: ImageParameter = {
  name: 'avatar',
  label: 'Profile Picture',
  type: 'image',
  accept: 'image/jpeg,image/png',
  maxSize: 2 * 1024 * 1024, // 2MB
  maxWidth: 512,
  maxHeight: 512,
  aspectRatio: '1:1',
  required: true,
};

// File validation
const file = document.querySelector('input[type="file"]').files[0];
const fileError = validateFileParameter(file, avatarParam);

if (fileError) {
  console.error('File validation failed:', fileError);
  return;
}

// Image dimension validation
const img = new Image();
img.onload = () => {
  const dimensionError = validateImageDimensions(img, avatarParam);

  if (dimensionError) {
    console.error('Dimension validation failed:', dimensionError);
  } else {
    console.log('Image is valid!');
  }
};
img.src = URL.createObjectURL(file);
```

### Multiple File Upload

```typescript
const galleryParam: ImageParameter = {
  name: 'gallery',
  label: 'Photo Gallery',
  type: 'image',
  accept: 'image/*',
  maxSize: 10 * 1024 * 1024, // 10MB per file
  multiple: true,
  maxWidth: 1920,
  maxHeight: 1080,
};

// Validate multiple files
const files = Array.from(document.querySelector('input[type="file"]').files);
const errors = [];

files.forEach((file, index) => {
  const error = validateFileParameter(file, galleryParam);
  if (error) {
    errors.push(`File ${index + 1}: ${error}`);
  }
});

if (errors.length > 0) {
  console.error('Validation errors:', errors);
}
```

### Parameter Validation

```typescript
import { ParameterValidator } from '@sherry/sdk';

const param: FileParameter = {
  name: 'document',
  label: 'Upload Document',
  type: 'file',
  maxSize: 5 * 1024 * 1024,
  accept: 'application/pdf',
};

try {
  ParameterValidator.validateParameter(param);
  console.log('Parameter definition is valid');
} catch (error) {
  console.error('Invalid parameter:', error.message);
}
```

## Best Practices

### 1. Use MIME Types Over Extensions

```typescript
// ✅ Recommended: MIME types
accept: 'image/jpeg,image/png,image/webp';
accept: 'application/pdf';
accept: 'text/csv';

// ❌ Avoid: File extensions only
accept: '.jpg,.png,.gif';
```

**Why?** MIME types are more secure and reliable than file extensions, which can be easily changed.

### 2. Set Reasonable File Size Limits

```typescript
// ✅ Good: Appropriate limits
maxSize: 5 * 1024 * 1024; // 5MB for documents
maxSize: 2 * 1024 * 1024; // 2MB for profile images
maxSize: 10 * 1024 * 1024; // 10MB for high-quality images

// ❌ Bad: No limits or unrealistic limits
maxSize: undefined; // No protection
maxSize: 100 * 1024 * 1024; // 100MB - too large for web
```

### 3. Use Appropriate Image Constraints

```typescript
// ✅ Good: Reasonable constraints
{
    maxWidth: 1920,     // HD width
    maxHeight: 1080,    // HD height
    aspectRatio: "16:9" // Standard video ratio
}

// ✅ Good: Profile picture
{
    maxWidth: 512,
    maxHeight: 512,
    aspectRatio: "1:1"  // Square
}
```

### 4. Provide Clear Error Messages

```typescript
// The validation functions provide clear, actionable error messages:
// "File size must be less than 5.00MB"
// "File type not supported. Accepted types: image/jpeg,image/png"
// "Image width must be less than 1920px"
// "Image aspect ratio should be 16:9"
```

### 5. Handle Both File and Dimension Validation

```typescript
async function validateImage(file: File, param: ImageParameter): Promise<string | null> {
  // First validate the file itself
  const fileError = validateFileParameter(file, param);
  if (fileError) return fileError;

  // Then validate dimensions if it's an image
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const dimensionError = validateImageDimensions(img, param);
      resolve(dimensionError);
    };
    img.onerror = () => resolve('Invalid image file');
    img.src = URL.createObjectURL(file);
  });
}
```

## Error Handling

### Common Error Messages

| Error Type   | Example Message                                              |
| ------------ | ------------------------------------------------------------ |
| File Size    | `"File size must be less than 5.00MB"`                       |
| File Type    | `"File type not supported. Accepted types: application/pdf"` |
| Image Width  | `"Image width must be less than 1920px"`                     |
| Image Height | `"Image height must be less than 1080px"`                    |
| Aspect Ratio | `"Image aspect ratio should be 16:9"`                        |

### Error Handling Pattern

```typescript
function handleFileUpload(file: File, param: FileParameter) {
  const error = validateFileParameter(file, param);

  if (error) {
    // Show user-friendly error
    showError(error);
    return false;
  }

  // Proceed with upload
  uploadFile(file);
  return true;
}
```

## Type Safety

### Type Guards

The SDK provides type guards for parameter validation:

```typescript
import { isFileParameter, isImageParameter, ParameterValidator } from '@sherry/sdk';

function validateParam(param: Parameter) {
  if (isFileParameter(param)) {
    // TypeScript knows this is FileParameter
    console.log('File parameter:', param.maxSize);
  } else if (isImageParameter(param)) {
    // TypeScript knows this is ImageParameter
    console.log('Image parameter:', param.maxWidth);
  }
}
```

### Parameter Validation

```typescript
// Validate parameter definition at runtime
try {
  ParameterValidator.validateParameter(fileParam);
} catch (error) {
  console.error('Invalid parameter definition:', error.message);
}
```

## Integration with Forms

### React Example

```typescript
import React, { useState } from 'react';
import { validateFileParameter, FileParameter } from '@sherry/sdk';

const FileUploadComponent: React.FC = () => {
    const [error, setError] = useState<string | null>(null);

    const fileParam: FileParameter = {
        name: 'document',
        label: 'Upload Document',
        type: 'file',
        accept: 'application/pdf',
        maxSize: 5 * 1024 * 1024
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validationError = validateFileParameter(file, fileParam);
        setError(validationError);

        if (!validationError) {
            // File is valid, proceed with upload
            uploadFile(file);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept={fileParam.accept}
                onChange={handleFileChange}
            />
            {error && <div className="error">{error}</div>}
        </div>
    );
};
```

This comprehensive documentation covers all aspects of file validation in the Sherry SDK, providing developers with the knowledge they need to implement robust file upload functionality.
