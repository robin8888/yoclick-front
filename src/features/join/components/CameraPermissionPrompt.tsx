import { Linking, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { IconBadge } from '@/ui/atoms/IconBadge';
import { Text } from '@/ui/atoms/Text';

const PERMISSION_BADGE_STYLE = { alignItems: 'center' } as const;

interface CameraPermissionPromptProps {
  /** Si el sistema ya no deja volver a preguntar, solo se puede activar desde Ajustes. */
  canAskAgain: boolean;
  onRequestPermission: () => void;
}

/** Explica para qué se usa la cámara justo antes de pedir el permiso (SEC-22). */
export function CameraPermissionPrompt({
  canAskAgain,
  onRequestPermission,
}: Readonly<CameraPermissionPromptProps>): React.JSX.Element {
  return (
    <>
      <View style={PERMISSION_BADGE_STYLE}>
        <IconBadge iconName="camera" />
      </View>
      <Text color="ink2" align="center">
        {i18n.t('join.scan.permissionExplanation')}
      </Text>
      <Button
        label={
          canAskAgain
            ? i18n.t('join.scan.allowCameraAction')
            : i18n.t('join.scan.openSettingsAction')
        }
        isFullWidth
        onPress={
          canAskAgain
            ? onRequestPermission
            : () => {
                void Linking.openSettings();
              }
        }
      />
    </>
  );
}
