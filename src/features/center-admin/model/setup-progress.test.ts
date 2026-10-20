import { buildSetupGuideGroups } from './setup-guide-steps';
import { summarizeSetupProgress, type SetupFacts } from './setup-progress';

const NOTHING_DONE: SetupFacts = {
  hasCenterDetails: false,
  hasOpeningHours: false,
  hasServices: false,
  hasRooms: false,
  hasTeam: false,
  hasClients: false,
};

describe('summarizeSetupProgress', () => {
  const groups = buildSetupGuideGroups({ canManageSpaces: true });

  it('starts at the first step of the guide when nothing is done', () => {
    const progress = summarizeSetupProgress(groups, NOTHING_DONE);

    expect(progress.doneCount).toBe(0);
    expect(progress.totalCount).toBe(6);
    expect(progress.nextStep?.id).toBe('centerDetails');
  });

  it('moves on to the first step that is still missing', () => {
    const progress = summarizeSetupProgress(groups, {
      ...NOTHING_DONE,
      hasCenterDetails: true,
      hasOpeningHours: true,
    });

    expect(progress.doneCount).toBe(2);
    expect(progress.nextStep?.id).toBe('services');
    expect(progress.completedStepIds.has('openingHours')).toBe(true);
  });

  it('has no next step once everything measurable is done', () => {
    const progress = summarizeSetupProgress(groups, {
      hasCenterDetails: true,
      hasOpeningHours: true,
      hasServices: true,
      hasRooms: true,
      hasTeam: true,
      hasClients: true,
    });

    expect(progress.doneCount).toBe(progress.totalCount);
    expect(progress.nextStep).toBeUndefined();
  });

  it('does not count the rooms step for a center without rooms', () => {
    const withoutRooms = buildSetupGuideGroups({
      canManageSpaces: true,
      modules: { rooms: false },
    });

    expect(summarizeSetupProgress(withoutRooms, NOTHING_DONE).totalCount).toBe(5);
  });
});
