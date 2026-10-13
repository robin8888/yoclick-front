import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { IconButton } from '@/ui/atoms/IconButton';
import { shiftTime, TimeWheelField } from '@/ui/molecules/TimeWheelField';

import type { TimeField, TimeRange } from '../model/opening-hours-draft';
import { RANGE_ROW_STYLE } from './OpeningDayCard.styles';

/** Las ruedas del horario de apertura avanzan de 15 en 15 minutos y enseñan tres filas. */
const OPENING_STEP_MINUTES = 15;
const OPENING_VISIBLE_ITEMS = 3;

interface TimeRangeRowProps {
  dayName: string;
  range: TimeRange;
  canRemove: boolean;
  onRemove: () => void;
  onTimeChange: (field: TimeField, time: string) => void;
}

/**
 * Un tramo del día: «De» y «Hasta» en ruedas como las del iPhone (hasta nunca por debajo de de) y
 * una cruz para quitarlo si hay más de uno.
 */
export function TimeRangeRow({
  dayName,
  range,
  canRemove,
  onRemove,
  onTimeChange,
}: Readonly<TimeRangeRowProps>): React.JSX.Element {
  const common = { stepMinutes: OPENING_STEP_MINUTES, visibleItems: OPENING_VISIBLE_ITEMS };

  return (
    <View style={RANGE_ROW_STYLE}>
      <TimeWheelField
        {...common}
        label={i18n.t('centerAdmin.timeRange.from')}
        accessibilityName={i18n.t('centerAdmin.hoursEditor.from', { day: dayName })}
        time={range.opensAt}
        maxTime={shiftTime(range.closesAt, -OPENING_STEP_MINUTES)}
        onTimeChange={(time) => {
          onTimeChange('opensAt', time);
        }}
      />
      <TimeWheelField
        {...common}
        label={i18n.t('centerAdmin.timeRange.until')}
        accessibilityName={i18n.t('centerAdmin.hoursEditor.until', { day: dayName })}
        time={range.closesAt}
        minTime={shiftTime(range.opensAt, OPENING_STEP_MINUTES)}
        onTimeChange={(time) => {
          onTimeChange('closesAt', time);
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
