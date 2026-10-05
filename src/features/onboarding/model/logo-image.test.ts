import { estimateDecodedBase64Bytes, isLogoSmallEnough, MAX_LOGO_BYTES } from './logo-image';

describe('estimateDecodedBase64Bytes', () => {
  it.each([
    ['', 0],
    ['QUJD', 3],
    ['QUI=', 2],
    ['QQ==', 1],
  ])('measures %j as %d bytes', (dataBase64, expectedBytes) => {
    expect(estimateDecodedBase64Bytes(dataBase64)).toBe(expectedBytes);
  });
});

describe('isLogoSmallEnough', () => {
  it('accepts a logo right at the limit and rejects one byte over', () => {
    const atLimit = 'A'.repeat((MAX_LOGO_BYTES / 3) * 4);

    expect(isLogoSmallEnough(atLimit)).toBe(true);
    expect(isLogoSmallEnough(`${atLimit}AAAA`)).toBe(false);
  });
});
