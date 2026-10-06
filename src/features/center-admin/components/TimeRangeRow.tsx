import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { IconButton } from '@/ui/atoms/IconButton';

import type { TimeField, TimeRange } from '../model/opening-hours-draft';
import { RANGE_ROW_STYLE } from './OpeningDayCard.styles';
import { TimeStepField } from './TimeStepField';

interface TimeRangeRowProps {
  dayName: string;
  range: TimeRange;
  canRemove: boolean;
  onRemove: () => void;
  onTimeStep: (field: TimeField, direction: 1 | -1) => void;
}

/** Un tramo del día: desde y hasta, y una cruz para quitarlo si hay más de uno. */
export function TimeRangeRow({
  dayName,
  range,
  canRemove,
  onRemove,
  onTimeStep,
}: Readonly<TimeRangeRowProps>): React.JSX.Element {
  return (
    <View style={RANGE_ROW_STYLE}>
      <TimeStepField
        accessibilityName={i18n.t('centerAdmin.hoursEditor.from', { day: dayName })}
        time={range.opensAt}
        onStep={(direction) => {
          onTimeStep('opensAt', direction);
        }}
      />
      <TimeStepField
        accessibilityName={i18n.t('centerAdmin.hoursEditor.until', { day: dayName })}
        time={range.closesAt}
        onStep={(direction) => {
          onTimeStep('closesAt', direction);
        }}
      />
      {canRemove ? (
        <IconButton
          iconName="close"
          accessibilityLabel={i18n.t('centerAdmin.hoursEditor.removeRange', { day: dayName })}
          onPress={onRemove}
        />
      ) : null}
    </View>
  );
}
