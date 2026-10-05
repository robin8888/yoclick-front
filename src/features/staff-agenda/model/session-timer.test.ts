import { computeSessionTimer, formatTimerDuration } from './session-timer';

const STARTED_AT = new Date('2026-10-05T10:00:00.000Z');
const SIXTY_MINUTES = 3600;

function secondsAfterStart(seconds: number): Date {
  return new Date(STARTED_AT.getTime() + seconds * 1000);
}

describe('computeSessionTimer', () => {
  it.each([
    {
      caseName: 'just started',
      seconds: 0,
      elapsed: 0,
      remaining: 3600,
      isOvertime: false,
      progress: 0,
    },
    {
      caseName: 'halfway',
      seconds: 1800,
      elapsed: 1800,
      remaining: 1800,
      isOvertime: false,
      progress: 0.5,
    },
    {
      caseName: 'exactly on time',
      seconds: 3600,
      elapsed: 3600,
      remaining: 0,
      isOvertime: false,
      progress: 1,
    },
    {
      caseName: 'five minutes over',
      seconds: 3900,
      elapsed: 3900,
      remaining: 0,
      isOvertime: true,
      progress: 1,
    },
  ])(
    'computes the state when $caseName',
    ({ seconds, elapsed, remaining, isOvertime, progress }) => {
      const timer = computeSessionTimer({
        startedAt: STARTED_AT,
        plannedDurationSeconds: SIXTY_MINUTES,
        now: secondsAfterStart(seconds),
      });

      expect(timer).toMatchObject({
        elapsedSeconds: elapsed,
        remainingSeconds: remaining,
        isOvertime,
        progressFraction: progress,
      });
    },
  );

  it('reports the overtime in seconds', () => {
    const timer = computeSessionTimer({
      startedAt: STARTED_AT,
      plannedDurationSeconds: SIXTY_MINUTES,
      now: secondsAfterStart(3900),
    });

    expect(timer.overtimeSeconds).toBe(300);
  });

  it('never goes negative if the phone clock is slightly behind the server', () => {
    const timer = computeSessionTimer({
      startedAt: STARTED_AT,
      plannedDurationSeconds: SIXTY_MINUTES,
      now: secondsAfterStart(-3),
    });

    expect(timer.elapsedSeconds).toBe(0);
    expect(timer.remainingSeconds).toBe(SIXTY_MINUTES);
  });

  it('treats a session with no planned duration as complete', () => {
    const timer = computeSessionTimer({
      startedAt: STARTED_AT,
      plannedDurationSeconds: 0,
      now: secondsAfterStart(10),
    });

    expect(timer.progressFraction).toBe(1);
  });
});

describe('formatTimerDuration', () => {
  it.each([
    [0, '00:00'],
    [7, '00:07'],
    [65, '01:05'],
    [2707, '45:07'],
    [3600, '1:00:00'],
    [3907, '1:05:07'],
    [-5, '00:00'],
  ])('formats %d seconds as %s', (totalSeconds, expectedText) => {
    expect(formatTimerDuration(totalSeconds)).toBe(expectedText);
  });
});
