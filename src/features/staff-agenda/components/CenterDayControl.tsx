import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { createDayControlStyle, createDayControlRowStyle } from './CenterDayControl.styles';

interface CenterDayControlProps {
  heading: string;
  /** «Hoy» o «lun 5 oct». */
  dayLabel: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

/** Prototipo `aagenda`: «Por instructor» a la izquierda y el día, en el color de marca, a la derecha. */
export function CenterDayControl({
  heading,
  dayLabel,
  onPreviousDay,
  onNextDay,
}: Readonly<CenterDayControlProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createDayControlStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {heading}
      </Text>
      <View style={createDayControlRowStyle(theme)}>
        <IconButton
          iconName="chevronLeft"
          accessibilityLabel={i18n.t('staffAgenda.agenda.previousDayLabel')}
          onPress={onPreviousDay}
        />
        <Text variant="bodyStrong" color="brandInk" accessibilityLiveRegion="polite">
          {dayLabel}
        </Text>
        <IconButton
          iconName="chevronRight"
          accessibilityLabel={i18n.t('staffAgenda.agenda.nextDayLabel')}
          onPress={onNextDay}
        />
      </View>
    </View>
  );
}
