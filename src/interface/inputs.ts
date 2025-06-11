import { AbiType } from 'abitype';

export const DEFAULT_MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

// Option for selects and radios
export interface SelectOption {
    label: string;
    value: string | number | boolean;
    description?: string;
}

export interface BaseParameter {
    type: string;
    name: string;
    label: string;
    required?: boolean;
    description?: string;
    fixed?: boolean; // If the value is fixed, not editable
    value?: any; // Default value, if not sent, an empty input will be rendered
}

export interface TextBasedParameter extends BaseParameter {
    type:
        | 'text'
        | 'email'
        | 'url'
        | 'textarea'
        | 'string'
        | 'bytes'
        | Extract<AbiType, 'string' | 'bytes' | `bytes${number}`>;
    minLength?: number;
    maxLength?: number;
    pattern?: string; // For regex validations
}

export interface NumberBasedParameter extends BaseParameter {
    type: 'number' | 'datetime' | Extract<AbiType, `uint${string}` | `int${string}`>;
    min?: number; // For numeric and datetime inputs
    max?: number; // For numeric and datetime inputs
    pattern?: string; // For regex validations
}

export interface AddressParameter extends BaseParameter {
    type: 'address' | Extract<AbiType, 'address'>;
    pattern?: string; // For regex validations
}

export interface BooleanParameter extends BaseParameter {
    type: 'boolean' | Extract<AbiType, 'bool'>;
}

export interface SelectParameter extends BaseParameter {
    type: 'select';
    options: SelectOption[];
}

export interface RadioParameter extends BaseParameter {
    type: 'radio';
    options: SelectOption[];
}

export interface FileParameter extends BaseParameter {
    type: 'file';
    accept?: string; // Accepted file types (prefer MIME types: "application/pdf,image/jpeg" or wildcards: "image/*")
    maxSize?: number; // Maximum size in bytes
    multiple?: boolean; // Allow multiple files
}

// New interface for images (file specialization)
export interface ImageParameter extends BaseParameter {
    type: 'image';
    accept?: string; // Accepted image types (e.g.: "image/jpeg,image/png" or "image/*")
    maxSize?: number; // Maximum size in bytes
    multiple?: boolean; // Allow multiple images
    maxWidth?: number; // Maximum allowed width in pixels
    maxHeight?: number; // Maximum allowed height in pixels
    aspectRatio?: string; // Desired aspect ratio (e.g.: "16:9", "1:1")
}

export type StandardParameter =
    | TextBasedParameter
    | NumberBasedParameter
    | AddressParameter
    | BooleanParameter;

export type SelectionInputType = 'select' | 'radio';

export type FileInputType = 'file' | 'image';

export type UIInputType =
    | 'text' // String specialization with validation
    | 'number' // Number specialization, uint or int also work for number
    | 'email' // String specialization for email
    | 'url' // String specialization for url
    | 'datetime' // String specialization for date
    | 'textarea' // String specialization for long text
    | 'boolean';

export type BaseInputType = AbiType | UIInputType | SelectionInputType | FileInputType;

export type Parameter =
    | StandardParameter
    | SelectParameter
    | RadioParameter
    | FileParameter
    | ImageParameter;
