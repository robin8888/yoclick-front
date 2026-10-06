import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm, useWatch, type Control, type UseFormSetValue } from 'react-hook-form';

import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

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
  const { control, setValue, handleSubmit, getValues, setError } = useForm<ServiceFormValues>({
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
      // Al editar, un servicio sin nadie que lo dé no tendría horas que reservar. Al crear, el
      // servidor lo asigna a quien lo crea, así que no se exige.
      const hasNobodyChosen = getValues('staffMembershipIds').length === 0;
      if (service !== undefined && assignableStaff.members.length > 0 && hasNobodyChosen) {
        setError('staffMembershipIds', {
          message: i18n.t('centerAdmin.serviceEditor.staffRequired'),
        });
        return;
      }
      void handleSubmit(saveService)();
    },
    archiveService,
    isSaving,
    saveErrorMessage,
  };
}
