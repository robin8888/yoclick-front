import { buildSetupGuideGroups } from './setup-guide-steps';

function listStepIds(canManageSpaces: boolean): string[] {
  return buildSetupGuideGroups({ canManageSpaces }).flatMap((group) =>
    group.steps.map((step) => step.id),
  );
}

describe('buildSetupGuideGroups', () => {
  it.each([
    {
      caseName: 'a sector with rooms',
      canManageSpaces: true,
      expectedStepIds: [
        'centerDetails',
        'brand',
        'openingHours',
        'services',
        'rooms',
        'team',
        'passes',
        'onlinePayments',
        'inviteClients',
        'privacy',
        'firstAppointment',
      ],
    },
    {
      caseName: 'a sector without rooms',
      canManageSpaces: false,
      expectedStepIds: [
        'centerDetails',
        'brand',
        'openingHours',
        'services',
        'team',
        'passes',
        'onlinePayments',
        'inviteClients',
        'privacy',
        'firstAppointment',
      ],
    },
  ])('lists the steps in order for $caseName', ({ canManageSpaces, expectedStepIds }) => {
    expect(listStepIds(canManageSpaces)).toEqual(expectedStepIds);
  });

  it('numbers the steps from 1 without gaps when a sector has no rooms', () => {
    const positions = buildSetupGuideGroups({ canManageSpaces: false }).flatMap((group) =>
      group.steps.map((step) => step.position),
    );

    expect(positions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('never repeats a step', () => {
    const stepIds = listStepIds(true);

    expect(new Set(stepIds).size).toBe(stepIds.length);
  });
});
