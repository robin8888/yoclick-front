import {
  calculateClientUsagePercent,
  calculateTrialRemainingPercent,
  countClientsOverLimit,
  countTrialDaysLeft,
} from './subscription-plan';

const NOW = new Date('2026-10-07T10:00:00Z');

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

describe('countClientsOverLimit', () => {
  it.each([
    [212, 150, 62],
    [151, 150, 1],
    [150, 150, 0],
    [40, 150, 0],
    [4000, null, 0],
  ])('%i active clients with a limit of %s are %s over', (activeCount, maxClients, expected) => {
    expect(countClientsOverLimit(activeCount, maxClients)).toBe(expected);
  });
});

describe('calculateTrialRemainingPercent', () => {
  it.each([
    [14, 100],
    [7, 50],
    [1, 7],
    [0, 0],
    [20, 100],
    [null, null],
  ])('with %s days left the trial has %s %% left', (daysLeft, expected) => {
    expect(calculateTrialRemainingPercent(daysLeft)).toBe(expected);
  });
});
