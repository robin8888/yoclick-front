import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getMeListMembershipsQueryKey } from '@/shared/api/generated/endpoints/me/me';
import { useOnboardingUploadCenterLogo } from '@/shared/api/generated/endpoints/onboarding/onboarding';

import type { PickedLogo } from './usePickCenterLogo';

interface UploadCenterLogo {
  uploadLogo: (logo: PickedLogo) => void;
  isUploading: boolean;
  uploadErrorMessage: string | null;
}

/** Sube el logo elegido al centro recién creado y sigue a la pantalla final. */
export function useUploadCenterLogo(centerId: string): UploadCenterLogo {
  const router = useRouter();
  const queryClient = useQueryClient();
  const uploadMutation = useOnboardingUploadCenterLogo();

  function uploadLogo(logo: PickedLogo): void {
    uploadMutation.mutate(
      { centerId, data: { contentType: logo.contentType, dataBase64: logo.dataBase64 } },
      {
        onSuccess: () => {
          // Los centros de la persona llevan el logo: se vuelven a pedir para que se vea ya.
          void queryClient
            .invalidateQueries({ queryKey: getMeListMembershipsQueryKey() })
            .then(() => {
              router.replace('/(onboarding)/done');
            });
        },
      },
    );
  }

  return {
    uploadLogo,
    isUploading: uploadMutation.isPending,
    uploadErrorMessage: uploadMutation.isError ? getApiErrorMessage(uploadMutation.error) : null,
  };
}
