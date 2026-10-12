import type {
  EnrollResponseDto,
  ScheduleSeriesListResponseDtoSeriesItem,
  ScheduleSeriesWriteResponseDtoSkippedItem,
} from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatNumericDate } from '@/shared/lib/format';

import { describeWeekdayShort, toScheduleWeekday, type ScheduleWeekday } from './schedule-form';

export type ScheduleSeries = ScheduleSeriesListResponseDtoSeriesItem;
export type ScheduleSeriesDay = ScheduleSeries['days'][number];

/** Un horario visto desde uno de sus días: lo que se pinta en la semana. */
export interface SeriesOfDay {
  series: ScheduleSeries;
  day: ScheduleSeriesDay;
}

/** Los horarios que caen en ese día de la semana, por hora de inicio y nombre. */
export function listSeriesOfWeekday(
  seriesList: readonly ScheduleSeries[],
  weekday: ScheduleWeekday,
): SeriesOfDay[] {
  return seriesList
    .flatMap((series) =>
      series.days.filter((day) => day.weekday === weekday).map((day) => ({ series, day })),
    )
    .sort(
      (first, second) =>
        first.day.startsAtTime.localeCompare(second.day.startsAtTime) ||
        describeSeriesName(first.series).localeCompare(describeSeriesName(second.series)),
    );
}

function joinWithAnd(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  const lastName = names.at(-1) ?? '';
  return `${names.slice(0, -1).join(', ')} ${i18n.t('centerAdmin.schedules.and')} ${lastName}`;
}

/** «lun, mié y vie · 18:00–19:30». */
export function describeSeriesDays(series: ScheduleSeries): string {
  const sortedDays = [...series.days].sort((first, second) => first.weekday - second.weekday);
  const firstDay = sortedDays[0];
  if (firstDay === undefined) return '';
  const dayNames = sortedDays.map((day) => {
    const weekday = toScheduleWeekday(day.weekday);
    return weekday === null ? '' : describeWeekdayShort(weekday);
  });
  return `${joinWithAnd(dayNames)} · ${firstDay.startsAtTime}–${firstDay.endsAtTime}`;
}

/** «Inglés B1 – grupo de tarde» o, sin etiqueta, el nombre del servicio. */
export function describeSeriesName(series: Pick<ScheduleSeries, 'label' | 'service'>): string {
  return series.label ?? series.service.name;
}

/** «Aula 2 · Ana Ruiz · En grupo · 8 de 12 matriculados». */
export function describeSeriesPlace(series: ScheduleSeries): string {
  const modeLabel = i18n.t(
    series.mode === 'group'
      ? 'centerAdmin.schedules.modeGroup'
      : 'centerAdmin.schedules.modePrivate',
  );
  return [
    series.room?.name ?? i18n.t('centerAdmin.schedules.noRoom'),
    series.staff.fullName,
    modeLabel,
    i18n.t('centerAdmin.schedules.enrolledOfCapacity', {
      enrolled: series.enrolledCount,
      capacity: series.capacity,
    }),
  ].join(' · ');
}

/** «desde 12/10/2026» o «del 12/10/2026 al 20/12/2026». */
export function describeSeriesPeriod(series: Pick<ScheduleSeries, 'startsOn' | 'endsOn'>): string {
  const from = formatNumericDate(series.startsOn);
  if (series.endsOn === null) return i18n.t('centerAdmin.schedules.periodFrom', { from });
  return i18n.t('centerAdmin.schedules.periodRange', {
    from,
    to: formatNumericDate(series.endsOn),
  });
}

/** «25/10/2026 18:00 · cierre del centro»: una línea por sesión que no se pudo crear. */
export function summarizeSkippedOccurrences(
  skipped: readonly ScheduleSeriesWriteResponseDtoSkippedItem[],
): string[] {
  return skipped.map((occurrence) => {
    const reason = i18n.t(`centerAdmin.schedules.skippedReason.${occurrence.reason}`);
    return `${formatNumericDate(occurrence.date)} ${occurrence.startsAtTime} · ${reason}`;
  });
}

interface EnrollSummaryRequest {
  result: EnrollResponseDto;
  /** Nombre de cada persona elegida, para decir quién no ha entrado. */
  namesByMembershipId: Readonly<Record<string, string>>;
}

/** Cuántas personas han entrado, quién no y por qué, y cuántos días no entran por otra cita. */
export function summarizeEnrollResult({
  result,
  namesByMembershipId,
}: EnrollSummaryRequest): string[] {
  const lines = [
    i18n.t('centerAdmin.schedules.enrolledCount', { count: result.enrollments.length }),
    ...result.skipped.map((skippedPerson) =>
      i18n.t('centerAdmin.schedules.skippedPerson', {
        name: namesByMembershipId[skippedPerson.clientMembershipId] ?? '',
        reason: i18n.t(`centerAdmin.schedules.skippedPersonReason.${skippedPerson.reason}`),
      }),
    ),
  ];
  if (result.skippedDates.length > 0) {
    lines.push(i18n.t('centerAdmin.schedules.skippedDates', { count: result.skippedDates.length }));
  }
  return lines;
}
