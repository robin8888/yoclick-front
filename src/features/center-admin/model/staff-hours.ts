import type { StaffAvailabilityResponseDto } from '@/shared/api/generated/model';

import { buildOpeningHoursDraft, type OpeningHoursDraft } from './opening-hours-draft';
import { WEEK_DAYS } from './opening-hours-summary';

const WORKING_DAYS = new Set(['mon', 'tue', 'wed', 'thu', 'fri']);

/**
 * Con qué horario empieza a editar alguien que aún sigue el del centro. El personal no puede leer los
 * ajustes del centro, así que se parte de una jornada normal y se ajusta.
 */
function buildTemplateHours(): OpeningHoursDraft {
  const entries = WEEK_DAYS.map((day) => [
    day,
    WORKING_DAYS.has(day) ? [{ opensAt: '09:00', closesAt: '17:00' }] : [],
  ]);
  return Object.fromEntries(entries) as OpeningHoursDraft;
}

export function buildStaffHoursDraft(
  weeklyHours: StaffAvailabilityResponseDto['weeklyHours'],
): OpeningHoursDraft {
  return weeklyHours === null ? buildTemplateHours() : buildOpeningHoursDraft(weeklyHours);
}
