import { useState } from 'react';

import { buildCalendarLabels } from '@/shared/i18n/calendar-labels';
import { CalendarGrid, readMonthOfIsoDate } from '@/ui/molecules/CalendarGrid';

interface ClassDayCalendarProps {
  /** Los días con alguna clase con plazas: los únicos que se pueden elegir. */
  enabledDates: ReadonlySet<string>;
  selectedIsoDate: string | null;
  /** Hoy, `AAAA-MM-DD`. */
  todayIsoDate: string;
  onDaySelect: (isoDate: string) => void;
}

const FALLBACK_MONTH = { year: 2026, month: 1 };

/** El mes en rejilla, como el calendario del iPhone: solo se pueden pulsar los días con clase. */
export function ClassDayCalendar({
  enabledDates,
  selectedIsoDate,
  todayIsoDate,
  onDaySelect,
}: Readonly<ClassDayCalendarProps>): React.JSX.Element {
  const [visibleMonth, setVisibleMonth] = useState(
    () =>
      readMonthOfIsoDate(selectedIsoDate ?? '') ??
      readMonthOfIsoDate(todayIsoDate) ??
      FALLBACK_MONTH,
  );

  return (
    <CalendarGrid
      visibleMonth={visibleMonth}
      onVisibleMonthChange={setVisibleMonth}
      selectedDate={selectedIsoDate ?? ''}
      todayDate={todayIsoDate}
      minDate={todayIsoDate}
      enabledDates={enabledDates}
      onDateSelect={onDaySelect}
      labels={buildCalendarLabels(visibleMonth)}
    />
  );
}
