import { ScrollView } from 'react-native';

import { DayPill } from '@/ui/molecules/DayPill';

import type { AgendaDayOption } from '../model/agenda-days';
import { DAY_STRIP_CONTENT_STYLE } from './AgendaDayStrip.styles';

interface AgendaDayStripProps {
  days: readonly AgendaDayOption[];
  selectedIsoDate: string;
  onDaySelect: (isoDate: string) => void;
}

/** Prototipo `iagenda`: la franja de días que se desplaza de lado; el elegido va en negro. */
export function AgendaDayStrip({
  days,
  selectedIsoDate,
  onDaySelect,
}: Readonly<AgendaDayStripProps>): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={DAY_STRIP_CONTENT_STYLE}
    >
      {days.map((day) => (
        <DayPill
          key={day.isoDate}
          weekdayLabel={day.weekdayLabel}
          dayLabel={day.dayLabel}
          accessibilityLabel={day.fullLabel}
          isSelected={day.isoDate === selectedIsoDate}
          selectedTone="ink"
          hasSlots
          onPress={() => {
            onDaySelect(day.isoDate);
          }}
        />
      ))}
    </ScrollView>
  );
}
