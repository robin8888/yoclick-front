import {
  buildPlanPriceDraft,
  formatCentsForInput,
  parseEurosToCents,
  validatePlanPriceDraft,
} from './plan-price-form';

const CURRENT = { monthlyPriceCents: 7900, annualMonthlyPriceCents: 6500, setupFeeCents: 0 };

describe('parseEurosToCents', () => {
  it.each([
    ['79', 7900],
    ['79,5', 7950],
    ['79.50', 7950],
    [' 149 ', 14900],
    ['0', 0],
    ['0,99', 99],
    ['10000', 1_000_000],
    ['10000,01', null],
    ['', null],
    ['abc', null],
    ['-5', null],
    ['79,555', null],
    ['7 9', null],
  ])('"%s" is %s cents', (text, expectedCents) => {
    expect(parseEurosToCents(text)).toBe(expectedCents);
  });
});

describe('formatCentsForInput', () => {
  it.each([
    [7900, '79'],
    [7950, '79,50'],
    [99, '0,99'],
    [0, '0'],
  ])('%i cents are written %s', (cents, expectedText) => {
    expect(formatCentsForInput(cents)).toBe(expectedText);
  });
});

describe('validatePlanPriceDraft', () => {
  it('returns only the prices that changed', () => {
    const draft = { ...buildPlanPriceDraft(CURRENT), monthly: '89', setupFee: '290' };

    expect(validatePlanPriceDraft(draft, CURRENT)).toEqual({
      isValid: true,
      changes: { monthlyPriceCents: 8900, setupFeeCents: 29000 },
    });
  });

  it('is valid with no changes, and says so with an empty change set', () => {
    expect(validatePlanPriceDraft(buildPlanPriceDraft(CURRENT), CURRENT)).toEqual({
      isValid: true,
      changes: {},
    });
  });

  it('rejects an amount that is not a price', () => {
    const draft = { ...buildPlanPriceDraft(CURRENT), monthly: 'mucho' };

    expect(validatePlanPriceDraft(draft, CURRENT)).toEqual({ isValid: false, error: 'invalid' });
  });

  it('rejects an annual price per month above the monthly one', () => {
    const draft = { ...buildPlanPriceDraft(CURRENT), annualMonthly: '80' };

    expect(validatePlanPriceDraft(draft, CURRENT)).toEqual({
      isValid: false,
      error: 'annualAboveMonthly',
    });
  });
});
