export interface BlockchainParameter {
    label: string;
    type: "string" | "uint256" | "boolean" | "address";
    value?: string | bigint | boolean;
}
