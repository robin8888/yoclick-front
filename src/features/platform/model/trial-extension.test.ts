import { extendTrialEnd } from './trial-extension';

const NOW = new Date('2026-10-21T10:00:00.000Z');

describe('extendTrialEnd', () => {
  it.each([
    {
      caseName: 'adds the days to the current end when the trial is still running',
      currentTrialEndsAt: '2026-10-25T10:00:00.000Z',
      expected: '2026-11-01T10:00:00.000Z',
    },
    {
      caseName: 'counts from now when the trial already ended',
      currentTrialEndsAt: '2026-10-01T10:00:00.000Z',
      expected: '2026-10-28T10:00:00.000Z',
    },
    {
      caseName: 'counts from now when there was no trial',
      currentTrialEndsAt: null,
      expected: '2026-10-28T10:00:00.000Z',
    },
  ])('$caseName', ({ currentTrialEndsAt, expected }) => {
    expect(extendTrialEnd({ currentTrialEndsAt, now: NOW, days: 7 })).toBe(expected);
  });
});
