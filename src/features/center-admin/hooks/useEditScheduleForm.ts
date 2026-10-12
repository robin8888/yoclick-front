import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm, type Control, type UseFormSetValue } from 'react-hook-form';

import type { ScheduleSeriesWriteResponseDtoSkippedItem } from '@/shared/api/generated/model';

import {
  buildScheduleEditForm,
  hasScheduleChanges,
  mapScheduleEditToUpdateRequest,
  scheduleEditSchema,
  type ScheduleEditValues,
} from '../model/schedule-edit';
import type { ScheduleSeries } from '../model/schedule-summary';
import { useUpdateScheduleSeries } from './useUpdateScheduleSeries';

export interface EditScheduleForm {
  control: Control<ScheduleEditValues>;
  values: ScheduleEditValues;
  setValue: UseFormSetValue<ScheduleEditValues>;
  submit: () => void;
  isSaving: boolean;
  errorMessage: string | null;
  /** Sesiones futuras que el servidor no pudo rehacer; `null` hasta que se guarda. */
  skipped: ScheduleSeriesWriteResponseDtoSkippedItem[] | null;
  finish: () => void;
}

/** El formulario de edición de un horario: envía solo lo que cambia y, sin cambios, vuelve atrás. */
export function useEditScheduleForm(series: ScheduleSeries): EditScheduleForm {
  const router = useRouter();
  const update = useUpdateScheduleSeries(series.seriesId);
  const [skipped, setSkipped] = useState<ScheduleSeriesWriteResponseDtoSkippedItem[] | null>(null);
  const { control, handleSubmit, setValue, watch } = useForm<ScheduleEditValues>({
    resolver: zodResolver(scheduleEditSchema),
    defaultValues: buildScheduleEditForm(series),
  });

  return {
    control,
    values: watch(),
    setValue,
    submit: () => {
      void handleSubmit((formValues) => {
        const request = mapScheduleEditToUpdateRequest(formValues, series);
        if (!hasScheduleChanges(request)) {
          router.back();
          return;
        }
        update.updateSeries(request, (result) => {
          if (result.skipped.length === 0) router.back();
          else setSkipped(result.skipped);
        });
      })();
    },
    isSaving: update.isUpdating,
    errorMessage: update.errorMessage,
    skipped,
    finish: router.back,
  };
}
