import { BlockchainAction, BlockchainActionMetadata, TransferAction } from './blockchainAction';
import { HttpAction } from './httpAction';

/**
 * Interface representing the metadata for a mini app.
 *
 * This interface is used to define the structure of the metadata for a mini app,
 * including the type of action, icon, title, description, label, and the actions
 * that can be performed.
 *
 * @template T - The type of action. Defaults to "action".
 * @template abi - The ABI of the contract. Defaults to `Abi`.
 */
export interface Metadata {
    /**
     * The URL of the mini app.
     * This is the URL of the project.
     */
    url: string;

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
     * This is an array of `BlockchainAction` or `TransferAction` objects, each defining a specific action.
     */
    actions: (BlockchainActionMetadata | TransferAction | HttpAction)[];
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
 *       address: "0x1234567890abcdef1234567890abcdef12345678",
 *       abi: exampleAbi,
 *       functionName: "safeTransferFrom",
 *       chain: "ethereum",
 *       params: [
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
    actions: (BlockchainAction | TransferAction | HttpAction)[];
}
