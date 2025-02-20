export type Chain = "fuji" | "avalanche" | "alfajores" | "celo";



export interface ChainContext {
  source: Chain;
  destination?: Chain;  // undefined para single-chain actions
}