import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  centersUpdateSettings,
  getCentersGetBrandingQueryKey,
  getCentersGetSettingsQueryKey,
} from '@/shared/api/generated/endpoints/centers/centers';
import { getMeListMembershipsQueryKey } from '@/shared/api/generated/endpoints/me/me';
import { onboardingUploadCenterLogo } from '@/shared/api/generated/endpoints/onboarding/onboarding';
import { useSessionStore } from '@/shared/auth/session-store';
import type { PickedLogo } from '@/features/onboarding';

import type { BrandPatch } from '../model/brand-draft';

interface BrandPublication {
  patch: BrandPatch | null;
  newLogo: PickedLogo | null;
  settingsVersion: string;
}

export interface PublishBrand {
  publish: (publication: BrandPublication) => void;
  isPublishing: boolean;
  hasPublished: boolean;
  errorMessage: string | null;
}

/**
 * Publica el nombre y el color y después el logo nuevo (si lo hay). `If-Match` evita pisar lo que
 * otra persona del equipo haya cambiado entretanto (el servidor responde 412).
 */
export function usePublishBrand(): PublishBrand {
  const queryClient = useQueryClient();
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const mutation = useMutation({
    mutationFn: async ({ patch, newLogo, settingsVersion }: BrandPublication) => {
      // Primero los ajustes: subir el logo también cambia la versión del centro y haría fallar `If-Match`.
      if (patch !== null) {
        await centersUpdateSettings(centerId, patch, { headers: { 'If-Match': settingsVersion } });
      }
      if (newLogo === null) return;
      await onboardingUploadCenterLogo(centerId, {
        contentType: newLogo.contentType,
        dataBase64: newLogo.dataBase64,
      });
    },
    onSuccess: async () => {
      // Los centros de la persona llevan nombre, color y logo: así la app entera se viste ya con la marca nueva.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getMeListMembershipsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getCentersGetSettingsQueryKey(centerId) }),
        queryClient.invalidateQueries({ queryKey: getCentersGetBrandingQueryKey(centerId) }),
      ]);
    },
  });

  return {
    publish: (publication) => {
      mutation.mutate(publication);
    },
    isPublishing: mutation.isPending,
    hasPublished: mutation.isSuccess,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
