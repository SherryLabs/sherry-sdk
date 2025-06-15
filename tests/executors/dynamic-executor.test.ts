import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
import { DynamicAction } from '../../src/interface/actions/dynamicAction';
import { ExecutionResponse } from '../../src/interface/response/executionResponse';
import {
    DynamicActionExecutor,
    BlockchainContext,
    createDynamicExecutor,
    createAnonymousExecutor,
} from '../../src/executors/dynamicExecutor';
import { ActionValidationError } from '../../src/errors/customErrors';

describe('DynamicActionExecutor', () => {
    // Common variables for tests
    let executor: DynamicActionExecutor;
    const clientKey = 'test-client-key';
    const baseUrl = 'https://miniapp.example.com';

    // Sample data for tests
    const sampleInputs = { amount: 0.1, recipient: '0xRecipientAddress' };
    const sampleContext: BlockchainContext & { baseUrl: string } = {
        userAddress: '0xUserAddress',
        sourceChain: 'fuji',
        destinationChain: 'ethereum',
        baseUrl: baseUrl,
    };

    // Sample actions for tests
    const sampleAction: DynamicAction = {
        type: 'dynamic',
        label: 'Test Action',
        path: '/api/transfer',
        chains: { source: 'fuji' },
        params: [
            { name: 'amount', type: 'number', label: 'Amount', required: true },
            { name: 'recipient', type: 'string', label: 'Recipient', required: true },
            {
                name: 'fixedParam',
                type: 'string',
                value: 'fixedValue',
                label: 'Fixed Param',
            },
        ],
    };

    // Mock responses for tests
    const validResponse: ExecutionResponse = {
        serializedTransaction: '0x1234567890abcdef',
        chainId: 'fuji',
    };

    const validMetadataResponse = {
        name: 'Test Mini App',
        version: '1.0.0',
        actions: [sampleAction],
    };

    // Setup and cleanup for each test
    beforeEach(() => {
        executor = new DynamicActionExecutor(clientKey);
        fetchMock.resetMocks();
    });

    describe('Constructor and Factory Functions', () => {
        it('should create executor with client key', () => {
            const executorWithKey = new DynamicActionExecutor('my-key');
            expect(executorWithKey).toBeInstanceOf(DynamicActionExecutor);
        });

        it('should create executor without client key', () => {
            const executorWithoutKey = new DynamicActionExecutor();
            expect(executorWithoutKey).toBeInstanceOf(DynamicActionExecutor);
        });

        it('should create executor using factory function', () => {
            const factoryExecutor = createDynamicExecutor('factory-key');
            expect(factoryExecutor).toBeInstanceOf(DynamicActionExecutor);
        });

        it('should create anonymous executor', () => {
            const anonymousExecutor = createAnonymousExecutor();
            expect(anonymousExecutor).toBeInstanceOf(DynamicActionExecutor);
        });
    });

    describe('getMetadata', () => {
        it('should get metadata successfully', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(validMetadataResponse));

            const result = await executor.getMetadata(baseUrl);

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(result).toEqual(validMetadataResponse);

            // Verify the request was made to proxy
            const call = fetchMock.mock.calls[0];
            const expectedProxyUrl = `https://proxy.sherry.social/proxy?url=${encodeURIComponent(baseUrl)}`;
            expect(call[0]).toBe(expectedProxyUrl);
        });

        it('should handle custom path in getMetadata', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(validMetadataResponse));

            await executor.getMetadata(baseUrl);

            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        it('should handle custom headers in getMetadata', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(validMetadataResponse));

            await executor.getMetadata(baseUrl, {
                customHeaders: { 'X-Custom': 'value' },
            });

            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('execute', () => {
        it('should execute successfully with valid response', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(validResponse));

            const result = await executor.execute(sampleAction, sampleInputs, sampleContext);

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(result).toEqual(validResponse);

            // Verify the request was made to proxy
            const call = fetchMock.mock.calls[0];
            expect(call[0]).toBe('https://proxy.sherry.social/proxy');
            expect(call[1]?.method).toBe('POST');
        });

        it('should throw error if userAddress is missing', async () => {
            const invalidContext = { ...sampleContext, userAddress: '' };

            await expect(
                executor.execute(sampleAction, sampleInputs, invalidContext),
            ).rejects.toThrow('User address is required');

            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('should throw error if sourceChain is missing', async () => {
            const invalidContext = { ...sampleContext, sourceChain: '' };

            await expect(
                executor.execute(sampleAction, sampleInputs, invalidContext),
            ).rejects.toThrow('Source chain is required');

            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('should throw error if baseUrl is missing', async () => {
            const invalidContext = { ...sampleContext, baseUrl: '' };

            await expect(
                executor.execute(sampleAction, sampleInputs, invalidContext),
            ).rejects.toThrow('Base URL is required');

            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('should throw error for required missing parameters', async () => {
            const incompleteInputs = { amount: 0.1 }; // missing required 'recipient'

            await expect(
                executor.execute(sampleAction, incompleteInputs, sampleContext),
            ).rejects.toThrow("Required parameter 'recipient' is missing");

            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('should handle network errors correctly', async () => {
            fetchMock.mockReject(new Error('Network error'));

            await expect(
                executor.execute(sampleAction, sampleInputs, sampleContext),
            ).rejects.toThrow("Error executing action 'Test Action': Network error");
        });

        it('should handle HTTP errors correctly', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ error: 'Database failure' }), {
                status: 500,
                statusText: 'Internal Server Error',
                headers: { 'Content-Type': 'application/json' },
            });

            await expect(
                executor.execute(sampleAction, sampleInputs, sampleContext),
            ).rejects.toThrow("Error executing action 'Test Action': HTTP 500:");
        });

        it('should handle timeout correctly', async () => {
            fetchMock.mockImplementation(
                () =>
                    new Promise((resolve, reject) => {
                        setTimeout(() => {
                            const abortError = new Error('The operation was aborted');
                            abortError.name = 'AbortError';
                            reject(abortError);
                        }, 1500);
                    }),
            );

            await expect(
                executor.execute(sampleAction, sampleInputs, sampleContext, { timeout: 30000 }),
            ).rejects.toThrow(
                "Error executing action 'Test Action': Request timeout after 30000ms",
            );
        });

        it('should throw error if response cannot be adapted', async () => {
            const invalidResponse = {
                something: 'completely wrong',
                missing: 'required fields',
            };

            fetchMock.mockResponseOnce(JSON.stringify(invalidResponse));

            await expect(
                executor.execute(sampleAction, sampleInputs, sampleContext),
            ).rejects.toThrow('Invalid response format from action endpoint');
        });

        it('should handle JSON parsing errors', async () => {
            fetchMock.mockResponseOnce('<!DOCTYPE html><html><body>Not JSON</body></html>');

            await expect(
                executor.execute(sampleAction, sampleInputs, sampleContext),
            ).rejects.toThrow(/Error executing action 'Test Action':/);
        });

        it('should handle empty response', async () => {
            fetchMock.mockResponseOnce('');

            await expect(
                executor.execute(sampleAction, sampleInputs, sampleContext),
            ).rejects.toThrow('Empty response from proxy');
        });

        it('should handle custom headers and client key from options', async () => {
            fetchMock.mockResponseOnce(JSON.stringify(validResponse));

            await executor.execute(sampleAction, sampleInputs, sampleContext, {
                clientKey: 'override-key',
                customHeaders: { 'X-Custom': 'value' },
                timeout: 5000,
            });

            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        it('should handle absolute URLs in action path', async () => {
            const actionWithAbsoluteUrl = {
                ...sampleAction,
                path: 'https://external-api.com/endpoint',
            };

            fetchMock.mockResponseOnce(JSON.stringify(validResponse));

            await executor.execute(actionWithAbsoluteUrl, sampleInputs, sampleContext);

            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('Action Validation', () => {
        it('should throw error for non-dynamic action type', async () => {
            const invalidAction = { ...sampleAction, type: 'static' as any };

            await expect(
                executor.execute(invalidAction, sampleInputs, sampleContext),
            ).rejects.toThrow('Action type must be "dynamic"');
        });

        it('should throw error for missing action path', async () => {
            const invalidAction = { ...sampleAction, path: '' };

            await expect(
                executor.execute(invalidAction, sampleInputs, sampleContext),
            ).rejects.toThrow('Dynamic action must have a path');
        });
    });
});
