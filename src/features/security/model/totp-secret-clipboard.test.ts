import { buildCopyableTotpSecret, shouldClearClipboard } from './totp-secret-clipboard';

describe('buildCopyableTotpSecret', () => {
  it.each([
    { secret: 'JBSWY3DPEHPK3PXP', expectedText: 'JBSWY3DPEHPK3PXP' },
    { secret: 'JBSW Y3DP EHPK 3PXP', expectedText: 'JBSWY3DPEHPK3PXP' },
    { secret: 'jbsw y3dp', expectedText: 'JBSWY3DP' },
  ])('turns «$secret» into «$expectedText»', ({ secret, expectedText }) => {
    expect(buildCopyableTotpSecret(secret)).toBe(expectedText);
  });
});

describe('shouldClearClipboard', () => {
  it.each([
    { clipboardText: 'JBSWY3DP', isCleared: true },
    { clipboardText: '', isCleared: false },
    { clipboardText: 'otra cosa que copió después', isCleared: false },
  ])('with «$clipboardText» in the clipboard clears: $isCleared', (testCase) => {
    expect(shouldClearClipboard(testCase.clipboardText, 'JBSWY3DP')).toBe(testCase.isCleared);
  });
});
