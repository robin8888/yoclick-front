import { isSearchQueryReady } from './search-query';

describe('isSearchQueryReady', () => {
  it.each([
    ['', false],
    ['a', false],
    [' a ', false],
    ['ma', true],
    ['  Madrid ', true],
  ])('%j is ready: %s', (searchQuery, isExpected) => {
    expect(isSearchQueryReady(searchQuery)).toBe(isExpected);
  });
});
