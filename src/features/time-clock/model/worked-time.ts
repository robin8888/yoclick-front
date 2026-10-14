import { i18n } from '@/shared/i18n';

const MINUTES_PER_HOUR = 60;

/** «7 h 30 min», «7 h» o «45 min»: las horas trabajadas como se dicen. */
export function formatWorkedMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  if (hours === 0) return i18n.t('timeClock.onlyMinutes', { minutes });
  if (minutes === 0) return i18n.t('timeClock.onlyHours', { hours });
  return i18n.t('timeClock.hoursMinutes', { hours, minutes });
}
