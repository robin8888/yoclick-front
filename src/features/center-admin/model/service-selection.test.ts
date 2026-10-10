import { haveSameServices, toggleServiceSelection } from './service-selection';

describe('toggleServiceSelection', () => {
  it('adds a service', () => {
    expect(toggleServiceSelection(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes a service already chosen', () => {
    expect(toggleServiceSelection(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('haveSameServices', () => {
  it.each([
    ['the same services in another order', { first: ['a', 'b'], second: ['b', 'a'] }, true],
    ['one more service', { first: ['a'], second: ['a', 'b'] }, false],
    ['a different service', { first: ['a'], second: ['c'] }, false],
    ['none and none', { first: [], second: [] }, true],
  ])('%s', (_caseName, { first, second }, areTheSame) => {
    expect(haveSameServices(first, second)).toBe(areTheSame);
  });
});
