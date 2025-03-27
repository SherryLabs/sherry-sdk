import { 
    ActionFlow, 
    NestedAction, 
    NestedBlockchainAction,
    NestedTransferAction,
    NestedHttpAction,
    DecisionAction,
    CompletionAction,
    NextActionDefinition 
} from '../interface/nestedAction';
import { InvalidMetadataError } from '../errors/customErrors';
import { HttpActionValidator } from './httpActionValidator';
import { isAddress } from 'viem';

/**
 * Class for validating nested action flows.
 * Verifies the integrity, coherence, and validity of the action graph.
 */
export class FlowValidator {
    /**
     * Validates a complete action flow.
     * @param flow Flow to validate
     * @returns Validated flow
     * @throws InvalidMetadataError if there are errors
     */
    static validateFlow(flow: ActionFlow): ActionFlow {
        if (!flow.label) {
            throw new InvalidMetadataError('Flow must have a label');
        }

        if (!flow.initialActionId) {
            throw new InvalidMetadataError('Flow must have an initialActionId');
        }

        if (!Array.isArray(flow.actions) || flow.actions.length === 0) {
            throw new InvalidMetadataError('Flow must have at least one action');
        }

        // Verify that the initial action exists
        const initialAction = flow.actions.find(action => action.id === flow.initialActionId);
        if (!initialAction) {
            throw new InvalidMetadataError(`Initial action '${flow.initialActionId}' not found`);
        }

        // Validate each action
        const validatedActions = flow.actions.map(action => this.validateAction(action, flow));

        // Verify the integrity of the action graph
        this.validateActionGraph(flow);

        return {
            ...flow,
            actions: validatedActions
        };
    }

    /**
     * Validates a specific action within the flow.
     * @param action Action to validate
     * @param flow Complete flow (to validate references)
     * @returns Validated action
     * @throws InvalidMetadataError if there are errors
     */
    private static validateAction(action: NestedAction, flow: ActionFlow): NestedAction {
        if (!action.id) {
            throw new InvalidMetadataError('Action must have an id');
        }

        if (!action.label) {
            throw new InvalidMetadataError(`Action '${action.id}' must have a label`);
        }

        // Validate according to the type of action
        switch (action.type) {
            case 'blockchain':
                return this.validateBlockchainAction(action as NestedBlockchainAction, flow);
            case 'transfer':
                return this.validateTransferAction(action as NestedTransferAction, flow);
            case 'http':
                return this.validateHttpAction(action as NestedHttpAction, flow);
            case 'decision':
                return this.validateDecisionAction(action as DecisionAction, flow);
            case 'completion':
                return this.validateCompletionAction(action as CompletionAction, flow);
            default:
                throw new InvalidMetadataError(`Unknown action type for action '${(action as NestedAction).id}'`);
        }
    }

    /**
     * Validates a blockchain type action.
     */
    private static validateBlockchainAction(
        action: NestedBlockchainAction, 
        flow: ActionFlow
    ): NestedBlockchainAction {
        // Validate basic properties of a blockchain action
        if (!action.address) {
            throw new InvalidMetadataError(`Blockchain action '${action.id}' must have an address`);
        }

        if (!isAddress(action.address)) {
            throw new InvalidMetadataError(`Blockchain action '${action.id}' has invalid address: ${action.address}`);
        }

        if (!action.functionName) {
            throw new InvalidMetadataError(`Blockchain action '${action.id}' must have a functionName`);
        }

        if (!action.abi || !Array.isArray(action.abi) || action.abi.length === 0) {
            throw new InvalidMetadataError(`Blockchain action '${action.id}' must have a valid ABI`);
        }

        if (!action.chains || !action.chains.source) {
            throw new InvalidMetadataError(`Blockchain action '${action.id}' must have a source chain`);
        }

        // Validate the next actions
        if (action.nextActions) {
            this.validateNextActions(action.nextActions, action.id, flow);
        }

        return action;
    }

    /**
     * Validates a transfer type action.
     */
    private static validateTransferAction(
        action: NestedTransferAction, 
        flow: ActionFlow
    ): NestedTransferAction {
        // If to is not a placeholder, validate that it is a valid address
        if (action.to && !action.to.includes('{{') && !isAddress(action.to)) {
            throw new InvalidMetadataError(`Transfer action '${action.id}' has invalid address: ${action.to}`);
        }

        if (action.amount === undefined || action.amount <= 0) {
            throw new InvalidMetadataError(`Transfer action '${action.id}' must have a positive amount`);
        }

        if (!action.chains || !action.chains.source) {
            throw new InvalidMetadataError(`Transfer action '${action.id}' must have a source chain`);
        }

        // Validate the next actions
        if (action.nextActions) {
            this.validateNextActions(action.nextActions, action.id, flow);
        }

        return action;
    }

