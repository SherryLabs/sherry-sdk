// tests/nested-actions/flow-validator.test.ts
import { describe, expect, it } from '@jest/globals';
import { FlowValidator } from '../../src/validators/flowValidator';
import { ActionFlow, NestedHttpAction, DecisionAction, CompletionAction } from '../../src/interface/nestedAction';
import { InvalidMetadataError } from '../../src/errors/customErrors';
import { nestedActionExamples } from '../../src/examples/nested-actions';

describe('FlowValidator', () => {
  // Sample valid flow for testing
  const validFlow: ActionFlow = {
    type: 'flow',
    label: 'Test Flow',
    initialActionId: 'start',
    actions: [
      {
        id: 'start',
        type: 'http',
        label: 'Start',
        endpoint: 'https://api.example.com/start',
        params: [],
        nextActions: [
          { actionId: 'decision' }
        ]
      } as NestedHttpAction,
      {
        id: 'decision',
        type: 'decision',
        label: 'Make Decision',
        title: 'Choose an option',
        options: [
          { label: 'Option A', value: 'a', nextActionId: 'complete-a' },
          { label: 'Option B', value: 'b', nextActionId: 'complete-b' }
        ]
      } as DecisionAction,
      {
        id: 'complete-a',
        type: 'completion',
        label: 'Complete A',
        message: 'You chose option A',
        status: 'success'
      } as CompletionAction,
      {
        id: 'complete-b',
        type: 'completion',
        label: 'Complete B',
        message: 'You chose option B',
        status: 'success'
      } as CompletionAction
    ]
  };

  describe('validateFlow', () => {
    it('should validate a correct flow', () => {
      const result = FlowValidator.validateFlow(validFlow);
      expect(result).toBeDefined();
      expect(result.actions).toHaveLength(4);
      expect(result.initialActionId).toBe('start');
    });

    it('should throw error for a flow without initialActionId', () => {
      const invalidFlow = { ...validFlow, initialActionId: "" };
      expect(() => FlowValidator.validateFlow(invalidFlow as ActionFlow)).toThrow(InvalidMetadataError);
      expect(() => FlowValidator.validateFlow(invalidFlow as ActionFlow)).toThrow(/initialActionId/);
    });

    it('should throw error for a flow with non-existent initialActionId', () => {
      const invalidFlow = { ...validFlow, initialActionId: 'non-existent' };
      expect(() => FlowValidator.validateFlow(invalidFlow)).toThrow(InvalidMetadataError);
      expect(() => FlowValidator.validateFlow(invalidFlow)).toThrow(/Initial action.*not found/);
    });

    it('should throw error for a flow without actions', () => {
      const invalidFlow = { ...validFlow, actions: [] };
      expect(() => FlowValidator.validateFlow(invalidFlow)).toThrow(InvalidMetadataError);
      expect(() => FlowValidator.validateFlow(invalidFlow)).toThrow(/at least one action/);
    });

    it('should throw error for actions with duplicate IDs', () => {
      const duplicateIdFlow = {
        ...validFlow,
        actions: [
          ...validFlow.actions,
          { ...validFlow.actions[0], label: 'Duplicate ID Action' } // Same ID as first action
        ]
      };
      expect(() => FlowValidator.validateFlow(duplicateIdFlow)).toThrow(InvalidMetadataError);
      expect(() => FlowValidator.validateFlow(duplicateIdFlow)).toThrow(/duplicate ID/);
    });
  });

  describe('Unreachable Actions', () => {
    it('should throw error for unreachable actions', () => {
      const unreachableFlow: ActionFlow = {
        type: 'flow',
        label: 'Unreachable Flow',
        initialActionId: 'start',
        actions: [
          {
            id: 'start',
            type: 'http',
            label: 'Start',
            endpoint: 'https://api.example.com/start',
            nextActions: [
              { actionId: 'middle' }
            ]
          } as NestedHttpAction,
          {
            id: 'middle',
            type: 'http',
            label: 'Middle',
            endpoint: 'https://api.example.com/middle',
            nextActions: [
              { actionId: 'end' }
            ]
          } as NestedHttpAction,
          {
            id: 'end',
            type: 'completion',
            label: 'End',
            message: 'End of flow',
            status: 'success'
          } as CompletionAction,
          {
            id: 'unreachable',
            type: 'completion',
            label: 'Unreachable',
            message: 'This action can never be reached',
            status: 'error'
          } as CompletionAction
        ]
      };

      expect(() => FlowValidator.validateFlow(unreachableFlow)).toThrow(InvalidMetadataError);
      expect(() => FlowValidator.validateFlow(unreachableFlow)).toThrow(/unreachable/);
    });
  });

  describe('validateAction', () => {
    it('should validate a blockchain action', () => {
      const blockchainAction = {
        id: 'approve',
        type: 'blockchain',
        label: 'Approve Token',
        address: '0x1234567890123456789012345678901234567890',
        abi: [{
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }],
        functionName: 'approve',
        chains: { source: 'ethereum' },
        nextActions: [
          { actionId: 'complete' }
        ]
      };

      // Mock the full flow for validation context
      const mockFlow = {
        ...validFlow,
        actions: [
          ...validFlow.actions,
          blockchainAction,
          // Add a completion action for nextAction reference
          {
            id: 'complete',
            type: 'completion',
            label: 'Complete',
            message: 'Transaction completed',
            status: 'success'
          }
        ]
      };

      // Use the private method via any cast to test it directly
      const result = (FlowValidator as any).validateAction(blockchainAction, mockFlow);
      expect(result).toBeDefined();
      expect(result.id).toBe('approve');
      expect(result.type).toBe('blockchain');
    });

    it('should validate a decision action', () => {
      // Decision already in validFlow, we'll use that
      const decision = validFlow.actions.find(a => a.id === 'decision');
      
      // Using the private method via any cast
      const result = (FlowValidator as any).validateAction(decision, validFlow);
      expect(result).toBeDefined();
      expect(result.id).toBe('decision');
      expect(result.type).toBe('decision');
      expect(result.options).toHaveLength(2);
    });

    it('should throw error for a decision without options', () => {
      const invalidDecision = {
        ...validFlow.actions.find(a => a.id === 'decision'),
        options: []
      };

      expect(() => (FlowValidator as any).validateAction(invalidDecision, validFlow))
        .toThrow(InvalidMetadataError);
      expect(() => (FlowValidator as any).validateAction(invalidDecision, validFlow))
        .toThrow(/must have options/);
    });
  });

  describe('Example Flows', () => {
    it('should validate onboarding flow example', () => {
      const result = FlowValidator.validateFlow(nestedActionExamples.onboardingFlow);
      expect(result).toBeDefined();
      expect(result.label).toBe('User Onboarding');
    });

    it('should validate DeFi swap flow example', () => {
      const result = FlowValidator.validateFlow(nestedActionExamples.defiSwap);
      expect(result).toBeDefined();
      expect(result.label).toBe('Token Swap Flow');
    });

    it('should validate governance flow example', () => {
      const result = FlowValidator.validateFlow(nestedActionExamples.governance);
      expect(result).toBeDefined();
      expect(result.label).toBe('DAO Governance');
    });
  });
});