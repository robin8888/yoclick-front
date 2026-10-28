import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createVoiceCardStyle } from './VoiceCard.styles';

/**
 * El centro no tiene el servicio: solo se explica qué hace. Sin precios ni botones de contratar
 * ni enlaces a planes (Apple 3.1.1: la app no lleva a ninguna compra fuera de ella).
 */
export function VoiceLockedNotice(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createVoiceCardStyle(theme)}>
      <Icon name="lock" size="header" color="ink2" />
      <Text variant="titleMd" role="heading">
        {i18n.t('voiceReceptionist.locked.title')}
      </Text>
      <Text color="ink2">{i18n.t('voiceReceptionist.locked.description')}</Text>
    </View>
  );
}
