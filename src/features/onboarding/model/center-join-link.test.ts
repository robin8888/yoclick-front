import { buildCenterJoinLink } from './center-join-link';

describe('buildCenterJoinLink', () => {
  it.each([
    ['NORTE7', 'https://yoclick.app/j/NORTE7'],
    ['AB C', 'https://yoclick.app/j/AB%20C'],
  ])('turns %s into %s', (joinCode, expectedLink) => {
    expect(buildCenterJoinLink(joinCode)).toBe(expectedLink);
  });
});
