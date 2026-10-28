import {
  buildPriceLines,
  calculatePlanMonthlyRevenueCents,
  countAllCenters,
  countPayingCenters,
  getCenterPlanLabel,
} from './plan-labels';

describe('getCenterPlanLabel', () => {
  it.each([
    { status: 'trial', planId: 'pro', expected: 'En prueba' },
    { status: 'active', planId: 'pro', expected: 'Pro' },
    { status: 'past_due', planId: 'basic', expected: 'Básico' },
    { status: 'suspended', planId: 'premium', expected: 'Premium' },
  ] as const)('is "$expected" for a $status center on $planId', ({ status, planId, expected }) => {
    expect(getCenterPlanLabel({ status, planId })).toBe(expected);
  });
});

const COUNTS = { trial: 3, active: 2, past_due: 1, suspended: 4 };

describe('plan center counts', () => {
  it('counts as paying only the active and in-grace centers', () => {
    expect(countPayingCenters({ centerCountByStatus: COUNTS })).toBe(3);
  });

  it('counts every center whatever its state', () => {
    expect(countAllCenters({ centerCountByStatus: COUNTS })).toBe(10);
  });

  it('multiplies the monthly price by the paying centers', () => {
    expect(
      calculatePlanMonthlyRevenueCents({ monthlyPriceCents: 7900, centerCountByStatus: COUNTS }),
    ).toBe(23700);
  });
});

describe('buildPriceLines', () => {
  it('writes the monthly and annual prices', () => {
    const lines = buildPriceLines({
      monthlyPriceCents: 7900,
      annualMonthlyPriceCents: 6500,
      setupFeeCents: 0,
    });

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^Mensual 79/);
    expect(lines[1]).toMatch(/^Anual 65/);
  });

  it('adds the one-off setup fee when the plan has one', () => {
    const lines = buildPriceLines({
      monthlyPriceCents: 14900,
      annualMonthlyPriceCents: 12400,
      setupFeeCents: 29000,
    });

    expect(lines).toHaveLength(3);
    expect(lines[2]).toMatch(/^Alta 290/);
  });
});
