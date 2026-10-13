import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { shiftTime, TimeWheelField } from '@/ui/molecules/TimeWheelField';

interface TimeRangeStepFieldsProps {
  title: string;
  /** «Empieza» y «Termina»: dan contexto a cada hora para el lector de pantalla. */
  startName: string;
  endName: string;
  startsAtTime: string;
  endsAtTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  errorMessage?: string | undefined;
}

const FIELD_STYLE = { gap: 8 } as const;
const ROW_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } as const;
const STEP_MINUTES = 5;

/**
 * De qué hora a qué hora, con ruedas como las del iPhone. «Hasta» no puede quedar por debajo de
 * «de»: sus ruedas solo ofrecen horas posteriores, y las de «de» solo anteriores a «hasta».
 */
export function TimeRangeStepFields({
  title,
  startName,
  endName,
  startsAtTime,
  endsAtTime,
  onStartTimeChange,
  onEndTimeChange,
  errorMessage,
}: Readonly<TimeRangeStepFieldsProps>): React.JSX.Element {
  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{title}</Text>
      <View style={ROW_STYLE}>
        <TimeWheelField
          label={i18n.t('centerAdmin.timeRange.from')}
          accessibilityName={startName}
          time={startsAtTime}
          maxTime={shiftTime(endsAtTime, -STEP_MINUTES)}
          stepMinutes={STEP_MINUTES}
          onTimeChange={onStartTimeChange}
        />
        <TimeWheelField
          label={i18n.t('centerAdmin.timeRange.until')}
          accessibilityName={endName}
          time={endsAtTime}
          minTime={shiftTime(startsAtTime, STEP_MINUTES)}
          stepMinutes={STEP_MINUTES}
          onTimeChange={onEndTimeChange}
        />
      </View>
      {errorMessage === undefined ? null : (
        <Text variant="caption" color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
