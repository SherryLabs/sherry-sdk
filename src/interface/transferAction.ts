import { ChainContext } from "./chains";

export interface TransferAction {
    label: string;
    to?: `0x${string}`;
    amount?: number;
    chains: ChainContext; // [sourceChain, destinationChain | null]
}