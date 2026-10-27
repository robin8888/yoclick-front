import { buildChargeAmountsLine, canChargeBeEdited, formatVatRate } from './charge-labels';
import type { PlatformCharge } from './charge-labels';

function buildCharge(overrides: Partial<PlatformCharge> = {}): PlatformCharge {
  return {
    id: '0198a8a0-0000-7000-8000-000000000001',
    centerId: '0198a8a0-0000-7000-8000-000000000002',
    centerName: 'Studio Norte',
    chargedOn: '2026-10-15',
    concept: 'Plan Pro',
    baseCents: 7900,
    vatBasisPoints: 2100,
    vatCents: 1659,
    totalCents: 9559,
    stripeFeeCents: null,
    status: 'paid',
    source: 'manual',
    paymentMethod: 'transfer',
    invoiceReference: null,
    stripeId: null,
    customerLegalName: null,
    customerTaxId: null,
    createdAt: '2026-10-15T10:00:00.000Z',
    ...overrides,
  };
}

describe('formatVatRate', () => {
  it.each([
    { vatBasisPoints: 2100, expected: '21' },
    { vatBasisPoints: 1050, expected: '10,5' },
    { vatBasisPoints: 0, expected: '0' },
  ])('writes $vatBasisPoints basis points as $expected', ({ vatBasisPoints, expected }) => {
    expect(formatVatRate(vatBasisPoints)).toBe(expected);
  });
});

describe('buildChargeAmountsLine', () => {
  it('shows the base, the VAT amount and the rate', () => {
    expect(buildChargeAmountsLine(buildCharge())).toMatch(/Base 79.*IVA 16,59.*\(21 %\)/);
  });
});

describe('canChargeBeEdited', () => {
  it.each([
    { status: 'pending', canEdit: true },
    { status: 'paid', canEdit: true },
    { status: 'void', canEdit: false },
  ] as const)('is $canEdit for a $status charge', ({ status, canEdit }) => {
    expect(canChargeBeEdited(status)).toBe(canEdit);
  });
});
