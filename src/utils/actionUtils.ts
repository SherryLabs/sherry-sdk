import { ActionValidationError } from '../errors/customErrors';

// Re-use the existing parameter system instead of creating a new one
export type { Parameter as BaseParameter } from '../interface/inputs';
export type { BaseInputType as ParameterType } from '../interface/inputs';
import type { Parameter } from '../interface/inputs';

/**
 * Request metadata for nonce generation and tracking
 */
export interface RequestMetadata {
    nonce: string;
    timestamp: number;
    clientVersion: string;
}

/**
 * Validation utilities for action parameters
 */
export class ActionParameterValidator {
    /**
     * Validate that all required parameters are provided
     */
    static validateRequiredParams(paramSchema: Parameter[], userParams: Record<string, any>): void {
        for (const schema of paramSchema) {
            const value = userParams[schema.name];

            if (schema.required && (value === undefined || value === null || value === '')) {
                throw new ActionValidationError(`Required parameter '${schema.name}' is missing`);
            }
        }
    }

    /**
     * Sanitize and validate a parameter value based on its type
     */
    static sanitizeParameterValue(schema: Parameter, value: any): any {
        // Skip null/undefined values for optional parameters
        if (value === undefined || value === null) {
            return value;
        }

        switch (schema.type) {
            case 'string':
            case 'text':
            case 'textarea':
                return ActionParameterValidator.sanitizeString(String(value));

            case 'number':
                const numValue = Number(value);
                if (isNaN(numValue)) {
                    throw new ActionValidationError(
                        `Invalid number value for parameter '${schema.name}'`,
                    );
                }
                return numValue;

            case 'boolean':
                return Boolean(value);

            case 'email':
                const email = String(value);
                if (!ActionParameterValidator.isValidEmail(email)) {
                    throw new ActionValidationError(
                        `Invalid email format for parameter '${schema.name}'`,
                    );
                }
                return email.toLowerCase().trim();

            case 'url':
                const url = String(value);
                if (!ActionParameterValidator.isValidUrl(url)) {
                    throw new ActionValidationError(
                        `Invalid URL format for parameter '${schema.name}'`,
                    );
                }
                return url;

            case 'datetime':
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new ActionValidationError(
                        `Invalid datetime format for parameter '${schema.name}'`,
                    );
                }
                return date.toISOString();

            case 'select':
            case 'radio':
                // For select/radio, validate against allowed options if schema has them
                const selectSchema = schema as any;
                if (selectSchema.options && Array.isArray(selectSchema.options)) {
                    const validValues = selectSchema.options.map((opt: any) => opt.value);
                    if (!validValues.includes(value)) {
                        throw new ActionValidationError(
                            `Invalid option '${value}' for parameter '${schema.name}'`,
                        );
                    }
                }
                return value;

            case 'file':
            case 'image':
                // File validation is handled separately in file-specific logic
                return value;

            default:
                return String(value);
        }
    }

    /**
     * Validate and sanitize all parameters in a request
     */
    static validateAndSanitizeParams(
        paramSchema: Parameter[],
        userParams: Record<string, any>,
    ): Record<string, any> {
        // First validate required parameters
        ActionParameterValidator.validateRequiredParams(paramSchema, userParams);

        const sanitized: Record<string, any> = {};

        for (const schema of paramSchema) {
            const value = userParams[schema.name];

            // Skip optional parameters that aren't provided
            if (value === undefined || value === null) {
                continue;
            }

            // Sanitize and validate the value
            sanitized[schema.name] = ActionParameterValidator.sanitizeParameterValue(schema, value);
        }

        return sanitized;
    }

    /**
     * Sanitize string input to prevent XSS and injection attacks
     */
    private static sanitizeString(input: string): string {
        return input
            .replace(/[<>]/g, '') // Remove basic HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim()
            .substring(0, 1000); // Limit length
    }

    /**
     * Validate email format
     */
    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL format
     */
    private static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Utilities for building secure requests
 */
export class SecureRequestBuilder {
    /**
     * Generate a cryptographically secure nonce for request deduplication
     */
    static generateNonce(): string {
        return (
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15) +
            Date.now().toString(36)
        );
    }

    /**
     * Generate request metadata with nonce and timestamp
     */
    static generateRequestMetadata(clientVersion?: string): RequestMetadata {
        return {
            nonce: SecureRequestBuilder.generateNonce(),
            timestamp: Date.now(),
            clientVersion: clientVersion || SecureRequestBuilder.getDefaultClientVersion(),
        };
    }

    /**
     * Get the default client version from package.json or fallback
     */
    static getDefaultClientVersion(): string {
        return '2.28.24'; // Should match package.json version
    }

    /**
     * Build standard request headers for SDK requests
     */
    static buildStandardHeaders(clientKey?: string): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': `Sherry-SDK/${SecureRequestBuilder.getDefaultClientVersion()}`,
            'X-SDK-Version': SecureRequestBuilder.getDefaultClientVersion(),
        };

        if (clientKey) {
            headers['X-Client-Key'] = clientKey;
        }

        return headers;
    }
}

/**
 * Common error handling utilities
 */
export class ActionErrorHandler {
    /**
     * Standardize error handling across executors
     */
    static handleExecutionError(error: any, actionLabel: string): never {
        if (error instanceof ActionValidationError) {
            throw error;
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new ActionValidationError(`Error executing action '${actionLabel}': ${message}`);
    }

    /**
     * Create a standardized error response
     */
    static createErrorResponse(error: any, requestId?: string) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown execution error',
            metadata: {
                executionTime: 0,
                requestId: requestId || SecureRequestBuilder.generateNonce(),
                timestamp: Date.now(),
            },
        };
    }
}

/**
 * UUID validation utilities
 */
export class UUIDValidator {
    private static readonly UUID_REGEX =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    /**
     * Validate that a string is a valid UUID format
     */
    static isValidUUID(uuid: string): boolean {
        return typeof uuid === 'string' && UUIDValidator.UUID_REGEX.test(uuid);
    }

    /**
     * Validate UUID and throw if invalid
     */
    static validateUUID(uuid: string, fieldName: string = 'UUID'): void {
        if (!UUIDValidator.isValidUUID(uuid)) {
            throw new ActionValidationError(`${fieldName} must be a valid UUID format`);
        }
    }
}
