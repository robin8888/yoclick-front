import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { i18n } from '@/shared/i18n';
import { getTodayIsoDate } from '@/shared/lib/format';

import {
  buildInitialChargeDraft,
  validateChargeDraft,
  type ChargeDraft,
  type ChargeFieldError,
} from '../model/charge-form';
import { formatMonthLabel, getCurrentMonthKey } from '../model/charge-period';
import { getPlanName } from '../model/plan-labels';
import { usePlatformPlans } from './usePlatformPlans';
import { useRecordCharge } from './useRecordCharge';

const PLATFORM_TIME_ZONE = 'Europe/Madrid';

interface ChargeCenter {
  id: string;
  planId: Parameters<typeof getPlanName>[0];
}

interface ChargeForm {
  draft: ChargeDraft;
  error: ChargeFieldError | null;
  editField: <TField extends keyof ChargeDraft>(
    field: TField,
  ) => (value: ChargeDraft[TField]) => void;
  submit: () => void;
  isSubmitting: boolean;
  submitErrorMessage: string | null;
  clearSubmitError: () => void;
}

/** Concepto «Suscripción plan Pro · octubre de 2026» e importe mensual del plan, para corregir si hace falta. */
function buildSuggestedDraft(
  planId: ChargeCenter['planId'],
  planPriceCents: number | null,
): ChargeDraft {
  return buildInitialChargeDraft({
    concept: i18n.t('platform.charges.defaultConcept', {
      plan: getPlanName(planId),
      month: formatMonthLabel(getCurrentMonthKey(new Date())),
    }),
    baseCents: planPriceCents,
  });
}

/** El formulario para apuntar a mano el cobro de un centro: propone concepto e importe de su plan. */
export function useChargeForm(center: ChargeCenter, onRecorded: () => void): ChargeForm {
  const plans = usePlatformPlans();
  const planPriceCents =
    plans.data?.plans.find((plan) => plan.id === center.planId)?.monthlyPriceCents ?? null;
  // Lo escrito manda; lo demás se propone del plan, que puede llegar después de abrir la hoja.
  const [edits, setEdits] = useState<Partial<ChargeDraft>>({});
  const draft = { ...buildSuggestedDraft(center.planId, planPriceCents), ...edits };
  const [error, setError] = useState<ChargeFieldError | null>(null);
  const record = useRecordCharge();

  const submit = (): void => {
    const validation = validateChargeDraft(draft, {
      centerId: center.id,
      chargedOn: getTodayIsoDate(new Date(), PLATFORM_TIME_ZONE),
    });
    setError(validation.isValid ? null : validation.error);
    if (!validation.isValid) return;
    record.recordCharge(validation.request, () => {
      AccessibilityInfo.announceForAccessibility(i18n.t('platform.charges.recorded'));
      onRecorded();
    });
  };

  return {
    draft,
    error,
    editField: (field) => (value) => {
      setEdits({ ...edits, [field]: value });
      setError(null);
    },
    submit,
    isSubmitting: record.isRecording,
    submitErrorMessage: record.recordErrorMessage,
    clearSubmitError: record.clearError,
  };
}
