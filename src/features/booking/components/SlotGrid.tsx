import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Text } from '@/ui/atoms/Text';
import { SlotButton } from '@/ui/molecules/SlotButton';

import { SLOT_GRID_STYLE } from './SlotGrid.styles';

export interface SlotOption {
  startsAt: string;
  staffMembershipId: string;
  staffName: string;
}

interface SlotGridProps {
  slots: readonly SlotOption[];
  timeZone: string;
  selectedStartsAt: string | null;
  onSlotSelect: (slot: SlotOption) => void;
}

/** Las horas libres de un día. Solo se enseñan las libres: el servidor ya quitó las ocupadas. */
export function SlotGrid({
  slots,
  timeZone,
  selectedStartsAt,
  onSlotSelect,
}: Readonly<SlotGridProps>): React.JSX.Element {
  if (slots.length === 0) {
    return <Text color="ink2">{i18n.t('booking.slot.noSlotsThisDay')}</Text>;
  }
  return (
    <View style={SLOT_GRID_STYLE}>
      {slots.map((slot) => (
        <SlotButton
          key={slot.startsAt}
          timeLabel={formatTime24h(slot.startsAt, timeZone)}
          isSelected={slot.startsAt === selectedStartsAt}
          onPress={() => {
            onSlotSelect(slot);
          }}
        />
      ))}
    </View>
  );
}
