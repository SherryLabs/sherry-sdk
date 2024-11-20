/**
 * ChainId is a string that represents the chain id of the network
 * @typedef ChainId
 * @type {string}
 * @example "fuji" | "avalanche"
 * @description ChainId is a string that represents the chain id of the network
 * where the function will be executed.
 * @note ChainId is a string representing the chain id of the network of the function to be executed that has been defined in the metadata.
 * By design the source blockchain is Avalanche and at the moment only functions can be executed on the Avalanche blockchain.
 * But the flexibility of the mini-apps and as the corresponding integration is done, cross-chains transactions can be executed according to the specified ChainId.
 */
export type ChainId = "fuji" | "avalanche";
