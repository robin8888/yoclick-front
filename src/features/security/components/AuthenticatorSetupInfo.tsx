import type { MfaSetupResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { QrCard } from '@/ui/organisms/QrCard';

import { useAuthenticatorSetupActions } from '../hooks/useAuthenticatorSetupActions';
import { formatTotpSecret } from '../model/format-totp-secret';

interface AuthenticatorSetupInfoProps {
  setup: MfaSetupResponseDto;
}

/**
 * Cómo dar de alta la clave: QR (para otro dispositivo), abrir en la app de autenticación y copiar
 * o leer la clave (para cuando todo está en el mismo móvil).
 */
export function AuthenticatorSetupInfo({
  setup,
}: Readonly<AuthenticatorSetupInfoProps>): React.JSX.Element {
  const actions = useAuthenticatorSetupActions(setup);

  return (
    <>
      <QrCard
        value={setup.provisioningUri}
        accessibilityLabel={i18n.t('security.mfaSetup.qrLabel')}
      />
      <Button
        variant="outline"
        label={i18n.t('security.mfaSetup.openAuthenticatorAction')}
        isFullWidth
        onPress={actions.openInAuthenticator}
      />
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('security.mfaSetup.orEnterKeyLabel')}
      </Text>
      <Text variant="titleMd" align="center" selectable>
        {formatTotpSecret(setup.secret)}
      </Text>
      <Button
        variant="outline"
        leadingIconName="copy"
        label={i18n.t('security.mfaSetup.copyKeyAction')}
        isFullWidth
        onPress={actions.copySecret}
      />
      {actions.feedback === null ? null : (
        <Text role="alert" variant="caption" color="ink2" align="center">
          {i18n.t(
            `security.mfaSetup.${actions.feedback === 'copied' ? 'keyCopied' : actions.feedback}`,
          )}
        </Text>
      )}
    </>
  );
}
