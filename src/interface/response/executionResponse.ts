/**
 * Cross-chain specific information for dynamic actions.
 * Contains details about the cross-chain operation parameters.
 */
export interface CrossChainInfo {
    /**
     * The destination chain where the final action will be executed.
     * @example "celo", "polygon", "ethereum"
     */
    destinationChainId: string;

    /**
     * Estimated gas limit for the operation on the destination chain.
     * This helps users understand the full cost of the cross-chain operation.
     * @example 300000
     */
    destinationGasLimit?: number;

    /**
     * The recipient address on the destination chain (if applicable).
     * @example "0x742d35Cc6634C0532925a3b8D4ccd306f6F4B26C"
     */
    destinationRecipient?: string;

    /**
     * Estimated bridge/cross-chain fees in the source chain's native currency.
     * @example "0.01" // 0.01 AVAX for bridging
     */
    estimatedBridgeFee?: string;

    /**
     * Human-readable description of what will happen on the destination chain.
     * @example "Mint NFT on Celo network", "Stake tokens on Polygon"
     */
    destinationOperation?: string;
}

export interface ExecutionResponse {
    /**
     * The serialized transaction ready for blockchain execution.
     * This should be generated using wagmi's serialize function or equivalent
     * and represents a complete, ready-to-sign transaction.
     * 
     * @example "0x02f87083aa36a71482520894742d35cc6634c0532925a3b8d4..."
     */
    serializedTransaction: string;

    /**
     * The blockchain network identifier where the transaction should be executed.
     * Use the human-readable chain name, not the numeric ID.
     * 
     * Supported values include:
     * - "fuji" for Avalanche Fuji Testnet
     * - "avalanche" for Avalanche Mainnet
     * - "ethereum" for Ethereum Mainnet
     * - "polygon" for Polygon Mainnet
     * - "sepolia" for Ethereum Sepolia Testnet
     * 
     * @example "fuji"
     */
    chainId: string;

    /**
     * Optional contract ABI (Application Binary Interface) for transaction verification.
     * Including the ABI allows wallets and tools to verify the transaction
     * and provide better user experience by showing decoded function calls.
     * 
     * @optional
     */
    abi?: any[];

    /**
     * Optional decoded parameters that provide human-readable information
     * about the transaction. This enhances user experience by showing
     * what the transaction will do in clear terms.
     * 
     * @optional
     */
    params?: {
        /**
         * The name of the smart contract function being called.
         * This should match the function name in the ABI.
         * 
         * @example "transfer", "approve", "stakeTokens"
         */
        functionName: string;

        /**
         * The decoded arguments being passed to the function.
         * Keys should match the parameter names in the function signature,
         * and values should be in human-readable format when possible.
         */
        args: Record<string, any>;
    };

    /**
     * Cross-chain operation details (only present for cross-chain dynamic actions).
     * This provides transparency about what will happen on the destination chain.
     * 
     * @optional
     */
    crossChain?: CrossChainInfo;
}