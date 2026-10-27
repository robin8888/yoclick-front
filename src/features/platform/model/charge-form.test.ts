import {
  buildInitialChargeDraft,
  parseVatRateToBasisPoints,
  validateChargeDraft,
  type ChargeDraft,
} from './charge-form';

const TARGET = { centerId: '0198a8a0-0000-7000-8000-000000000001', chargedOn: '2026-10-15' };

function buildDraft(overrides: Partial<ChargeDraft> = {}): ChargeDraft {
  return {
    ...buildInitialChargeDraft({ concept: 'Plan Pro, octubre 2026', baseCents: 7900 }),
    ...overrides,
  };
}

describe('buildInitialChargeDraft', () => {
  it('prefills the base from the plan price and the VAT at 21 %', () => {
    expect(buildInitialChargeDraft({ concept: 'Plan Pro', baseCents: 7950 })).toMatchObject({
      baseAmount: '79,50',
      vatRate: '21',
      paymentMethod: 'transfer',
    });
  });

  it('leaves the base empty when the plan price is not known', () => {
    expect(buildInitialChargeDraft({ concept: 'Plan Pro', baseCents: null }).baseAmount).toBe('');
  });
});

describe('parseVatRateToBasisPoints', () => {
  it.each([
    { text: '21', expected: 2100 },
    { text: '10,5', expected: 1050 },
    { text: '4.5', expected: 450 },
    { text: ' 0 ', expected: 0 },
    { text: '100', expected: 10000 },
    { text: '101', expected: null },
    { text: '', expected: null },
    { text: '21%', expected: null },
    { text: 'veintiuno', expected: null },
    { text: '-5', expected: null },
  ])('reads "$text" as $expected', ({ text, expected }) => {
    expect(parseVatRateToBasisPoints(text)).toBe(expected);
  });
});

describe('validateChargeDraft', () => {
  it('builds the request in cents and basis points', () => {
    expect(validateChargeDraft(buildDraft(), TARGET)).toEqual({
      isValid: true,
      request: {
        ...TARGET,
        concept: 'Plan Pro, octubre 2026',
        baseCents: 7900,
        vatBasisPoints: 2100,
        paymentMethod: 'transfer',
      },
    });
  });

  it('sends the optional fiscal data only when it is filled in, trimmed', () => {
    const validation = validateChargeDraft(
      buildDraft({
        customerLegalName: ' Studio Norte S.L. ',
        customerTaxId: 'B12345678',
        invoiceReference: '   ',
      }),
      TARGET,
    );

    expect(validation).toMatchObject({
      isValid: true,
      request: { customerLegalName: 'Studio Norte S.L.', customerTaxId: 'B12345678' },
    });
    expect(validation.isValid && 'invoiceReference' in validation.request).toBe(false);
  });

  it.each([
    { overrides: { concept: '   ' }, error: 'concept' },
    { overrides: { baseAmount: '' }, error: 'baseAmount' },
    { overrides: { baseAmount: 'mucho' }, error: 'baseAmount' },
    { overrides: { vatRate: '150' }, error: 'vatRate' },
    { overrides: { vatRate: '' }, error: 'vatRate' },
  ] as const)('rejects $overrides with the error $error', ({ overrides, error }) => {
    expect(validateChargeDraft(buildDraft(overrides), TARGET)).toEqual({
      isValid: false,
      error,
    });
  });
});
