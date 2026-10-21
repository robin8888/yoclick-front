import { useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import type {
  PlatformCenterDetailResponseDto,
  UpdatePlatformCenterRequestDto,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { extendTrialEnd } from '../model/trial-extension';
import { useUpdatePlatformCenter } from './useUpdatePlatformCenter';

const WEEK_DAYS = 7;
const TWO_WEEKS_DAYS = 14;

export type CenterActionKind =
  'extendWeek' | 'extendTwoWeeks' | 'suspend' | 'reactivate' | 'markActive';

const TRIAL_DAYS: Readonly<Partial<Record<CenterActionKind, number>>> = {
  extendWeek: WEEK_DAYS,
  extendTwoWeeks: TWO_WEEKS_DAYS,
};

const STATUS_BY_ACTION: Readonly<Partial<Record<CenterActionKind, 'suspended' | 'active'>>> = {
  suspend: 'suspended',
  reactivate: 'active',
  markActive: 'active',
};

/** Lo que se envía a la API para cada acción; ampliar la prueba suma días al fin actual (o a hoy). */
export function buildActionChanges(
  action: CenterActionKind,
  center: Pick<PlatformCenterDetailResponseDto, 'trialEndsAt'>,
  now: Date,
): UpdatePlatformCenterRequestDto {
  const days = TRIAL_DAYS[action];
  if (days !== undefined) {
    return { trialEndsAt: extendTrialEnd({ currentTrialEndsAt: center.trialEndsAt, now, days }) };
  }
  const status = STATUS_BY_ACTION[action];
  return status === undefined ? {} : { status };
}

interface CenterActions {
  /** La acción que espera confirmación; `null` si no hay ninguna. */
  pendingAction: CenterActionKind | null;
  requestAction: (action: CenterActionKind) => void;
  cancelAction: () => void;
  confirmAction: () => void;
  saveClientCap: (maxClients: number | null) => void;
  isUpdating: boolean;
  updateErrorMessage: string | null;
  clearError: () => void;
}

/** Las acciones de la plataforma sobre un centro: se piden, se confirman y se esperan al servidor. */
export function useCenterActions(center: PlatformCenterDetailResponseDto): CenterActions {
  const [pendingAction, setPendingAction] = useState<CenterActionKind | null>(null);
  const update = useUpdatePlatformCenter(center.id);
  const announceSaved = (): void => {
    AccessibilityInfo.announceForAccessibility(i18n.t('platform.center.saved'));
  };

  return {
    pendingAction,
    requestAction: setPendingAction,
    cancelAction: () => {
      setPendingAction(null);
    },
    confirmAction: () => {
      if (pendingAction === null) return;
      update.updateCenter(buildActionChanges(pendingAction, center, new Date()), {
        onUpdated: () => {
          setPendingAction(null);
          announceSaved();
        },
        // El aviso de error va solo: no se deja la confirmación abierta debajo.
        onFailed: () => {
          setPendingAction(null);
        },
      });
    },
    saveClientCap: (maxClients) => {
      update.updateCenter({ maxClients }, { onUpdated: announceSaved });
    },
    isUpdating: update.isUpdating,
    updateErrorMessage: update.updateErrorMessage,
    clearError: update.clearError,
  };
}
