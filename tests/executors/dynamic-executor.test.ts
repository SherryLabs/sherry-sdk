import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import { DynamicAction } from '../../src/interface/actions/dynamicAction'
import { ExecutionResponse } from '../../src/interface/response/executionResponse'
import { DynamicActionExecutor } from '../../src/executors/dynamicExecutor'

type MockFetch = jest.Mock<typeof fetch>;

describe('DynamicActionExecutor', () => {
    let executor: DynamicActionExecutor;

    const sampleDynamicAction: DynamicAction = {
        type: 'dynamic',
        label: 'Execute Dynamic Tx',
        description: 'Resolves and prepares a transaction dynamically',
        endpoint: 'https://api.test.com/resolve-tx',
        chains: { source: 'fuji' }, // May or may not be relevant for the endpoint itself
        params: [
            { name: 'userAddress', type: 'address', value: '0xUser...', label: 'User Address' },
            { name: 'itemId', type: 'number', value: 123, label: 'Item ID' },
        ],
    };

    // Sample expected response from the endpoint
    const mockResolvedTxResponse: ExecutionResponse = { 
        serializedTransaction: '0x1234567890abcdef',
        chainId: 'fuji',
        meta: { 
            title: 'Confirm dynamic Item Purchase',
            description: 'Purchase item 123 for user 0xUser...',
            details: [
                { label: 'Item ID', value: '123' },
                { label: 'User Address', value: '0xUser...' },
            ],
            contractAddress: '0xContractAddress',
            functionName: 'purchaseItem',
        }
    }

    beforeEach(() => {
        executor = new DynamicActionExecutor();
        global.fetch = jest.fn() as MockFetch;
    });

    it('should call the endpoint with POST and correct parameters', async () => {
        (global.fetch as MockFetch).mockResolvedValueOnce({ 
            ok: true,
            json: async () => mockResolvedTxResponse,
            status: 200,
            statusText: 'OK',
        } as Response);

        await executor.resolve(sampleDynamicAction);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch). toHaveBeenCalledWith(sampleDynamicAction.endpoint,
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(sampleDynamicAction.params)
            })
        )
     });


 })