/**
 * Objetivos neutros, válidos para cualquier tipo de centro. El prototipo los cambia según el
 * sector (p. ej. «Ganar fuerza»); hasta que la API los defina se usan los mismos para todos.
 */
export const GOAL_IDS = [
  'improveTechnique',
  'stayActive',
  'gainConfidence',
  'prepareForEvent',
  'recoverFromInjury',
  'learnSomethingNew',
] as const;

export type GoalId = (typeof GOAL_IDS)[number];

export function toggleGoalSelection(
  selectedGoalIds: readonly string[],
  goalId: GoalId,
): readonly string[] {
  return selectedGoalIds.includes(goalId)
    ? selectedGoalIds.filter((selectedGoalId) => selectedGoalId !== goalId)
    : [...selectedGoalIds, goalId];
}
