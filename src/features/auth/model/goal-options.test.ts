import { toggleGoalSelection } from './goal-options';

describe('toggleGoalSelection', () => {
  it.each([
    [[], 'stayActive', ['stayActive']],
    [['stayActive'], 'gainConfidence', ['stayActive', 'gainConfidence']],
    [['stayActive', 'gainConfidence'], 'stayActive', ['gainConfidence']],
    [['stayActive'], 'stayActive', []],
  ] as const)('from %j toggling %s gives %j', (selectedGoalIds, goalId, expectedGoalIds) => {
    expect(toggleGoalSelection(selectedGoalIds, goalId)).toEqual(expectedGoalIds);
  });
});
