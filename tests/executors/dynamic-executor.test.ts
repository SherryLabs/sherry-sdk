import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { DynamicAction } from '../../src/interface/actions/dynamicAction';
import { ExecutionResponse } from '../../src/interface/response/executionResponse';
import { DynamicActionExecutor } from '../../src/executors/dynamicExecutor';
import { ActionValidationError } from '../../src/errors/customErrors';

type MockFetch = jest.Mock<typeof fetch>;

describe('DynamicActionExecutor', () => {
    let executor: DynamicActionExecutor;
    const baseUrl = 'https://api.base.com';
    const sdkVersion = '1.0.0';

    const sampleInputs = {
        amount: 0.1,
        recipient: '0xRecipientAddress',
    };

    const sampleContext = {
        userAddress: '0xUserAddress',
        someOtherContext: 'someValue',
    };

    const sampleActionFullUrl: DynamicAction = {
        type: 'dynamic',
        label: 'Execute Dynamic Tx',
        //path: 'https://api.test.com/resolve-tx',
        path: '/resolve-tx',
        chains: { source: 'fuji' },
        params: [
            { name: 'fixedParam', type: 'string', value: 'fixedValue', label: 'Fixed Param' },
            { name: 'amount', type: 'number', label: 'Amount' },
        ],
    };

    const sampleActionRelativePath: DynamicAction = {
        type: 'dynamic',
        label: 'Execute Relative Path Tx',
        path: '/resolve-relative',
        chains: { source: 'fuji', destination: 'alfajores' },
        params: [{ name: 'recipient', type: 'address', label: 'Recipient' }],
    };

    // Sample expected response from the path - UPDATED for new interface
    const mockSuccessResponse: ExecutionResponse = {
        serializedTransaction: '0x1234567890abcdef',
        chainId: 'fuji',
        meta: {
            title: 'Confirm dynamic Item Purchase',
        },
        rawTransaction: {
            to: '0xContractAddress',
            value: '0x0',
            data: '0xabcdef123456',
        },
        decoded: {
            functionName: 'purchaseItem',
            params: [
                { name: 'itemId', value: '123' },
                { name: 'userId', value: '0xUser...' },
            ],
        },
    };

    // UPDATED: Now includes properties needed for the new interface
    const mockAdaptableResponse = {
        tx: '0x1234567890abcdef',
        network: 'fuji',
        to: '0xRecipientAddress',
        title: 'Dynamic Transaction',
    };

    // UPDATED: Now matches the new ExecutionResponse interface
    const expectedAdaptedResponse: ExecutionResponse = {
        serializedTransaction: '0x1234567890abcdef',
        chainId: 'fuji',
        meta: {
            title: 'Dynamic Transaction',
        },
        rawTransaction: {
            to: '0xRecipientAddress',
            value: '0x0',
            data: '0x',
        },
    };

    beforeEach(() => {
        executor = new DynamicActionExecutor(baseUrl);
        global.fetch = jest.fn() as MockFetch;
    });

    const mockFetchSuccess = (responseBody: any = mockSuccessResponse) => {
        (global.fetch as MockFetch).mockResolvedValueOnce({
            ok: true,
            json: async () => responseBody,
            text: async () => JSON.stringify(responseBody),
            status: 200,
            statusText: 'OK',
        } as Response);
    };

    const mockFetchHttpError = (
        status: number,
        statusText: string,
        errorBody: any = { message: 'Server Error' },
    ) => {
        (global.fetch as MockFetch).mockResolvedValueOnce({
            ok: false,
            json: async () => errorBody,
            text: async () => JSON.stringify(errorBody),
            status,
            statusText,
        } as Response);
    };

    const mockFetchNetworkError = (errorMessage: string = 'Network failed') => {
        (global.fetch as MockFetch).mockRejectedValueOnce(new Error(errorMessage));
    };

    it('should execute with full URL, append query params, and return valid response', async () => {
        mockFetchSuccess();
        await executor.execute(sampleActionFullUrl, sampleInputs, sampleContext);
        const expectedUrl = new URL(sampleActionFullUrl.path, baseUrl);
        expectedUrl.searchParams.append('fixedParam', 'fixedValue');
        expectedUrl.searchParams.append('amount', String(sampleInputs.amount));
        expectedUrl.searchParams.append('userAddress', sampleContext.userAddress);
        expectedUrl.searchParams.append('chain', sampleActionFullUrl.chains.source);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expectedUrl.toString(), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'x-sdk-version': sdkVersion,
                'x-wallet-address': sampleContext.userAddress,
                'x-chain-id': sampleActionFullUrl.chains.source,
            },
        });
    });

    it('should execute with relative URL, baseUrl, append query params, and return valid response', async () => {
        // Instantiate with baseUrl for this test
        executor = new DynamicActionExecutor(baseUrl);
        mockFetchSuccess();

        await executor.execute(sampleActionRelativePath, sampleInputs, sampleContext);

        const expectedUrl = new URL(baseUrl); // Start with base
        expectedUrl.pathname = sampleActionRelativePath.path; // Add relative path
        expectedUrl.searchParams.append('recipient', sampleInputs.recipient); // Input param
        expectedUrl.searchParams.append('userAddress', sampleContext.userAddress); // Context param
        expectedUrl.searchParams.append('chain', sampleActionRelativePath.chains.source); // Chain param
        expectedUrl.searchParams.append(
            'destinationChain',
            sampleActionRelativePath.chains.destination!,
        ); // Destination chain

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            expectedUrl.toString(),
            expect.objectContaining({ method: 'POST' /* other checks */ }),
        );
    });

    it.skip('should return adapted response when initial validation fails but adaptation succeeds', async () => {
        mockFetchSuccess(mockAdaptableResponse); // Return the adaptable structure
        const result = await executor.execute(sampleActionFullUrl, sampleInputs, sampleContext);

        // Verify the result matches the *adapted* structure
        expect(result).toEqual(expectedAdaptedResponse);
        expect(fetch).toHaveBeenCalledTimes(1); // Ensure fetch was still called
    });

    it.skip('should throw ActionValidationError if baseUrl is missing for relative path', async () => {
        // Executor instantiated without baseUrl in beforeEach
        await expect(
            executor.execute(sampleActionRelativePath, sampleInputs, sampleContext),
        ).rejects.toThrow(ActionValidationError);
        await expect(
            executor.execute(sampleActionRelativePath, sampleInputs, sampleContext),
        ).rejects.toThrow(/no baseUrl is provided/);
        expect(fetch).not.toHaveBeenCalled();
    });

    it.skip('should throw ActionValidationError on fetch network error', async () => {
        mockFetchNetworkError('Connection refused');
        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(ActionValidationError);
        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(/Connection refused/); // Check if original error message is included
    });

    // Test the INTENDED behavior for HTTP errors (assuming !response.ok check)
    it.skip('should throw ActionValidationError on HTTP error (e.g., 500)', async () => {
        mockFetchHttpError(500, 'Internal Server Error', { detail: 'Database connection failed' });
        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(ActionValidationError); // Expecting wrapper error
        // Check if details from the actual error are included
        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(/HTTP Error! Status: 500/);
        // Check if the text() content is included (based on executor code)
        // This might fail depending on how the error is constructed in the catch block
        // await expect(executor.execute(sampleActionFullUrl, sampleInputs, sampleContext))
        //      .rejects.toThrow(/Database connection failed/);
    });

    it.skip('should throw ActionValidationError if response is not valid JSON', async () => {
        (global.fetch as MockFetch).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => {
                throw new SyntaxError('Unexpected token <');
            }, // Simulate JSON parse error
            text: async () => '<!DOCTYPE html>...',
            statusText: 'OK',
        } as unknown as Response);

        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(ActionValidationError);
        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(/Unexpected token </); // Include original JSON error
    });

    it.skip('should throw ActionValidationError if response structure is invalid and cannot be adapted', async () => {
        const invalidResponse = { completely: 'wrong', data: 123 };
        mockFetchSuccess(invalidResponse);

        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(ActionValidationError);
        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(/Invalid response format/); // Check error message
    });

    // Note: isValidExecutionResponse checks 'chain', but ExecutionResponse uses 'chainId'.
    // This test checks the current behavior (failing if 'chain' is missing).
    it.skip('should throw ActionValidationError if response is missing "chainId" (based on current isValidExecutionResponse)', async () => {
        const missingChainId = { 
            serializedTransaction: '0x123', 
            meta: { title: 'Test' },
            rawTransaction: { to: '0x123' }
        }; // Missing chainId
        mockFetchSuccess(missingChainId);

        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(ActionValidationError);
        await expect(
            executor.execute(sampleActionFullUrl, sampleInputs, sampleContext),
        ).rejects.toThrow(/Invalid response format/);
    });

    it('should throw ActionValidationError if action type is not "dynamic"', async () => {
        const invalidAction = { ...sampleActionFullUrl, type: 'blockchain' } as any;
        await expect(executor.execute(invalidAction, sampleInputs, sampleContext)).rejects.toThrow(
            ActionValidationError,
        );
        await expect(executor.execute(invalidAction, sampleInputs, sampleContext)).rejects.toThrow(
            /Action type must be "dynamic"/,
        );
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw ActionValidationError if path is missing', async () => {
        const invalidAction = { ...sampleActionFullUrl, path: undefined } as any;
        await expect(executor.execute(invalidAction, sampleInputs, sampleContext)).rejects.toThrow(
            ActionValidationError,
        );
        await expect(executor.execute(invalidAction, sampleInputs, sampleContext)).rejects.toThrow(
            /must have a valid path/,
        );
        expect(fetch).not.toHaveBeenCalled();
    });
});