import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { DATE_NAVIGATOR_STYLE } from './DateNavigator.styles';

interface DateNavigatorProps {
  /** «Hoy · jue 8 oct» o «vie 9 oct». */
  dateLabel: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

/** Cambiar de día en la agenda con flechas, sin abrir un calendario. */
export function DateNavigator({
  dateLabel,
  onPreviousDay,
  onNextDay,
}: Readonly<DateNavigatorProps>): React.JSX.Element {
  return (
    <View style={DATE_NAVIGATOR_STYLE}>
      <IconButton
        iconName="chevronLeft"
        accessibilityLabel={i18n.t('staffAgenda.agenda.previousDayLabel')}
        onPress={onPreviousDay}
      />
      <Text variant="titleMd" accessibilityLiveRegion="polite">
        {dateLabel}
      </Text>
      <IconButton
        iconName="chevronRight"
        accessibilityLabel={i18n.t('staffAgenda.agenda.nextDayLabel')}
        onPress={onNextDay}
      />
    </View>
  );
}
