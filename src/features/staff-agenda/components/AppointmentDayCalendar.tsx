import { useState } from 'react';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import { buildCalendarLabels } from '@/shared/i18n/calendar-labels';
import { CalendarGrid, readMonthOfIsoDate } from '@/ui/molecules/CalendarGrid';

import { getTodayIsoDate } from '../model/agenda-date';

interface AppointmentDayCalendarProps {
  /** El día elegido, `AAAA-MM-DD`. */
  selectedIsoDate: string;
  onDateSelect: (isoDate: string) => void;
  /** Si se indica, solo esos días se pueden elegir (los que tienen clase con plazas). */
  enabledDates?: ReadonlySet<string> | undefined;
}

const FALLBACK_MONTH = { year: 2026, month: 1 };

/** El mes en rejilla, como el calendario del iPhone, para elegir el día de la cita. */
export function AppointmentDayCalendar({
  selectedIsoDate,
  onDateSelect,
  enabledDates,
}: Readonly<AppointmentDayCalendarProps>): React.JSX.Element {
  const [visibleMonth, setVisibleMonth] = useState(
    () => readMonthOfIsoDate(selectedIsoDate) ?? FALLBACK_MONTH,
  );
  const [todayIsoDate] = useState(() => getTodayIsoDate(new Date(), DEFAULT_CENTER_TIME_ZONE));

  return (
    <CalendarGrid
      visibleMonth={visibleMonth}
      onVisibleMonthChange={setVisibleMonth}
      selectedDate={selectedIsoDate}
      todayDate={todayIsoDate}
      minDate={todayIsoDate}
      enabledDates={enabledDates}
      onDateSelect={onDateSelect}
      labels={buildCalendarLabels(visibleMonth)}
    />
  );
}
