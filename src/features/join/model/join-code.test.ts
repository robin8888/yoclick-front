import { isJoinCodeWellFormed, normalizeJoinCode } from './join-code';

describe('normalizeJoinCode', () => {
  it.each([
    ['norte7', 'NORTE7'],
    [' NORTE 7 ', 'NORTE7'],
    ['forja2', 'FORJA2'],
    ['', ''],
  ])('turns %j into %j', (rawCode, expectedCode) => {
    expect(normalizeJoinCode(rawCode)).toBe(expectedCode);
  });
});

describe('isJoinCodeWellFormed', () => {
  it.each([
    ['NORTE7', true],
    ['norte7', true],
    ['KINE24', true],
    ['ABC', false],
    ['ABCDEFGHIJKLMNOPQ', false],
    ['NORTE-7', false],
    ['NORTÉ7', false],
    ['', false],
  ])('%j is well formed: %s', (rawCode, isExpected) => {
    expect(isJoinCodeWellFormed(rawCode)).toBe(isExpected);
  });
});
