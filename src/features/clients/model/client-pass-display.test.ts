import { resolveClientPassBadge } from './client-pass-display';

describe('resolveClientPassBadge', () => {
  it.each([
    ['none', 'neutral'],
    ['pending', 'warning'],
    ['active', 'success'],
    ['ended', 'danger'],
  ] as const)('%s uses the %s tone', (state, expectedTone) => {
    const passSummary = { state, remainingSessions: null, expiresAt: null };
    expect(resolveClientPassBadge(passSummary)).toEqual({ id: state, tone: expectedTone });
  });
});
