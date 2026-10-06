import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { TIME_STEP_MINUTES } from '../model/opening-hours-draft';
import { TIME_FIELD_STYLE, TIME_VALUE_STYLE } from './TimeStepField.styles';

interface TimeStepFieldProps {
  /** «Lunes, de» o «Lunes, hasta»: da contexto al lector de pantalla, que no ve la fila entera. */
  accessibilityName: string;
  time: string;
  onStep: (direction: 1 | -1) => void;
}

/** Una hora que se cambia de 30 en 30 minutos con − y +: sin selector de hora del sistema. */
export function TimeStepField({
  accessibilityName,
  time,
  onStep,
}: Readonly<TimeStepFieldProps>): React.JSX.Element {
  return (
    <View style={TIME_FIELD_STYLE}>
      <IconButton
        iconName="minus"
        accessibilityLabel={i18n.t('centerAdmin.hoursEditor.earlier', {
          name: accessibilityName,
          minutes: TIME_STEP_MINUTES,
        })}
        onPress={() => {
          onStep(-1);
        }}
      />
      <View style={TIME_VALUE_STYLE} accessible accessibilityLabel={`${accessibilityName} ${time}`}>
        <Text variant="bodyStrong" align="center">
          {time}
        </Text>
      </View>
      <IconButton
        iconName="plus"
        accessibilityLabel={i18n.t('centerAdmin.hoursEditor.later', {
          name: accessibilityName,
          minutes: TIME_STEP_MINUTES,
        })}
        onPress={() => {
          onStep(1);
        }}
      />
    </View>
  );
}
