import { buildInProgressLabel, isSessionRunning } from './in-progress-label';

describe('buildInProgressLabel', () => {
  it.each([
    ['just started', ['09:00:00', '09:00:00'], 'En curso · 00:00'],
    ['a few minutes in', ['09:00:00', '09:12:34'], 'En curso · 12:34'],
    ['over an hour in', ['09:00:00', '10:05:07'], 'En curso · 1:05:07'],
    ['a clock a bit behind', ['09:00:05', '09:00:00'], 'En curso · 00:00'],
  ])('writes the time when it is %s', (_case, [startTime = '', nowTime = ''], expectedLabel) => {
    const startedAt = `2026-10-27T${startTime}.000Z`;

    expect(buildInProgressLabel({ startedAt, now: new Date(`2026-10-27T${nowTime}.000Z`) })).toBe(
      expectedLabel,
    );
  });
});

describe('isSessionRunning', () => {
  it.each([
    ['not started', { startedAt: null, endedAt: null }, false],
    ['started and open', { startedAt: '2026-10-27T09:00:00.000Z', endedAt: null }, true],
    [
      'started and closed',
      { startedAt: '2026-10-27T09:00:00.000Z', endedAt: '2026-10-27T10:00:00.000Z' },
      false,
    ],
  ])('tells %s', (_case, session, isExpected) => {
    expect(isSessionRunning(session)).toBe(isExpected);
  });
});
