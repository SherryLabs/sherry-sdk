import { BlockchainActionMetadata } from "./BlockchainAction";
/**
 * Defines the type of action that can be performed.
 * - "action": Represents a blockchain action.
 * - "external-link": Represents an external link.
 */
export type ActionType = "action" | "external-link";
/**
 * Interface representing the metadata for a mini app.
 *
 * This interface is used to define the structure of the metadata for a mini app,
 * including the type of action, icon, title, description, label, and the actions
 * that can be performed.
 *
 * @template T - The type of action. Defaults to "action".
 * @template ContractABI - The ABI of the contract. Defaults to `Abi`.
 */
export interface Metadata {
    /**
     * The type of action.
     * Can be either "action" for blockchain actions or "external-link" for external links.
     */
    type: ActionType;
    /**
     * The icon representing the mini app.
     * This is typically a URL or a path to an icon image.
     */
    icon: string;
    /**
     * The title of the mini app.
     * This is typically used for display purposes.
     */
    title: string;
    /**
     * The description of the mini app.
     * This provides more details about what the mini app does.
     */
    description: string;
    /**
     * The actions that can be performed by the mini app.
     * This is an array of `BlockchainAction` objects, each defining a specific action.
     */
    actions: BlockchainActionMetadata[];
}
