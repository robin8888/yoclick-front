import type { RescheduleDaySlots } from '../hooks/useRescheduleDaySlots';
import { AppointmentDayCalendar } from './AppointmentDayCalendar';
import { AppointmentTimePicker } from './AppointmentTimePicker';

/** El calendario del iPhone para elegir el día y, debajo, las ruedas con las horas libres de ese día. */
export function RescheduleSlotPicker({
  day,
}: Readonly<{ day: RescheduleDaySlots }>): React.JSX.Element {
  return (
    <>
      <AppointmentDayCalendar selectedIsoDate={day.isoDate} onDateSelect={day.selectDate} />
      <AppointmentTimePicker
        slots={day.slots}
        timeZone={day.timeZone}
        selectedStartsAt={day.selectedStartsAt}
        onSlotSelect={day.selectSlot}
      />
    </>
  );
}
