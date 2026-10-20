import type { SetupGuideGroup, SetupGuideStep, SetupGuideStepId } from './setup-guide-steps';

/** Lo que se sabe del centro y deja dar por hecho un paso; el resto de pasos no se puede medir. */
export interface SetupFacts {
  hasCenterDetails: boolean;
  hasOpeningHours: boolean;
  hasServices: boolean;
  hasRooms: boolean;
  hasTeam: boolean;
  hasClients: boolean;
}

export interface SetupProgress {
  /** Los pasos medibles que ya están hechos. */
  completedStepIds: ReadonlySet<SetupGuideStepId>;
  doneCount: number;
  totalCount: number;
  /** El primer paso medible que falta, o `undefined` si ya está todo. */
  nextStep: SetupGuideStep | undefined;
}

function listCompletedStepIds(facts: SetupFacts): SetupGuideStepId[] {
  const completedByStep: readonly [SetupGuideStepId, boolean][] = [
    ['centerDetails', facts.hasCenterDetails],
    ['openingHours', facts.hasOpeningHours],
    ['services', facts.hasServices],
    ['rooms', facts.hasRooms],
    ['team', facts.hasTeam],
    ['inviteClients', facts.hasClients],
  ];
  return completedByStep.filter(([, isDone]) => isDone).map(([stepId]) => stepId);
}

const MEASURABLE_STEP_IDS: ReadonlySet<SetupGuideStepId> = new Set([
  'centerDetails',
  'openingHours',
  'services',
  'rooms',
  'team',
  'inviteClients',
]);

/** Cuántos pasos medibles lleva hechos el centro y cuál toca ahora; sigue el orden de la guía. */
export function summarizeSetupProgress(
  groups: readonly SetupGuideGroup[],
  facts: SetupFacts,
): SetupProgress {
  const completedStepIds = new Set(listCompletedStepIds(facts));
  const measurableSteps = groups
    .flatMap((group) => group.steps)
    .filter((step) => MEASURABLE_STEP_IDS.has(step.id));
  const pendingSteps = measurableSteps.filter((step) => !completedStepIds.has(step.id));

  return {
    completedStepIds,
    doneCount: measurableSteps.length - pendingSteps.length,
    totalCount: measurableSteps.length,
    nextStep: pendingSteps[0],
  };
}
