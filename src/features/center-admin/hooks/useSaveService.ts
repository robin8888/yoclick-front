import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getServicesListQueryKey,
  servicesArchive,
  servicesCreate,
  servicesUpdate,
} from '@/shared/api/generated/endpoints/services/services';

import {
  mapFormToCreateRequest,
  mapFormToServiceChanges,
  type ServiceFormValues,
} from '../model/service-form';
import { useActiveCenterId } from './useActiveCenterId';

interface SaveService {
  saveService: (formValues: ServiceFormValues) => void;
  archiveService: () => void;
  isSaving: boolean;
  saveErrorMessage: string | null;
}

/**
 * Crea el servicio (sin `serviceId`) o modifica el existente. No es optimista: las reservas
 * dependen de él, así que se espera al servidor y se vuelve a pedir el catálogo.
 */
export function useSaveService(serviceId: string | null, onDone: () => void): SaveService {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: (formValues: ServiceFormValues) =>
      serviceId === null
        ? servicesCreate(centerId, mapFormToCreateRequest(formValues))
        : servicesUpdate(centerId, serviceId, mapFormToServiceChanges(formValues)),
  });
  const archiveMutation = useMutation({
    mutationFn: () => servicesArchive(centerId, serviceId ?? ''),
  });

  const finishAfterRefresh = (): void => {
    void queryClient
      .invalidateQueries({ queryKey: getServicesListQueryKey(centerId) })
      .then(onDone);
  };

  return {
    saveService: (formValues) => {
      saveMutation.mutate(formValues, { onSuccess: finishAfterRefresh });
    },
    archiveService: () => {
      archiveMutation.mutate(undefined, { onSuccess: finishAfterRefresh });
    },
    isSaving: saveMutation.isPending || archiveMutation.isPending,
    saveErrorMessage: getFirstErrorMessage([saveMutation.error, archiveMutation.error]),
  };
}

function getFirstErrorMessage(errors: readonly unknown[]): string | null {
  const failure = errors.find((error) => error !== null);
  return failure === undefined ? null : getApiErrorMessage(failure);
}
