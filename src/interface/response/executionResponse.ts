

export interface ExecutionResponse {
    // Elementos esenciales
    serializedTransaction: string; // Usando wagmi serialize
    chainId: string;
    
    // Para verificación (opcionales)
    abi?: any[];      // Permite verificación completa
    params?: {        // Parámetros decodificados para mejor UX
      functionName: string;
      args: Record<string, any>;
    };
  }