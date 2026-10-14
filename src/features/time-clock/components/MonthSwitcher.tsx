import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { createMonthSwitcherStyle } from './TimeClock.styles';

interface MonthSwitcherProps {
  title: string;
  /** El mes de hoy es el último: no hay fichajes en el futuro. */
  isLastMonth: boolean;
  onPreviousPress: () => void;
  onNextPress: () => void;
}

/** «‹ Octubre de 2026 ›»: pasa de mes sin salir de la pantalla. */
export function MonthSwitcher({
  title,
  isLastMonth,
  onPreviousPress,
  onNextPress,
}: Readonly<MonthSwitcherProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createMonthSwitcherStyle(theme)}>
      <IconButton
        iconName="chevronLeft"
        variant="tonal"
        accessibilityLabel={i18n.t('timeClock.previousMonth')}
        onPress={onPreviousPress}
      />
      <Text variant="titleMd" role="heading">
        {title}
      </Text>
      <IconButton
        iconName="chevronRight"
        variant="tonal"
        accessibilityLabel={i18n.t('timeClock.nextMonth')}
        isDisabled={isLastMonth}
        onPress={onNextPress}
      />
    </View>
  );
}
