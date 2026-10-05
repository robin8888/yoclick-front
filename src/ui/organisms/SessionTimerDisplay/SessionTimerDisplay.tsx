import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  createProgressFillStyle,
  createProgressTrackStyle,
  createTimerStyle,
} from './SessionTimerDisplay.styles';
import type { SessionTimerDisplayProps } from './SessionTimerDisplay.types';

/**
 * Reloj de una clase en curso. Solo pinta lo que recibe: el cálculo del tiempo vive en la feature.
 * Pasarse de la duración prevista se dice con palabra («Tiempo extra») y no solo con el color.
 */
export function SessionTimerDisplay({
  mainTimeLabel,
  mainTimeCaption,
  detailLabel,
  progressFraction,
  isOvertime,
}: Readonly<SessionTimerDisplayProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      accessible
      role="timer"
      accessibilityLabel={`${mainTimeCaption} ${mainTimeLabel}. ${detailLabel}`}
      style={createTimerStyle(theme)}
    >
      <Text variant="overline" color={isOvertime ? 'warning' : 'ink2'}>
        {mainTimeCaption}
      </Text>
      <Text variant="display" color={isOvertime ? 'warning' : 'ink'} maxFontSizeMultiplier={1.4}>
        {mainTimeLabel}
      </Text>
      <View style={createProgressTrackStyle(theme)} aria-hidden>
        <View style={createProgressFillStyle(theme, progressFraction, isOvertime)} />
      </View>
      <Text variant="caption" color="ink2">
        {detailLabel}
      </Text>
    </View>
  );
}
