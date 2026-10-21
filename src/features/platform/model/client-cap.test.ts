import { formatClientCapForInput, parseClientCap } from './client-cap';

describe('parseClientCap', () => {
  it.each([
    { text: '', expected: { isValid: true, value: null } },
    { text: '   ', expected: { isValid: true, value: null } },
    { text: '150', expected: { isValid: true, value: 150 } },
    { text: ' 0 ', expected: { isValid: true, value: 0 } },
    { text: '1000000', expected: { isValid: true, value: 1_000_000 } },
    { text: '1000001', expected: { isValid: false } },
    { text: '-5', expected: { isValid: false } },
    { text: '12,5', expected: { isValid: false } },
    { text: 'muchos', expected: { isValid: false } },
  ])('reads "$text"', ({ text, expected }) => {
    expect(parseClientCap(text)).toEqual(expected);
  });
});

describe('formatClientCapForInput', () => {
  it('leaves the field empty when there is no cap', () => {
    expect(formatClientCapForInput(null)).toBe('');
    expect(formatClientCapForInput(150)).toBe('150');
  });
});
