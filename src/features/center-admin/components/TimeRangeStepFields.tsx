import { View } from 'react-native';

import { Text } from '@/ui/atoms/Text';

import { TimeStepField } from './TimeStepField';

interface TimeRangeStepFieldsProps {
  title: string;
  /** «Empieza» y «Termina»: dan contexto a cada hora para el lector de pantalla. */
  startName: string;
  endName: string;
  startsAtTime: string;
  endsAtTime: string;
  onStartStep: (direction: 1 | -1) => void;
  onEndStep: (direction: 1 | -1) => void;
  errorMessage?: string | undefined;
}

const FIELD_STYLE = { gap: 8 } as const;
const ROW_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } as const;

/** De qué hora a qué hora, de 30 en 30 minutos con − y +. */
export function TimeRangeStepFields({
  title,
  startName,
  endName,
  startsAtTime,
  endsAtTime,
  onStartStep,
  onEndStep,
  errorMessage,
}: Readonly<TimeRangeStepFieldsProps>): React.JSX.Element {
  return (
    <View style={FIELD_STYLE}>
      <Text variant="bodyStrong">{title}</Text>
      <View style={ROW_STYLE}>
        <TimeStepField accessibilityName={startName} time={startsAtTime} onStep={onStartStep} />
        <TimeStepField accessibilityName={endName} time={endsAtTime} onStep={onEndStep} />
      </View>
      {errorMessage === undefined ? null : (
        <Text variant="caption" color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
