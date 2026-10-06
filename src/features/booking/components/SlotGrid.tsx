import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Text } from '@/ui/atoms/Text';
import { SlotButton } from '@/ui/molecules/SlotButton';

import { chunkIntoRows } from '../model/slot-rows';
import { SLOT_CELL_STYLE, SLOT_GRID_STYLE, SLOT_ROW_STYLE } from './SlotGrid.styles';

const SLOT_COLUMN_COUNT = 4;

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
      {chunkIntoRows(slots, SLOT_COLUMN_COUNT).map((rowSlots) => (
        <View key={rowSlots[0]?.startsAt} style={SLOT_ROW_STYLE}>
          {rowSlots.map((slot) => (
            <View key={slot.startsAt} style={SLOT_CELL_STYLE}>
              <SlotButton
                timeLabel={formatTime24h(slot.startsAt, timeZone)}
                isSelected={slot.startsAt === selectedStartsAt}
                onPress={() => {
                  onSlotSelect(slot);
                }}
              />
            </View>
          ))}
          {Array.from({ length: SLOT_COLUMN_COUNT - rowSlots.length }, (_, fillerIndex) => (
            <View key={`filler-${String(fillerIndex)}`} style={SLOT_CELL_STYLE} />
          ))}
        </View>
      ))}
    </View>
  );
}
