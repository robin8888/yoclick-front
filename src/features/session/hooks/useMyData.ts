import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getMeGetProfileQueryKey,
  getMeGetProfileQueryOptions,
  meUpdateProfile,
} from '@/shared/api/generated/endpoints/me/me';
import type { MyProfileResponseDto } from '@/shared/api/generated/model';

import type { MyDataPatch } from '../model/my-data-form';

/** Lo que el centro tiene de la persona: nombre, correo, teléfono, dirección y fecha de nacimiento. */
export function useMyProfileData(): UseQueryResult<MyProfileResponseDto, ErrorType> {
  return useQuery(getMeGetProfileQueryOptions());
}

interface SaveMyData {
  save: (patch: MyDataPatch) => void;
  isSaving: boolean;
  hasSaved: boolean;
  errorMessage: string | null;
}

/** Guarda el teléfono y la dirección; el perfil se vuelve a leer para que todas las pantallas lo vean. */
export function useSaveMyData(): SaveMyData {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (patch: MyDataPatch) => meUpdateProfile(patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getMeGetProfileQueryKey() }),
  });

  return {
    save: (patch) => {
      mutation.mutate(patch);
    },
    isSaving: mutation.isPending,
    hasSaved: mutation.isSuccess,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
