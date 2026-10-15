import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, useWatch, type Control, type UseFormSetValue } from 'react-hook-form';

import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';

import {
  buildEmptyServiceForm,
  mapServiceToForm,
  serviceFormSchema,
  type ServiceFormValues,
} from '../model/service-form';
import { useAssignableStaff } from './useAssignableStaff';
import { useSaveService } from './useSaveService';

interface ServiceEditorForm {
  control: Control<ServiceFormValues>;
  assignableStaff: ReturnType<typeof useAssignableStaff>;
  setValue: UseFormSetValue<ServiceFormValues>;
  watchedDurationMinutes: string;
  submitService: () => void;
  archiveService: () => void;
  isSaving: boolean;
  saveErrorMessage: string | null;
}

/** Formulario de un servicio nuevo (`service` ausente) o de uno existente ya cargado. */
export function useServiceEditorForm(
  service: ServiceListResponseDtoServicesItem | undefined,
): ServiceEditorForm {
  const router = useRouter();
  const { control, setValue, handleSubmit } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    values: service === undefined ? buildEmptyServiceForm() : mapServiceToForm(service),
  });
  const assignableStaff = useAssignableStaff();
  const { saveService, archiveService, isSaving, saveErrorMessage } = useSaveService(
    service?.id ?? null,
    () => {
      router.back();
    },
  );

  return {
    control,
    assignableStaff,
    setValue,
    watchedDurationMinutes: useWatch({ control, name: 'durationMinutes' }),
    submitService: () => {
      void handleSubmit(saveService)();
    },
    archiveService,
    isSaving,
    saveErrorMessage,
  };
}
