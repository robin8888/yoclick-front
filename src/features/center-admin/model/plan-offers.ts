import type {
  CheckoutRequestDtoPeriod,
  PlanOffersResponseDtoPlansItem,
} from '@/shared/api/generated/model';

export type BillingPeriod = CheckoutRequestDtoPeriod;
export type PlanOffer = PlanOffersResponseDtoPlansItem;
export type PlanFeature = PlanOffersResponseDtoPlansItem['features'][number];

const MONTHS_PER_YEAR = 12;
const PERCENT = 100;

/** Lo que se paga cada mes con esa periodicidad (pagando el año entero sale más barato al mes). */
export function getMonthlyPriceCents(plan: PlanOffer, period: BillingPeriod): number {
  return period === 'annual' ? plan.annualMonthlyPriceCents : plan.monthlyPriceCents;
}

/** El cargo del año entero: el precio anual por mes, por doce. */
export function getAnnualChargeCents(plan: PlanOffer): number {
  return plan.annualMonthlyPriceCents * MONTHS_PER_YEAR;
}

/** Cuánto se ahorra al pagar el año entero frente a pagarlo mes a mes, en porcentaje entero. */
export function calculateAnnualSavingsPercent(plan: PlanOffer): number {
  if (plan.monthlyPriceCents <= 0) return 0;
  return Math.round((1 - plan.annualMonthlyPriceCents / plan.monthlyPriceCents) * PERCENT);
}

/** El mayor ahorro anual de la oferta, para anunciarlo en el selector de periodicidad. */
export function getBestAnnualSavingsPercent(plans: readonly PlanOffer[]): number {
  return Math.max(0, ...plans.map(calculateAnnualSavingsPercent));
}

/** Un plan se puede contratar si ya existe en Stripe y no es el que el centro paga con ese periodo. */
export function canChoosePlan(input: {
  plan: PlanOffer;
  period: BillingPeriod;
  currentPlanId: string;
  currentPeriod: BillingPeriod | null;
  hasActiveSubscription: boolean;
}): boolean {
  if (!input.plan.isAvailable || input.hasActiveSubscription) return false;
  return input.plan.id !== input.currentPlanId || input.period !== input.currentPeriod;
}

/** El plan justo por debajo en precio: el que este plan mejora. `undefined` para el más barato. */
export function findPreviousPlan(
  plan: PlanOffer,
  plans: readonly PlanOffer[],
): PlanOffer | undefined {
  return plans
    .filter((candidate) => candidate.monthlyPriceCents < plan.monthlyPriceCents)
    .sort((first, second) => second.monthlyPriceCents - first.monthlyPriceCents)[0];
}

/** Las funciones que un plan suma a las del plan de debajo (todas, si no hay plan de debajo). */
export function listNewFeatures(
  plan: PlanOffer,
  previousPlan: PlanOffer | undefined,
): PlanFeature[] {
  const alreadyIncluded = new Set<PlanFeature>(previousPlan?.features ?? []);
  return plan.features.filter((feature) => !alreadyIncluded.has(feature));
}
