import { Linking } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

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
      <Text color="ink2">{i18n.t('join.scan.permissionExplanation')}</Text>
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
