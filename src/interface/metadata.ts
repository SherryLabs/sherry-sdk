import { BlockchainAction, BlockchainActionMetadata } from "./blockchainAction";
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

/**
 * Interface representing the validated metadata for a mini app.
 * 
 * This interface extends the `Metadata` interface but ensures that the `actions`
 * property is always an array of `BlockchainAction` objects. This is used to
 * represent the final state of the metadata after it has been processed and
 * validated.
 * 
 * @extends {Omit<Metadata, 'actions'>}
 * 
 * @property {BlockchainAction[]} actions - An array of `BlockchainAction` objects,
 * each defining a specific action that can be performed by the mini app.
 * 
 * @example
 * ```typescript
 * const validatedMetadata: ValidatedMetadata = {
 *   type: "action",
 *   icon: "icon.png",
 *   title: "My Mini App",
 *   description: "This is a mini app example",
 *   actions: [
 *     {
 *       label: "Test Action",
 *       contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
 *       contractABI: exampleAbi,
 *       functionName: "safeTransferFrom",
 *       chainId: "ethereum",
 *       transactionParameters: [
 *         { name: "from", type: "address" },
 *         { name: "to", type: "address" },
 *         { name: "tokenId", type: "uint256" }
 *       ],
 *       blockchainActionType: "nonpayable"
 *     }
 *   ]
 * };
 * ```
 */
export interface ValidatedMetadata extends Omit<Metadata, 'actions'> {
  actions: BlockchainAction[];
}