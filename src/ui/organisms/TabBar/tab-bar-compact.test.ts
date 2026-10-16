import { nextCompactValue } from './tab-bar-compact';

describe('nextCompactValue', () => {
  it.each([
    {
      caseName: 'scrolling down past the threshold shrinks',
      offsetY: 120,
      lastOffsetY: 60,
      current: 0,
      expected: 1,
    },
    {
      caseName: 'scrolling down near the top does not shrink',
      offsetY: 30,
      lastOffsetY: 10,
      current: 0,
      expected: 0,
    },
    {
      caseName: 'scrolling up restores the full width',
      offsetY: 80,
      lastOffsetY: 120,
      current: 1,
      expected: 0,
    },
    {
      caseName: 'a tiny finger tremor down changes nothing',
      offsetY: 122,
      lastOffsetY: 120,
      current: 1,
      expected: 1,
    },
    {
      caseName: 'a tiny finger tremor up changes nothing',
      offsetY: 118,
      lastOffsetY: 120,
      current: 1,
      expected: 1,
    },
  ])('$caseName', ({ offsetY, lastOffsetY, current, expected }) => {
    expect(nextCompactValue({ offsetY, lastOffsetY, current })).toBe(expected);
  });
});
