import { Action, ValidatedAction } from './actions/action';

/**
 * Represents the metadata configuration for a mini app in the Sherry SDK.
 * This interface defines the structure for raw metadata that will be validated
 * and processed before being used by the application.
 * 
 * @interface Metadata
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * const metadata: Metadata = {
 *   url: 'https://example.com/miniapp',
 *   icon: 'https://example.com/icon.png',
 *   title: 'My Mini App',
 *   description: 'A sample mini app for demonstration',
 *   baseUrl: 'https://api.example.com',
 *   actions: [
 *     {
 *       type: 'blockchain',
 *       method: 'transfer',
 *       params: { to: '0x123...', amount: '100' }
 *     }
 *   ]
 * };
 * ```
 */
export interface Metadata {
    /**
     * The primary URL where the mini app is hosted or can be accessed.
     * This should be a valid HTTPS URL pointing to the mini app's main entry point.
     * 
     * @type {string}
     * @required
     * @format uri
     * @pattern ^https?://
     * 
     * @example
     * ```typescript
     * url: 'https://my-miniapp.vercel.app'
     * ```
     */
    url: string;

    /**
     * URL to the mini app's icon image. Used for display purposes in UI.
     * Should be a square image, preferably in PNG or SVG format.
     * Recommended size: 256x256px or larger for high-DPI displays.
     * 
     * @type {string}
     * @required
     * @format uri
     * @pattern ^https?://.*\.(png|jpg|jpeg|svg|webp)$
     * 
     * @example
     * ```typescript
     * icon: 'https://cdn.example.com/miniapp-icon.png'
     * ```
     */
    icon: string;

    /**
     * The display name of the mini app.
     * Should be concise and descriptive, typically 1-3 words.
     * Maximum recommended length: 50 characters.
     * 
     * @type {string}
     * @required
     * @maxLength 50
     * 
     * @example
     * ```typescript
     * title: 'DeFi Swap'
     * ```
     */
    title: string;

    /**
     * A brief description of what the mini app does.
     * Should clearly explain the app's purpose and main functionality.
     * Maximum recommended length: 200 characters for optimal display.
     * 
     * @type {string}
     * @required
     * @maxLength 200
     * 
     * @example
     * ```typescript
     * description: 'Swap tokens seamlessly across multiple blockchains with low fees'
     * ```
     */
    description: string;

    /**
     * Optional base URL for relative API calls within the mini app.
     * If provided, all relative URLs in actions will be resolved against this base.
     * Must be a valid HTTPS URL if specified.
     * 
     * @type {string}
     * @optional
     * @format uri
     * @pattern ^https?://
     * 
     * @example
     * ```typescript
     * baseUrl: 'https://api.my-miniapp.com/v1'
     * ```
     */
    baseUrl?: string;

    /**
     * The actions that can be performed by the mini app.
     * This is an array of different types of actions, which can include:
     * - BlockchainActionMetadata: For blockchain interactions (transfers, smart contract calls)
     * - TransferAction: For token transfers between addresses
     * - HttpAction: For HTTP calls and form submissions
     * - ActionFlow: For complex flows with multiple nested actions
     * 
     * Actions are processed and validated before execution to ensure security and compatibility.
     * 
     * @type {Action[]}
     * @required
     * @minItems 1
     * 
     * @example
     * ```typescript
     * actions: [
     *   {
     *     type: 'transfer',
     *     token: 'USDC',
     *     amount: '100',
     *     recipient: '0x742d35Cc7Bf58C014e2b17d28f71fe6a0cE8E21e'
     *   },
     *   {
     *     type: 'http',
     *     method: 'POST',
     *     url: '/api/notify',
     *     headers: { 'Content-Type': 'application/json' }
     *   }
     * ]
     * ```
     */
    actions: Action[];
}

/**
 * Represents validated and processed metadata for a mini app.
 * This interface extends the base Metadata interface but with validated actions
 * that have been processed, type-checked, and are ready for execution.
 * 
 * The validation process includes:
 * - Type validation for all action parameters
 * - Security checks for URLs and smart contract addresses
 * - Schema validation against action definitions
 * - Permission and capability verification
 * 
 * @interface ValidatedMetadata
 * @extends {Omit<Metadata, 'actions'>}
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * const validatedMetadata: ValidatedMetadata = {
 *   url: 'https://example.com/miniapp',
 *   icon: 'https://example.com/icon.png',
 *   title: 'My Mini App',
 *   description: 'A validated mini app',
 *   baseUrl: 'https://api.example.com',
 *   actions: [
 *     {
 *       id: 'action_123',
 *       type: 'blockchain',
 *       validated: true,
 *       securityLevel: 'high',
 *       estimatedGas: '21000'
 *     }
 *   ]
 * };
 * ```
 */
export interface ValidatedMetadata extends Omit<Metadata, 'actions'> {
    /**
     * The validated actions that can be performed by the mini app.
     * 
     * This array contains actions that have been processed and validated, but NOT necessarily
     * enriched with additional metadata. The key difference from raw actions is:
     * 
     * Action Types (same as Action union but validated):
     * - **BlockchainAction**: Processed from BlockchainActionMetadata with validation
     * - **TransferAction**: Transfer actions (same structure as in Action)
     * - **HttpAction**: HTTP actions (same structure as in Action)  
     * - **ActionFlow**: Action flows (same structure as in Action)
     * - **DynamicAction**: Dynamic actions (same structure as in Action)
     * 
     * Note: The main difference is that BlockchainActionMetadata becomes BlockchainAction
     * after processing, while other action types remain structurally the same but are
     * considered "validated" after passing validation checks.
     * 
     * @type {ValidatedAction[]}
     * @required
     * @minItems 1
     * 
     * @example
     * ```typescript
     * actions: [
     *   // BlockchainAction (processed from BlockchainActionMetadata)
     *   {
     *     type: 'blockchain',
     *     label: 'Approve USDC',
     *     address: '0xA0b86a33E6417C8D7648D5b1D6fF0F6dB6c15b2a',
     *     abi: [...],
     *     functionName: 'approve',
     *     chains: { source: 'ethereum' },
     *     blockchainActionType: 'approve' // Added during processing
     *   },
     *   // TransferAction (validated but structurally unchanged)
     *   {
     *     type: 'transfer',
     *     label: 'Send USDC',
     *     token: 'USDC',
     *     amount: '100',
     *     recipient: '0x742d35Cc7Bf58C014e2b17d28f71fe6a0cE8E21e',
     *     chains: { source: 'polygon' }
     *   }
     * ]
     * ```
     */
    actions: ValidatedAction[];
}
