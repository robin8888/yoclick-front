import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { AVAILABILITY_TEXT_STYLE, createAvailabilityCardStyle } from './AvailabilityCard.styles';

interface AvailabilityCardProps {
  /** «08:00–20:00»; `null` si el centro no abre ese día. */
  openingLabel: string | null;
}

/** Prototipo `iagenda`: «Disponible 08:00–20:00». De momento es el horario del centro. */
export function AvailabilityCard({
  openingLabel,
}: Readonly<AvailabilityCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={
        openingLabel === null
          ? i18n.t('staffAgenda.instructor.unavailable')
          : i18n.t('staffAgenda.instructor.available', { hours: openingLabel })
      }
      style={createAvailabilityCardStyle(theme)}
    >
      <Icon name="clock" color="brandInk" />
      <View style={AVAILABILITY_TEXT_STYLE}>
        <Text variant="bodyStrong">
          {openingLabel === null
            ? i18n.t('staffAgenda.instructor.unavailable')
            : i18n.t('staffAgenda.instructor.available', { hours: openingLabel })}
        </Text>
        <Text variant="caption" color="ink2">
          {i18n.t('staffAgenda.instructor.availabilityCaption')}
        </Text>
      </View>
    </View>
  );
}
