import type { PlatformPlanListResponseDtoPlansItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatEuros } from '@/shared/lib/format';

export type PlanId = PlatformPlanListResponseDtoPlansItem['id'];

export const PLAN_IDS: readonly PlanId[] = ['basic', 'pro', 'premium'];

export function getPlanName(planId: PlanId): string {
  return i18n.t(`platform.plans.names.${planId}`);
}

/**
 * El plan que tiene el centro hoy. Durante la prueba el centro lleva un plan asignado pero aún no lo ha
 * contratado, así que se dice «En prueba» en vez de un plan que no paga.
 */
export function getCenterPlanLabel(center: {
  status: 'trial' | 'active' | 'past_due' | 'suspended';
  planId: PlanId;
}): string {
  return center.status === 'trial' ? i18n.t('platform.plans.inTrial') : getPlanName(center.planId);
}

/** Los centros que pagan hoy: activos y en gracia. La prueba y los suspendidos no cuentan. */
export function countPayingCenters(
  plan: Pick<PlatformPlanListResponseDtoPlansItem, 'centerCountByStatus'>,
): number {
  return plan.centerCountByStatus.active + plan.centerCountByStatus.past_due;
}

export function countAllCenters(
  plan: Pick<PlatformPlanListResponseDtoPlansItem, 'centerCountByStatus'>,
): number {
  const { trial, active, past_due: pastDue, suspended } = plan.centerCountByStatus;
  return trial + active + pastDue + suspended;
}

/** Lo que aporta el plan al mes: su precio mensual por los centros que pagan. */
export function calculatePlanMonthlyRevenueCents(
  plan: Pick<PlatformPlanListResponseDtoPlansItem, 'monthlyPriceCents' | 'centerCountByStatus'>,
): number {
  return plan.monthlyPriceCents * countPayingCenters(plan);
}

/** «Mensual 79 €», «Anual 65 € al mes» y, si la hay, «Alta 290 € (una vez)». */
export function buildPriceLines(
  plan: Pick<
    PlatformPlanListResponseDtoPlansItem,
    'monthlyPriceCents' | 'annualMonthlyPriceCents' | 'setupFeeCents'
  >,
): string[] {
  const lines = [
    i18n.t('platform.plans.monthlyPrice', { price: formatEuros(plan.monthlyPriceCents) }),
    i18n.t('platform.plans.annualPrice', { price: formatEuros(plan.annualMonthlyPriceCents) }),
  ];
  if (plan.setupFeeCents > 0) {
    lines.push(i18n.t('platform.plans.setupFee', { price: formatEuros(plan.setupFeeCents) }));
  }
  return lines;
}
