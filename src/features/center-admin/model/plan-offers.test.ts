import {
  calculateAnnualSavingsPercent,
  canChoosePlan,
  getAnnualChargeCents,
  getBestAnnualSavingsPercent,
  findPreviousPlan,
  getMonthlyPriceCents,
  listNewFeatures,
  type PlanOffer,
} from './plan-offers';

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

describe('getMonthlyPriceCents', () => {
  it.each([
    { period: 'monthly', expected: 7900 },
    { period: 'annual', expected: 6500 },
  ] as const)('is $expected a month when paying $period', ({ period, expected }) => {
    expect(getMonthlyPriceCents(buildPlan(), period)).toBe(expected);
  });
});

describe('getAnnualChargeCents', () => {
  it('is the annual monthly price times twelve', () => {
    expect(getAnnualChargeCents(buildPlan())).toBe(78000);
  });
});

describe('calculateAnnualSavingsPercent', () => {
  it.each([
    { monthlyPriceCents: 7900, annualMonthlyPriceCents: 6500, expected: 18 },
    { monthlyPriceCents: 3900, annualMonthlyPriceCents: 3200, expected: 18 },
    { monthlyPriceCents: 14900, annualMonthlyPriceCents: 12400, expected: 17 },
    { monthlyPriceCents: 7900, annualMonthlyPriceCents: 7900, expected: 0 },
    { monthlyPriceCents: 0, annualMonthlyPriceCents: 0, expected: 0 },
  ])(
    'saves $expected % with $monthlyPriceCents monthly and $annualMonthlyPriceCents annual',
    ({ monthlyPriceCents, annualMonthlyPriceCents, expected }) => {
      const plan = buildPlan({ monthlyPriceCents, annualMonthlyPriceCents });

      expect(calculateAnnualSavingsPercent(plan)).toBe(expected);
    },
  );
});

describe('getBestAnnualSavingsPercent', () => {
  it('is the biggest saving among the plans', () => {
    const plans = [
      buildPlan({ monthlyPriceCents: 3900, annualMonthlyPriceCents: 3200 }),
      buildPlan({ monthlyPriceCents: 14900, annualMonthlyPriceCents: 12400 }),
    ];

    expect(getBestAnnualSavingsPercent(plans)).toBe(18);
  });

  it('is zero with no plans', () => {
    expect(getBestAnnualSavingsPercent([])).toBe(0);
  });
});

describe('canChoosePlan', () => {
  const trial = {
    currentPlanId: 'pro',
    currentPeriod: null,
    hasActiveSubscription: false,
  } as const;

  it.each([
    { name: 'a plan on trial', input: { ...trial, period: 'monthly' }, canChoose: true },
    {
      name: 'the trial plan, which nobody pays yet',
      input: { ...trial, period: 'annual' },
      canChoose: true,
    },
    {
      name: 'the plan and period already paid',
      input: {
        currentPlanId: 'pro',
        currentPeriod: 'monthly',
        hasActiveSubscription: false,
        period: 'monthly',
      },
      canChoose: false,
    },
    {
      name: 'the paid plan in the other period',
      input: {
        currentPlanId: 'pro',
        currentPeriod: 'monthly',
        hasActiveSubscription: false,
        period: 'annual',
      },
      canChoose: true,
    },
    {
      name: 'anything while a subscription is active',
      input: { ...trial, hasActiveSubscription: true, period: 'monthly' },
      canChoose: false,
    },
  ] as const)('is $canChoose for $name', ({ input, canChoose }) => {
    expect(canChoosePlan({ plan: buildPlan({ id: 'pro' }), ...input })).toBe(canChoose);
  });

  it('is false for a plan that is not in Stripe yet', () => {
    expect(
      canChoosePlan({ plan: buildPlan({ isAvailable: false }), period: 'monthly', ...trial }),
    ).toBe(false);
  });
});

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
