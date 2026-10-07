import { getApiErrorMessage } from '@/shared/api/errors';

import { buildOpeningHoursDraft, isOpeningHoursChanged } from '../model/opening-hours-draft';
import { useCenterSettings } from './useCenterSettings';
import { useOpeningHoursDraft, type OpeningHoursDraftEditing } from './useOpeningHoursDraft';
import { useSaveOpeningHours } from './useSaveOpeningHours';

interface OpeningHoursEditor extends OpeningHoursDraftEditing {
  isLoading: boolean;
  hasFailed: boolean;
  error: unknown;
  retry: () => void;
  canSave: boolean;
  isSaving: boolean;
  saveErrorMessage: string | null;
  save: () => void;
}

/**
 * El horario de apertura en edición: lo publicado más los cambios. Se guarda entero con `If-Match`,
 * así que si otra persona del equipo lo cambió antes, el servidor lo rechaza en lugar de pisarlo.
 */
export function useOpeningHoursEditor(): OpeningHoursEditor {
  const settings = useCenterSettings();
  const published = settings.data ? buildOpeningHoursDraft(settings.data.openingHours) : null;
  const editing = useOpeningHoursDraft(published);
  const { draft, daysWithProblems } = editing;
  const saveMutation = useSaveOpeningHours(settings.data?.version ?? '');

  return {
    ...editing,
    isLoading: settings.isPending,
    hasFailed: settings.isError,
    error: settings.error,
    retry: () => void settings.refetch(),
    canSave:
      draft !== null &&
      published !== null &&
      daysWithProblems.length === 0 &&
      isOpeningHoursChanged(draft, published),
    isSaving: saveMutation.isPending,
    saveErrorMessage: saveMutation.isError ? getApiErrorMessage(saveMutation.error) : null,
    save: () => {
      if (draft !== null) saveMutation.mutate(draft);
    },
  };
}
