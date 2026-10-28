import { findPreviousPlan, listNewFeatures, type PlanOffer } from './plan-offers';

function buildPlan(overrides: Partial<PlanOffer> = {}): PlanOffer {
  return {
    id: 'pro',
    name: 'Pro',
    monthlyPriceCents: 7900,
    annualMonthlyPriceCents: 6500,
    setupFeeCents: 0,
    maxClients: 500,
    documentStorageLimitBytes: 5_368_709_120,
    videoStorageLimitBytes: null,
    features: ['reports', 'routines'],
    isAvailable: true,
    ...overrides,
  };
}

describe('findPreviousPlan', () => {
  const basic = buildPlan({ id: 'basic', monthlyPriceCents: 3900, features: [] });
  const pro = buildPlan({ id: 'pro', monthlyPriceCents: 7900 });
  const premium = buildPlan({ id: 'premium', monthlyPriceCents: 14900 });

  it.each([
    { plan: basic, expected: undefined },
    { plan: pro, expected: basic },
    { plan: premium, expected: pro },
  ])('finds the plan just below $plan.id', ({ plan, expected }) => {
    expect(findPreviousPlan(plan, [premium, basic, pro])).toBe(expected);
  });
});

describe('listNewFeatures', () => {
  it('lists every feature when there is no plan below', () => {
    expect(listNewFeatures(buildPlan(), undefined)).toEqual(['reports', 'routines']);
  });

  it('lists only what the plan adds to the one below', () => {
    const premium = buildPlan({ features: ['reports', 'routines', 'videos'] });

    expect(listNewFeatures(premium, buildPlan())).toEqual(['videos']);
  });

  it('lists nothing when the plans give the same', () => {
    expect(listNewFeatures(buildPlan(), buildPlan())).toEqual([]);
  });
});
