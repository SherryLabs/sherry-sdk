export type Chain = "fuji" | "avalanche" | "alfajores" | "celo" | "monad-testnet";

export interface ChainContext {
  source: Chain;
  destination?: Chain;  // undefined para single-chain actions
}