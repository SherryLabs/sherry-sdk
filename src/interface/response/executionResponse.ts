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
