/*
export interface ExecutionResponse {
    serializedTransaction: string;
    chainId: string;
    meta?: {
        title?: string;
        description?: string;
        details?: {
            label: string;
            value: string;
        }[];
        contractAddress?: string;
        functionName?: string;
    };
}
*/

import { Abi } from 'abitype';
export interface ExecutionResponse {
    // Lo básico indispensable
    serializedTransaction: string;
    chainId: string;

    // Meta simplificado para UI amigable
    meta: {
        title: string; // Obligatorio: descripción corta de la acción
    };

    // Parámetros clave para verificación
    // Información adicional (opcional pero recomendada)
    rawTransaction: {
        to: string;
        value?: string;
        data?: string;
    };

    // Para transparencia y verificación completa (opcional)
    abi?: any[]; // ABI opcional para referencia
    // Decodificación básica para transparencia
    decoded?: {
        functionName: string;
        params: { name: string; value: string }[];
    };
}
