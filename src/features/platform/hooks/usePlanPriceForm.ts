import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import type { PlatformPlanListResponseDtoPlansItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import {
  buildPlanPriceDraft,
  validatePlanPriceDraft,
  type PlanPriceDraft,
  type PlanPriceFieldError,
} from '../model/plan-price-form';
import { useUpdatePlanPrices } from './useUpdatePlanPrices';

interface PlanPriceForm {
  draft: PlanPriceDraft;
  error: PlanPriceFieldError | null;
  editField: (field: keyof PlanPriceDraft) => (text: string) => void;
  save: () => void;
  isSaving: boolean;
  saveErrorMessage: string | null;
  clearSaveError: () => void;
}

/** El formulario de precios de un plan: valida lo escrito y manda solo los importes que cambian. */
export function usePlanPriceForm(
  plan: PlatformPlanListResponseDtoPlansItem,
  onSaved: () => void,
): PlanPriceForm {
  const [draft, setDraft] = useState(() => buildPlanPriceDraft(plan));
  const [error, setError] = useState<PlanPriceFieldError | null>(null);
  const update = useUpdatePlanPrices();

  const save = (): void => {
    const validation = validatePlanPriceDraft(draft, plan);
    setError(validation.isValid ? null : validation.error);
    if (!validation.isValid) return;
    if (Object.keys(validation.changes).length === 0) {
      onSaved();
      return;
    }
    update.updatePrices(
      { planId: plan.id, changes: validation.changes },
      {
        onUpdated: () => {
          AccessibilityInfo.announceForAccessibility(i18n.t('platform.plans.saved'));
          onSaved();
        },
      },
    );
  };

  return {
    draft,
    error,
    editField: (field) => (text) => {
      setDraft({ ...draft, [field]: text });
      setError(null);
    },
    save,
    isSaving: update.isUpdating,
    saveErrorMessage: update.updateErrorMessage,
    clearSaveError: update.clearError,
  };
}
