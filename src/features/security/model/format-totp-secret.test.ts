import { formatTotpSecret } from './format-totp-secret';

describe('formatTotpSecret', () => {
  it.each([
    ['JBSWY3DPEHPK3PXP', 'JBSW Y3DP EHPK 3PXP'],
    ['jbswy3dpehpk3pxp', 'JBSW Y3DP EHPK 3PXP'],
    ['JBSW Y3DP EHPK', 'JBSW Y3DP EHPK'],
    ['ABCDEF', 'ABCD EF'],
    ['', ''],
  ])('formats %j as %j', (secret, expectedText) => {
    expect(formatTotpSecret(secret)).toBe(expectedText);
  });
});
