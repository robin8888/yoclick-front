import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';

import {
  addRangeToDay,
  buildOpeningHoursDraft,
  findDaysWithProblems,
  isOpeningHoursChanged,
  removeRangeFromDay,
  setDayOpen,
  stepRangeTime,
  type OpeningHoursDraft,
  type TimeField,
} from '../model/opening-hours-draft';
import type { WeekDay } from '../model/opening-hours-summary';
import { useCenterSettings } from './useCenterSettings';
import { useSaveOpeningHours } from './useSaveOpeningHours';

interface TimeStepChange {
  rangeIndex: number;
  field: TimeField;
  direction: 1 | -1;
}

interface OpeningHoursEditor {
  isLoading: boolean;
  hasFailed: boolean;
  error: unknown;
  retry: () => void;
  draft: OpeningHoursDraft | null;
  daysWithProblems: readonly WeekDay[];
  canSave: boolean;
  isSaving: boolean;
  saveErrorMessage: string | null;
  changeDayOpen: (day: WeekDay, isOpen: boolean) => void;
  addRange: (day: WeekDay) => void;
  removeRange: (day: WeekDay, rangeIndex: number) => void;
  stepTime: (day: WeekDay, change: TimeStepChange) => void;
  save: () => void;
}

interface EditableDraft {
  draft: OpeningHoursDraft | null;
  change: (transform: (current: OpeningHoursDraft) => OpeningHoursDraft) => void;
}

/** Lo publicado más lo que se va cambiando, sin copiar el servidor a estado. */
function useEditableDraft(published: OpeningHoursDraft | null): EditableDraft {
  const [edited, setEdited] = useState<OpeningHoursDraft | null>(null);

  return {
    draft: edited ?? published,
    change: (transform) => {
      setEdited((current) => {
        const base = current ?? published;
        return base === null ? current : transform(base);
      });
    },
  };
}

/**
 * El horario de apertura en edición: lo publicado más los cambios. Se guarda entero con `If-Match`,
 * así que si otra persona del equipo lo cambió antes, el servidor lo rechaza en lugar de pisarlo.
 */
export function useOpeningHoursEditor(): OpeningHoursEditor {
  const settings = useCenterSettings();
  const published = settings.data ? buildOpeningHoursDraft(settings.data.openingHours) : null;
  const { draft, change } = useEditableDraft(published);
  const daysWithProblems = draft === null ? [] : findDaysWithProblems(draft);
  const saveMutation = useSaveOpeningHours(settings.data?.version ?? '');

  return {
    isLoading: settings.isPending,
    hasFailed: settings.isError,
    error: settings.error,
    retry: () => void settings.refetch(),
    draft,
    daysWithProblems,
    canSave:
      draft !== null &&
      published !== null &&
      daysWithProblems.length === 0 &&
      isOpeningHoursChanged(draft, published),
    isSaving: saveMutation.isPending,
    saveErrorMessage: saveMutation.isError ? getApiErrorMessage(saveMutation.error) : null,
    changeDayOpen: (day, isOpen) => {
      change((current) => setDayOpen(current, day, isOpen));
    },
    addRange: (day) => {
      change((current) => addRangeToDay(current, day));
    },
    removeRange: (day, rangeIndex) => {
      change((current) => removeRangeFromDay(current, day, rangeIndex));
    },
    stepTime: (day, { rangeIndex, field, direction }) => {
      change((current) => stepRangeTime({ draft: current, day, rangeIndex, field, direction }));
    },
    save: () => {
      if (draft !== null) saveMutation.mutate(draft);
    },
  };
}
