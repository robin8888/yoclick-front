import { formatShortDate } from '@/shared/lib/format/format-short-date';

import type { RescheduleDaySlots } from '../hooks/useRescheduleDaySlots';
import { AppointmentTimePicker } from './AppointmentTimePicker';
import { DateNavigator } from './DateNavigator';

/** Flechas para cambiar de día y, debajo, las horas libres de ese día. */
export function RescheduleSlotPicker({
  day,
}: Readonly<{ day: RescheduleDaySlots }>): React.JSX.Element {
  return (
    <>
      <DateNavigator
        dateLabel={formatShortDate(`${day.isoDate}T12:00:00.000Z`, 'UTC')}
        onPreviousDay={day.goToPreviousDay}
        onNextDay={day.goToNextDay}
      />
      <AppointmentTimePicker
        slots={day.slots}
        timeZone={day.timeZone}
        selectedStartsAt={day.selectedStartsAt}
        onSlotSelect={day.selectSlot}
      />
    </>
  );
}
