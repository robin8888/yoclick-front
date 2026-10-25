import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { i18n } from '@/shared/i18n';

import type { PlanId } from '../model/plan-labels';
import { useUpdatePlatformCenter } from './useUpdatePlatformCenter';

interface CenterPlanChange {
  /** El plan que espera confirmación; `null` si no hay ninguno. */
  pendingPlanId: PlanId | null;
  requestPlan: (planId: PlanId) => void;
  cancelPlan: () => void;
  confirmPlan: () => void;
  isUpdating: boolean;
  updateErrorMessage: string | null;
  clearError: () => void;
}

/** Pasar un centro a otro plan: se pide, se confirma y se espera al servidor, que le aplica los límites del plan. */
export function useCenterPlanChange(centerId: string): CenterPlanChange {
  const [pendingPlanId, setPendingPlanId] = useState<PlanId | null>(null);
  const update = useUpdatePlatformCenter(centerId);

  return {
    pendingPlanId,
    requestPlan: setPendingPlanId,
    cancelPlan: () => {
      setPendingPlanId(null);
    },
    confirmPlan: () => {
      if (pendingPlanId === null) return;
      update.updateCenter(
        { planId: pendingPlanId },
        {
          onUpdated: () => {
            setPendingPlanId(null);
            AccessibilityInfo.announceForAccessibility(i18n.t('platform.center.saved'));
          },
          onFailed: () => {
            setPendingPlanId(null);
          },
        },
      );
    },
    isUpdating: update.isUpdating,
    updateErrorMessage: update.updateErrorMessage,
    clearError: update.clearError,
  };
}
