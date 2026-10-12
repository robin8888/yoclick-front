import { calculateRevealOffset, REVEAL_MARGIN } from './keyboard-reveal';

describe('calculateRevealOffset', () => {
  it.each([
    ['a field well above the keyboard', { inputBottomY: 300, keyboardTopY: 500 }, 0],
    [
      'a field just above the keyboard, inside the margin',
      { inputBottomY: 490, keyboardTopY: 500 },
      REVEAL_MARGIN - 10,
    ],
    ['a field under the keyboard', { inputBottomY: 700, keyboardTopY: 500 }, 200 + REVEAL_MARGIN],
  ])('scrolls the right amount for %s', (_caseName, request, expected) => {
    expect(calculateRevealOffset(request)).toBe(expected);
  });
});
