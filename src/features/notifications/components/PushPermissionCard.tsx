import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { usePushPermission } from '../hooks/usePushPermission';
import { createPushCardStyle, PUSH_CARD_TEXT_STYLE } from './PushPermissionCard.styles';

/**
 * Explica para qué sirven los avisos y pide el permiso en este momento (no al abrir la app). Si la
 * persona lo denegó, el sistema ya no pregunta: se ofrece abrir los ajustes. Con el permiso
 * concedido no se muestra.
 */
export function PushPermissionCard(): React.JSX.Element | null {
  const theme = useTheme();
  const { status, requestPermission, openSettings } = usePushPermission();
  if (status === 'granted' || status === 'unknown') return null;
  const isDenied = status === 'denied';

  return (
    <View style={createPushCardStyle(theme)}>
      <Icon name="bell" color="brandInk" />
      <View style={PUSH_CARD_TEXT_STYLE}>
        <Text variant="bodyStrong">{i18n.t('notifications.push.title')}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t(
            isDenied ? 'notifications.push.deniedDescription' : 'notifications.push.description',
          )}
        </Text>
      </View>
      <Button
        size="sm"
        variant="outline"
        label={i18n.t(
          isDenied ? 'notifications.push.settingsAction' : 'notifications.push.enableAction',
        )}
        onPress={isDenied ? openSettings : () => void requestPermission()}
      />
    </View>
  );
}
