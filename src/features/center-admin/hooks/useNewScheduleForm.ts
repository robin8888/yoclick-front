import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm, type Control, type UseFormSetValue } from 'react-hook-form';

import type { ScheduleSeriesWriteResponseDtoSkippedItem } from '@/shared/api/generated/model';
import { getTodayIsoDate } from '@/shared/lib/format';

import {
  buildEmptyScheduleForm,
  mapScheduleFormToCreateRequest,
  scheduleFormSchema,
  type ScheduleFormValues,
} from '../model/schedule-form';
import { getDeviceTimeZone } from './useCenterTimeZone';
import { useCreateScheduleSeries } from './useCreateScheduleSeries';

export interface NewScheduleForm {
  control: Control<ScheduleFormValues>;
  values: ScheduleFormValues;
  setValue: UseFormSetValue<ScheduleFormValues>;
  submit: () => void;
  isSaving: boolean;
  errorMessage: string | null;
  clearError: () => void;
  /** Sesiones que el servidor no pudo crear; `null` hasta que se guarda. */
  skipped: ScheduleSeriesWriteResponseDtoSkippedItem[] | null;
  finish: () => void;
}

/** El formulario de un horario nuevo: al guardar vuelve atrás o enseña lo que no se pudo crear. */
export function useNewScheduleForm(presetRoomId?: string): NewScheduleForm {
  const router = useRouter();
  const creation = useCreateScheduleSeries();
  const [skipped, setSkipped] = useState<ScheduleSeriesWriteResponseDtoSkippedItem[] | null>(null);
  const { control, handleSubmit, setValue, watch } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: buildEmptyScheduleForm(
      getTodayIsoDate(new Date(), getDeviceTimeZone()),
      presetRoomId,
    ),
  });

  return {
    control,
    values: watch(),
    setValue,
    submit: () => {
      void handleSubmit((formValues) => {
        creation.createSeries(mapScheduleFormToCreateRequest(formValues), (result) => {
          if (result.skipped.length === 0) router.back();
          else setSkipped(result.skipped);
        });
      })();
    },
    isSaving: creation.isCreating,
    errorMessage: creation.errorMessage,
    clearError: creation.clearError,
    skipped,
    finish: router.back,
  };
}
