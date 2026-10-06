import { isAnyPathInside, isPathInside } from './is-path-active';

describe('isPathInside', () => {
  it.each([
    ['/book', '/book', true],
    ['/book/staff', '/book', true],
    ['/book/slot/extra', '/book', true],
    ['/bookings', '/book', false],
    ['/home', '/book', false],
    ['/', '/book', false],
  ])('%s inside %s: %s', (currentPath, pathPrefix, isExpectedInside) => {
    expect(isPathInside(currentPath, pathPrefix)).toBe(isExpectedInside);
  });
});

describe('isAnyPathInside', () => {
  it('matches when any of the prefixes does', () => {
    expect(isAnyPathInside('/centers', ['/profile', '/centers'])).toBe(true);
    expect(isAnyPathInside('/home', ['/profile', '/centers'])).toBe(false);
  });
});
