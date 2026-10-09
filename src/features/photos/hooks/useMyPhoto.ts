import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getMeGetProfileQueryOptions,
  meRemovePhoto,
  meSetPhoto,
} from '@/shared/api/generated/endpoints/me/me';

import { PHOTO_UPLOAD_TIMEOUT_MS } from '../model/photo-image';

export interface MyPhoto {
  photoUrl: string | null;
  isBusy: boolean;
  errorMessage: string | null;
  upload: (photo: Blob) => void;
  remove: () => void;
}

/** Mi foto de perfil: es una por persona, la misma en todos sus centros. */
export function useMyPhoto(): MyPhoto {
  const queryClient = useQueryClient();
  const profile = useQuery(getMeGetProfileQueryOptions());
  // La foto sale en listas de equipo, de personas y de citas: se refresca todo lo que se está viendo.
  const refresh = (): Promise<void> => queryClient.invalidateQueries();
  const setMutation = useMutation({
    mutationFn: (photo: Blob) => meSetPhoto(photo, { timeoutMs: PHOTO_UPLOAD_TIMEOUT_MS }),
    onSuccess: refresh,
  });
  const removeMutation = useMutation({ mutationFn: () => meRemovePhoto(), onSuccess: refresh });
  const error = setMutation.error ?? removeMutation.error;

  return {
    photoUrl: profile.data?.photoUrl ?? null,
    isBusy: setMutation.isPending || removeMutation.isPending,
    errorMessage: error === null ? null : getApiErrorMessage(error),
    upload: (photo) => {
      setMutation.mutate(photo);
    },
    remove: () => {
      removeMutation.mutate();
    },
  };
}
