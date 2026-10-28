import type { PlanOffersResponseDtoPlansItem } from '@/shared/api/generated/model';

export type PlanOffer = PlanOffersResponseDtoPlansItem;
export type PlanFeature = PlanOffersResponseDtoPlansItem['features'][number];

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
