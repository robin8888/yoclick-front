import { formatWorkedMinutes } from './worked-time';

describe('formatWorkedMinutes', () => {
  it.each([
    { totalMinutes: 0, expected: '0 min' },
    { totalMinutes: 45, expected: '45 min' },
    { totalMinutes: 60, expected: '1 h' },
    { totalMinutes: 450, expected: '7 h 30 min' },
    { totalMinutes: 61, expected: '1 h 1 min' },
  ])('writes $totalMinutes minutes as $expected', ({ totalMinutes, expected }) => {
    expect(formatWorkedMinutes(totalMinutes)).toBe(expected);
  });
});
