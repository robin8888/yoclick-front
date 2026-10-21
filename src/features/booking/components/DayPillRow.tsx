import { ScrollView } from 'react-native';

import { DayPill } from '@/ui/molecules/DayPill';

import type { DayOption } from '../model/day-options';
import { DAY_PILL_ROW_STYLE } from './DayPillRow.styles';

interface DayPillRowProps {
  days: readonly DayOption[];
  selectedIsoDate: string | null;
  onDaySelect: (isoDate: string) => void;
}

/** Los próximos días en una fila que se desliza; los que no tienen horas libres quedan desactivados. */
export function DayPillRow({
  days,
  selectedIsoDate,
  onDaySelect,
}: Readonly<DayPillRowProps>): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={DAY_PILL_ROW_STYLE}
    >
      {days.map((day) => (
        <DayPill
          key={day.isoDate}
          weekdayLabel={day.weekdayLabel}
          dayLabel={day.dayLabel}
          accessibilityLabel={day.spokenLabel}
          isSelected={day.isoDate === selectedIsoDate}
          hasSlots={day.hasSlots}
          onPress={() => {
            onDaySelect(day.isoDate);
          }}
        />
      ))}
    </ScrollView>
  );
}
