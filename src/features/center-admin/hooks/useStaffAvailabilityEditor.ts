import { isOpeningHoursChanged, type OpeningHoursDraft } from '../model/opening-hours-draft';
import { buildStaffHoursDraft } from '../model/staff-hours';
import { useOpeningHoursDraft, type OpeningHoursDraftEditing } from './useOpeningHoursDraft';
import { useStaffAvailabilityActions, useStaffAvailabilityQuery } from './useStaffAvailability';

interface StaffAvailabilityEditor {
  availability: ReturnType<typeof useStaffAvailabilityQuery>;
  actions: ReturnType<typeof useStaffAvailabilityActions>;
  editing: OpeningHoursDraftEditing;
  draft: OpeningHoursDraft | null;
  hasOwnHours: boolean;
  canSave: boolean;
  saveHours: () => void;
  resetToCenterHours: () => void;
}

/** El horario propio en edición y las ausencias de una persona del equipo. */
export function useStaffAvailabilityEditor(membershipId: string): StaffAvailabilityEditor {
  const availability = useStaffAvailabilityQuery(membershipId);
  const actions = useStaffAvailabilityActions(membershipId);
  const published = availability.data ? buildStaffHoursDraft(availability.data.weeklyHours) : null;
  const editing = useOpeningHoursDraft(published);
  const { draft } = editing;
  const hasOwnHours = availability.data?.weeklyHours != null;
  const hasChanges =
    draft !== null && published !== null && isOpeningHoursChanged(draft, published);

  return {
    availability,
    actions,
    editing,
    draft,
    hasOwnHours,
    // Sin horario propio, guardar la plantilla tal cual ya es una decisión: crea el horario propio.
    canSave: (hasChanges || !hasOwnHours) && editing.daysWithProblems.length === 0,
    saveHours: () => {
      if (draft !== null) actions.saveWeeklyHours(draft);
    },
    resetToCenterHours: () => {
      actions.saveWeeklyHours(null);
      editing.discardChanges();
    },
  };
}
