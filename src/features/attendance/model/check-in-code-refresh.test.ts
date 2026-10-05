import { calculateRefreshDelayMs } from './check-in-code-refresh';

const NOW_MS = Date.parse('2026-10-05T10:00:00Z');

describe('calculateRefreshDelayMs', () => {
  it.each([
    ['a five-minute code', '2026-10-05T10:05:00Z', 270_000],
    ['a code that expires in 40 seconds', '2026-10-05T10:00:40Z', 10_000],
    ['a code about to expire', '2026-10-05T10:00:10Z', 5_000],
    ['a code already expired', '2026-10-05T09:59:00Z', 5_000],
  ])('waits the right time for %s', (_caseName, expiresAtIso, expectedDelayMs) => {
    expect(calculateRefreshDelayMs(expiresAtIso, NOW_MS)).toBe(expectedDelayMs);
  });
});
