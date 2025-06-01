import { BlockchainActionMetadata, BlockchainAction } from './blockchainAction';
import { TransferAction } from './transferAction';
import { HttpAction } from './httpAction';
import { ActionFlow } from './flowAction';
import { DynamicAction } from './dynamicAction';
import { ChainContext } from '../chains';

/**
 * Union type for any type of action that can be included in metadata.
 *
 * This represents raw, unprocessed actions that come from external sources
 * and need to be validated before execution. Each action type serves different purposes:
 *
 * - **BlockchainActionMetadata**: Raw blockchain interactions that need processing
 * - **TransferAction**: Token transfer operations (already validated)
 * - **HttpAction**: HTTP requests and form submissions
 * - **ActionFlow**: Complex workflows with multiple nested actions
 * - **DynamicAction**: Actions that are generated or modified at runtime
 *
 * @type {Action}
 * @version 1.0.0
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // BlockchainActionMetadata (raw)
 * const rawBlockchainAction: Action = {
 *   type: 'blockchain',
 *   label: 'Approve Token',
 *   address: '0x...',
 *   abi: [...],
 *   functionName: 'approve',
 *   chains: { source: 'ethereum' }
 * };
 *
 * // TransferAction
 * const transferAction: Action = {
 *   type: 'transfer',
 *   label: 'Send USDC',
 *   token: 'USDC',
 *   amount: '100',
 *   recipient: '0x...',
 *   chains: { source: 'polygon' }
 * };
 *
 * // HttpAction
 * const httpAction: Action = {
 *   type: 'http',
 *   label: 'Submit Form',
 *   method: 'POST',
 *   url: '/api/submit',
 *   chains: { source: 'ethereum' }
 * };
 * ```
 */
export type Action =
    | BlockchainActionMetadata // Acción blockchain sin procesar
    | TransferAction // Acción de transferencia
    | HttpAction // Acción HTTP
    | ActionFlow // Flujo de acciones anidadas
    | DynamicAction; // Acción dinámica

/**
 * Union type for any type of validated action ready for execution.
 *
 * This represents actions that have been processed, validated, and enriched
 * with additional metadata required for safe execution. Key differences from raw actions:
 *
 * - **BlockchainAction**: Processed from BlockchainActionMetadata with gas estimates, security checks
 * - **TransferAction**: Same as in Action (already validated)
 * - **HttpAction**: Same as in Action but may include validation metadata
 * - **ActionFlow**: Validated flow with dependency resolution
 * - **DynamicAction**: Same as in Action but with runtime validation
 *
 * @type {ValidatedAction}
 * @version 1.0.0
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // BlockchainAction (processed from metadata)
 * const processedBlockchainAction: ValidatedAction = {
 *   type: 'blockchain',
 *   label: 'Approve Token',
 *   address: '0x...',
 *   abi: [...],
 *   functionName: 'approve',
 *   chains: { source: 'ethereum' },
 *   // Additional validated properties
 *   blockchainActionType: 'approve',
 *   estimatedGas: '45000',
 *   securityLevel: 'medium'
 * };
 *
 * // TransferAction (unchanged)
 * const validatedTransfer: ValidatedAction = {
 *   type: 'transfer',
 *   label: 'Send USDC',
 *   token: 'USDC',
 *   amount: '100',
 *   recipient: '0x...',
 *   chains: { source: 'polygon' }
 * };
 * ```
 */
export type ValidatedAction =
    | BlockchainAction // Acción blockchain procesada
    | TransferAction // Acción de transferencia
    | HttpAction // Acción HTTP validada
    | ActionFlow // Flujo de acciones validado
    | DynamicAction;

/**
 * Base interface with common properties for all actions.
 *
 * This interface defines the fundamental structure that all action types must implement.
 * It provides a consistent foundation for action identification, labeling, and chain context.
 *
 * @interface BaseAction
 * @version 1.0.0
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Custom action extending BaseAction
 * interface CustomAction extends BaseAction {
 *   type: 'custom';
 *   customProperty: string;
 * }
 *
 * const customAction: CustomAction = {
 *   type: 'custom',
 *   label: 'Custom Operation',
 *   chains: {
 *     source: 'ethereum',
 *     destination: 'polygon'
 *   },
 *   customProperty: 'value'
 * };
 * ```
 */
export interface BaseAction {
    /**
     * Descriptive label to display in the user interface.
     *
     * This should be a human-readable string that clearly describes what the action does.
     * It will be displayed to users in buttons, menus, or action lists.
     * Keep it concise but descriptive.
     *
     * @type {string}
     * @required
     * @maxLength 50
     *
     * @example
     * ```typescript
     * label: "Swap Tokens"
     * label: "Mint NFT"
     * label: "Vote Yes"
     * label: "Stake ETH"
     * ```
     */
    label: string;

    /**
     * Configuration of source and destination chains for the action.
     *
     * Defines the blockchain context where this action will be executed.
     * Can specify source chain only, or both source and destination for cross-chain operations.
     *
     * @type {ChainContext}
     * @required
     *
     * @example
     * ```typescript
     * // Single chain operation
     * chains: {
     *   source: 'avalanche'
     * }
     *
     * // Cross-chain operation
     * chains: {
     *   source: 'avalanche',
     *   destination: 'celo'
     * }
     * ```
     */
    chains: ChainContext;

    /**
     * Discriminator property to identify the action type.
     *
     * This property is used for TypeScript type discrimination and runtime type checking.
     * Each interface that extends BaseAction must define its own type literal.
     * Common values include: 'blockchain', 'transfer', 'http', 'flow', 'dynamic'.
     *
     * @type {string}
     * @required
     * @discriminator
     *
     * @example
     * ```typescript
     * // In BlockchainAction
     * type: 'blockchain'
     *
     * // In TransferAction
     * type: 'transfer'
     *
     * // In HttpAction
     * type: 'http'
     * ```
     */
    type: string;
}
