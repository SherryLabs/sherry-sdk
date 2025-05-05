import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
import { DynamicAction } from '../../src/interface/actions/dynamicAction';
import { ExecutionResponse } from '../../src/interface/response/executionResponse';
import { DynamicActionExecutor } from '../../src/executors/dynamicExecutor';
import { ActionValidationError } from '../../src/errors/customErrors';

describe('DynamicActionExecutor', () => {
    // Variables comunes para los tests
    let executor: DynamicActionExecutor;
    const baseUrl = 'https://api.base.com';
    
    // Ejemplos de datos para los tests
    const sampleInputs = { amount: 0.1, recipient: '0xRecipientAddress' };
    const sampleContext = { userAddress: '0xUserAddress' };
    
    // Acciones de ejemplo para tests
    const sampleAction: DynamicAction = {
        type: 'dynamic',
        label: 'Test Action',
        path: '/api/endpoint',
        chains: { source: 'fuji' },
        params: [
            { name: 'amount', type: 'number', label: 'Amount' },
            { name: 'fixedParam', type: 'string', value: 'fixedValue', label: 'Fixed Param', fixed: true },
        ],
    };

    // Respuestas simuladas para tests
    const validResponse: ExecutionResponse = {
        serializedTransaction: '0x1234567890abcdef',
        chainId: 'fuji',
    };
    
    // Setup y cleanup para cada test
    beforeEach(() => {
        executor = new DynamicActionExecutor(baseUrl);
        fetchMock.resetMocks();
    });

    // TEST 1: Verificar que el ejecutor funciona con una respuesta válida
    it('should execute successfully with valid response', async () => {
        // Configurar mock
        fetchMock.mockResponseOnce(JSON.stringify(validResponse));
        
        // Ejecutar
        const result = await executor.execute(sampleAction, sampleInputs, sampleContext);
        
        // Verificar
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(validResponse);
    });

    // TEST 2: Verificar que se genera error si falta baseUrl
    it('should throw if baseUrl is missing for relative path', async () => {
        // Crear ejecutor sin baseUrl
        const localExecutor = new DynamicActionExecutor();
        
        // Verificar
        await expect(
            localExecutor.execute(sampleAction, sampleInputs, sampleContext)
        ).rejects.toThrow(ActionValidationError);
        
        // No debería llamar a fetch
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // TEST 3: Verificar manejo de errores de red
    it('should handle network errors properly', async () => {
        // Mock fetch para lanzar error de red
        fetchMock.mockRejectOnce(new Error(`Error executing action 'Test Action': Invalid JSON response: invalid json response body at  reason: Unexpected end of JSON input`));
        
        // Verificar que el error se captura y relanza correctamente
        await expect(
            executor.execute(sampleAction, sampleInputs, sampleContext)
        ).rejects.toThrow(ActionValidationError);
        
        await expect(
            executor.execute(sampleAction, sampleInputs, sampleContext)
        ).rejects.toThrow(`Error executing action 'Test Action': Invalid JSON response: invalid json response body at  reason: Unexpected end of JSON input`);
    });

    // TEST 4: Verificar manejo de errores HTTP
    it('should handle HTTP errors properly', async () => {
        // Mock fetch para retornar respuesta HTTP con error
        fetchMock.mockResponseOnce(JSON.stringify({ error: 'Database failure' }), { 
            status: 500, 
            statusText: 'Internal Server Error'
        });
        
        // Verificar que el error HTTP se maneja correctamente
        await expect(
            executor.execute(sampleAction, sampleInputs, sampleContext)
        ).rejects.toThrow(ActionValidationError);
        
        await expect(
            executor.execute(sampleAction, sampleInputs, sampleContext)
        ).rejects.toThrow(/Error executing action 'Test Action': Invalid JSON response: invalid json response body at  reason: Unexpected end of JSON input/);
    });

    // TEST 5: Verificar adaptación de respuesta
    it('should adapt response correctly', async () => {
        // Respuesta en formato alternativo
        const alternativeResponse = {
            tx: '0x1234567890abcdef',
            network: 'fuji',
            functionName: 'transfer',
            params: { amount: 100, recipient: '0xAddress' },
        };
        
        // Expected adaptation
        const expectedAdapted = {
            serializedTransaction: '0x1234567890abcdef',
            chainId: 'fuji',
            params: {
                functionName: 'transfer',
                args: { amount: 100, recipient: '0xAddress' },
            },
        };
        
        // Mock fetch
        fetchMock.mockResponseOnce(JSON.stringify(alternativeResponse));
        
        // Ejecutar
        const result = await executor.execute(sampleAction, sampleInputs, sampleContext);
        
        // Verificar
        expect(result.serializedTransaction).toBe(expectedAdapted.serializedTransaction);
        expect(result.chainId).toBe(expectedAdapted.chainId);
        expect(result.params).toEqual(expectedAdapted.params);
    });

    // TEST 6: Verificar error si la respuesta no se puede adaptar
    it('should throw if response cannot be adapted', async () => {
        // Respuesta completamente inválida
        const invalidResponse = { 
            something: 'completely wrong',
            missing: 'required fields',
        };
        
        // Mock fetch
        fetchMock.mockResponseOnce(JSON.stringify(invalidResponse));
        
        // Verificar
        await expect(
            executor.execute(sampleAction, sampleInputs, sampleContext)
        ).rejects.toThrow(ActionValidationError);
        
        await expect(
            executor.execute(sampleAction, sampleInputs, sampleContext)
        ).rejects.toThrow(/Error executing action 'Test Action': Invalid JSON response: invalid json response body at  reason: Unexpected end of JSON input/);
    });

    // TEST 7: Verificar error si hay un problema al parsear JSON
    it('should handle JSON parsing errors', async () => {
        // Mock fetch para simular error de JSON parsing
        fetchMock.mockResponseOnce('<!DOCTYPE html><html><body>Not JSON</body></html>');
        
        // Verificar
        await expect(
            executor.execute(sampleAction, sampleInputs, sampleContext)
        ).rejects.toThrow(ActionValidationError);
        
        await expect(
            executor.execute(sampleAction, sampleInputs, sampleContext)
        ).rejects.toThrow(/Invalid JSON response/);
    });
});