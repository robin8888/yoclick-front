import { describeClientLevel, resolveClientBadge, toStatusParam } from './client-display';

describe('resolveClientBadge', () => {
  it.each([
    [
      { status: 'active', activity: 'active' },
      { id: 'active', tone: 'success' },
    ],
    [
      { status: 'active', activity: 'new' },
      { id: 'new', tone: 'info' },
    ],
    [
      { status: 'active', activity: 'inactive' },
      { id: 'inactive', tone: 'neutral' },
    ],
    [
      { status: 'blocked', activity: 'active' },
      { id: 'blocked', tone: 'danger' },
    ],
    [
      { status: 'blocked', activity: 'new' },
      { id: 'blocked', tone: 'danger' },
    ],
  ] as const)('%j shows %j', (facts, expectedBadge) => {
    expect(resolveClientBadge(facts)).toEqual(expectedBadge);
  });
});

describe('describeClientLevel', () => {
  const words = ['Inicio', 'Base', 'Avanzado'] as const;

  it.each([
    ['beginner', 'Inicio'],
    ['intermediate', 'Base'],
    ['advanced', 'Avanzado'],
    [null, null],
  ] as const)('%s is %s', (level, expectedWord) => {
    expect(describeClientLevel(level, words)).toBe(expectedWord);
  });
});

describe('toStatusParam', () => {
  it('turns Todos into no filter and keeps the rest', () => {
    expect(toStatusParam('all')).toBeUndefined();
    expect(toStatusParam('inactive')).toBe('inactive');
  });
});