    /**
     * Validates an HTTP type action.
     */
    private static validateHttpAction(
        action: NestedHttpAction, 
        flow: ActionFlow
    ): NestedHttpAction {
        try {
            // Use the existing HTTP validator
            const httpAction = {
                label: action.label,
                endpoint: action.endpoint,
                params: action.params || []
            };
            
            const validatedHttpAction = HttpActionValidator.validateHttpAction(httpAction);
            
            // Update the validated parameters
            action.params = validatedHttpAction.params;
            
            // Validate the next actions
            if (action.nextActions) {
                this.validateNextActions(action.nextActions, action.id, flow);
            }
            
            return action;
        } catch (error) {
            if (error instanceof Error) {
                throw new InvalidMetadataError(`HTTP action '${action.id}' validation failed: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Validates a decision type action.
     */
    private static validateDecisionAction(
        action: DecisionAction, 
        flow: ActionFlow
    ): DecisionAction {
        if (!action.title) {
            throw new InvalidMetadataError(`Decision action '${action.id}' must have a title`);
        }

        if (!action.options || !Array.isArray(action.options) || action.options.length === 0) {
            throw new InvalidMetadataError(`Decision action '${action.id}' must have options`);
        }

        // Validate each option
        action.options.forEach(option => {
            if (!option.label) {
                throw new InvalidMetadataError(`Option in decision action '${action.id}' must have a label`);
            }
            
            if (option.value === undefined) {
                throw new InvalidMetadataError(`Option '${option.label}' in decision action '${action.id}' must have a value`);
            }
            
            if (!option.nextActionId) {
                throw new InvalidMetadataError(`Option '${option.label}' in decision action '${action.id}' must have a nextActionId`);
            }
            
            // Verify that the next action exists
            const nextAction = flow.actions.find(a => a.id === option.nextActionId);
            if (!nextAction) {
                throw new InvalidMetadataError(`Next action '${option.nextActionId}' from option '${option.label}' in decision action '${action.id}' not found`);
            }
        });

        return action;
    }

    /**
     * Validates a completion type action.
     */
    private static validateCompletionAction(
        action: CompletionAction, 
        flow: ActionFlow
    ): CompletionAction {
        if (!action.message) {
            throw new InvalidMetadataError(`Completion action '${action.id}' must have a message`);
        }

        if (!['success', 'error', 'info'].includes(action.status)) {
            throw new InvalidMetadataError(`Completion action '${action.id}' must have a valid status (success, error, or info)`);
        }

        // Completion actions should not have nextActions
        if (action.nextActions && action.nextActions.length > 0) {
            throw new InvalidMetadataError(`Completion action '${action.id}' should not have nextActions`);
        }

        return action;
    }

    /**
     * Validates the definition of next actions.
     */
    private static validateNextActions(
        nextActions: NextActionDefinition[], 
        actionId: string, 
        flow: ActionFlow
    ): void {
        nextActions.forEach(nextAction => {
            if (!nextAction.actionId) {
                throw new InvalidMetadataError(`NextAction in action '${actionId}' must have an actionId`);
            }
            
            // Verify that the next action exists
            const targetAction = flow.actions.find(a => a.id === nextAction.actionId);
            if (!targetAction) {
                throw new InvalidMetadataError(`Next action '${nextAction.actionId}' from action '${actionId}' not found`);
            }
            
            // Validate conditions if they exist
            if (nextAction.conditions) {
                nextAction.conditions.forEach(condition => {
                    if (!condition.field) {
                        throw new InvalidMetadataError(`Condition in nextAction '${nextAction.actionId}' from action '${actionId}' must have a field`);
                    }
                    
                    if (!['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'contains'].includes(condition.operator)) {
                        throw new InvalidMetadataError(`Condition in nextAction '${nextAction.actionId}' from action '${actionId}' has invalid operator: ${condition.operator}`);
                    }
                    
                    if (condition.value === undefined) {
                        throw new InvalidMetadataError(`Condition in nextAction '${nextAction.actionId}' from action '${actionId}' must have a value`);
                    }
                });
            }
        });
    }

    /**
     * Validates the integrity of the action graph (detects cycles, unreachable nodes, etc.)
     */
    private static validateActionGraph(flow: ActionFlow): void {
        // Verify that all actions are reachable from the initial action
        const reachableActions = new Set<string>();
        const actionsToCheck = [flow.initialActionId];
        
        while (actionsToCheck.length > 0) {
            const currentActionId = actionsToCheck.pop()!;
            if (reachableActions.has(currentActionId)) continue;
            
            reachableActions.add(currentActionId);
            
            const currentAction = flow.actions.find(a => a.id === currentActionId);
            if (!currentAction) continue;
            
            // Add the next actions to the verification list
            if (currentAction.type === 'decision') {
                currentAction.options.forEach(option => {
                    if (!reachableActions.has(option.nextActionId)) {
                        actionsToCheck.push(option.nextActionId);
                    }
                });
            } else if (currentAction.nextActions) {
                currentAction.nextActions.forEach(nextAction => {
                    if (!reachableActions.has(nextAction.actionId)) {
                        actionsToCheck.push(nextAction.actionId);
                    }
                });
            }
        }
        
        // Check for unreachable actions
        const unreachableActions = flow.actions.filter(a => !reachableActions.has(a.id));
        if (unreachableActions.length > 0) {
            const unreachableIds = unreachableActions.map(a => a.id).join(', ');
            throw new InvalidMetadataError(`The following actions are unreachable: ${unreachableIds}`);
        }
    }
}