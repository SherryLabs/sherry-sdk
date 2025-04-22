import { Action, ValidatedAction } from './actions/action';

export interface Metadata {
    url: string;
    icon: string;
    title: string;
    description: string;
    /**
     * The actions that can be performed by the mini app.
     * This is an array of different types of actions, which can include:
     * - BlockchainActionMetadata: For blockchain interactions
     * - TransferAction: For token transfers
     * - HttpAction: For HTTP calls and forms
     * - ActionFlow: For complex flows with multiple nested actions
     */
    actions: Action[];
}

export interface ValidatedMetadata extends Omit<Metadata, 'actions'> {
    /**
     * The validated actions that can be performed by the mini app.
     * This array can include:
     * - BlockchainAction: Processed blockchain actions
     * - TransferAction: Transfer actions
     * - HttpAction: HTTP actions
     * - ActionFlow: Validated flow of nested actions
     */
    actions: ValidatedAction[];
}
