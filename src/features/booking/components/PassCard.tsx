import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createPassCardStyle, createPassIconStyle, PASS_TEXT_STYLE } from './PassCard.styles';

/**
 * Tarjeta de bono del prototipo `home`. La API aún no expone bonos (docs/api-requests.md), así que
 * muestra el estado sin bono en lugar de inventar «te quedan 6».
 */
export function PassCard(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createPassCardStyle(theme)}>
      <View style={createPassIconStyle(theme)}>
        <Icon name="creditCard" color="brandInk" />
      </View>
      <View style={PASS_TEXT_STYLE}>
        <Text variant="bodyStrong">{i18n.t('booking.home.passTitle')}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('booking.home.passEmpty')}
        </Text>
      </View>
    </View>
  );
}
