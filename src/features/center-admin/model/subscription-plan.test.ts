import {
  calculateClientUsagePercent,
  countTrialDaysLeft,
  resolveSubscriptionPlan,
} from './subscription-plan';

const NOW = new Date('2026-10-07T10:00:00Z');

describe('resolveSubscriptionPlan', () => {
  it.each([
    [150, 'basic'],
    [500, 'pro'],
    [null, 'premium'],
    [300, 'custom'],
  ] as const)('reads a limit of %s clients as the %s plan', (maxClients, expected) => {
    expect(resolveSubscriptionPlan(maxClients)).toBe(expected);
  });
});

describe('calculateClientUsagePercent', () => {
  it.each([
    [75, 150, 50],
    [212, 150, 100],
    [0, 150, 0],
    [40, null, null],
  ])('%i active clients out of %s is %s %%', (activeCount, maxClients, expected) => {
    expect(calculateClientUsagePercent(activeCount, maxClients)).toBe(expected);
  });
});

describe('countTrialDaysLeft', () => {
  it.each([
    ['2026-10-21T10:00:00Z', 14],
    ['2026-10-07T18:00:00Z', 1],
    ['2026-10-01T10:00:00Z', 0],
    [null, null],
  ])('with the trial ending on %s there are %s days left', (trialEndsAt, expected) => {
    expect(countTrialDaysLeft(trialEndsAt, NOW)).toBe(expected);
  });
});
