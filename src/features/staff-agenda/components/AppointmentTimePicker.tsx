import type { SlotOption } from '@/features/booking';
import { useSlotWheelModel } from '@/shared/hooks/useSlotWheelModel';
import { i18n } from '@/shared/i18n';
import { SlotWheelPicker } from '@/ui/organisms/SlotWheelPicker';

interface AppointmentTimePickerProps {
  slots: readonly SlotOption[];
  timeZone: string;
  selectedStartsAt: string | null;
  onSlotSelect: (slot: SlotOption) => void;
}

/** La hora de la cita, como en el iPhone: ruedas de horas y minutos solo con lo libre y futuro. */
export function AppointmentTimePicker({
  slots,
  timeZone,
  selectedStartsAt,
  onSlotSelect,
}: Readonly<AppointmentTimePickerProps>): React.JSX.Element {
  const model = useSlotWheelModel({ slots, timeZone, selectedStartsAt });

  return (
    <SlotWheelPicker
      hours={model.hours}
      activeHour={model.activeHour}
      selectedStartsAt={selectedStartsAt}
      chosenTimeLabel={model.chosenTimeLabel}
      onSlotSelect={(startsAt) => {
        const slot = model.futureSlots.find((candidate) => candidate.startsAt === startsAt);
        if (slot !== undefined) onSlotSelect(slot);
      }}
      labels={{
        hours: i18n.t('staffAgenda.newAppointment.hourLabel'),
        minutes: i18n.t('staffAgenda.newAppointment.minuteLabel'),
        chosenTime: i18n.t('staffAgenda.newAppointment.chosenTimeLabel'),
        swipeToChoose: i18n.t('staffAgenda.newAppointment.swipeToChooseTime'),
        noSlots: i18n.t('booking.slot.noSlotsThisDay'),
      }}
    />
  );
}
