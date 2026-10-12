import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Chip } from '@/ui/atoms/Chip';
import { Text } from '@/ui/atoms/Text';

import {
  describeWeekday,
  describeWeekdayInitial,
  SCHEDULE_WEEKDAYS,
  type ScheduleWeekday,
} from '../model/schedule-form';

interface ScheduleWeekdaysFieldProps {
  selectedWeekdays: readonly number[];
  onWeekdayToggle: (weekday: ScheduleWeekday) => void;
  errorMessage?: string | undefined;
}

const FIELD_STYLE = { gap: 8 } as const;
const CHIPS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

/** Los días de la semana del horario, como casillas «L M X J V S D» con su nombre completo para el lector. */
export function ScheduleWeekdaysField({
  selectedWeekdays,
  onWeekdayToggle,
  errorMessage,
}: Readonly<ScheduleWeekdaysFieldProps>): React.JSX.Element {
  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{i18n.t('centerAdmin.schedules.weekdaysLabel')}</Text>
      <View style={CHIPS_STYLE}>
        {SCHEDULE_WEEKDAYS.map((weekday) => (
          <Chip
            key={weekday}
            label={describeWeekdayInitial(weekday)}
            accessibilityLabel={describeWeekday(weekday)}
            selectionRole="checkbox"
            isSelected={selectedWeekdays.includes(weekday)}
            onPress={() => {
              onWeekdayToggle(weekday);
            }}
          />
        ))}
      </View>
      {errorMessage === undefined ? null : (
        <Text variant="caption" color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
