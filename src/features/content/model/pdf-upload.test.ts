import { buildDocumentTitle, isPdfTooLarge, MAX_PDF_SIZE_BYTES } from './pdf-upload';

describe('isPdfTooLarge', () => {
  it.each([
    ['one byte over', MAX_PDF_SIZE_BYTES + 1, true],
    ['exactly 50 MB', MAX_PDF_SIZE_BYTES, false],
    ['a small file', 1000, false],
  ])('says %s is too large: %s', (_name, sizeBytes, isTooLarge) => {
    expect(isPdfTooLarge(sizeBytes)).toBe(isTooLarge);
  });
});

describe('buildDocumentTitle', () => {
  it.each([
    ['Guía de calentamiento.pdf', 'Guía de calentamiento'],
    ['  Tema 5 · esquema.PDF ', 'Tema 5 · esquema'],
    ['sin-extension', 'sin-extension'],
    ['.pdf', '.pdf'],
    [`${'a'.repeat(200)}.pdf`, 'a'.repeat(120)],
  ])('turns the file name %j into the title %j', (fileName, expectedTitle) => {
    expect(buildDocumentTitle(fileName)).toBe(expectedTitle);
  });
});
