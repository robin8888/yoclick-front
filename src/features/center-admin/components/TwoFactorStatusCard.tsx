import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useMfaGetStatus } from '@/shared/api/generated/endpoints/mfa/mfa';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Button } from '@/ui/atoms/Button';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createTwoFactorCardStyle, TWO_FACTOR_TEXT_STYLE } from './TwoFactorStatusCard.styles';

interface TwoFactorDetailsProps {
  clientWord: string;
  isEnabled: boolean;
  recoveryCodesRemaining: number;
}

/** Con la verificación activa, los códigos que quedan; si no, el aviso y el acceso para activarla. */
function TwoFactorDetails({
  clientWord,
  isEnabled,
  recoveryCodesRemaining,
}: Readonly<TwoFactorDetailsProps>): React.JSX.Element {
  const router = useRouter();
  if (isEnabled) {
    return (
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.security.recoveryCodes', { count: recoveryCodesRemaining })}
      </Text>
    );
  }
  return (
    <>
      <Text variant="caption" color="warning">
        {i18n.t('centerAdmin.security.twoFactorOffNote', { clientWord })}
      </Text>
      <Button
        size="sm"
        label={i18n.t('centerAdmin.security.twoFactorEnableAction')}
        onPress={() => {
          router.push('/(admin)/mfa-setup');
        }}
      />
    </>
  );
}

/**
 * Prototipo `asec`: la verificación en dos pasos. Es opcional: las rutas de administración solo la
 * piden a quien ya la tiene. Aquí se ve su estado, cuántos códigos de recuperación quedan y, si está
 * desactivada, el acceso para activarla. No se apaga desde la propia pantalla.
 */
export function TwoFactorStatusCard({
  clientWord,
}: Readonly<{ clientWord: string }>): React.JSX.Element {
  const theme = useTheme();
  const status = useMfaGetStatus();
  const isEnabled = status.data?.isEnabled === true;

  return (
    <View style={createTwoFactorCardStyle(theme)}>
      <Icon name="lock" color="ink2" />
      <View style={TWO_FACTOR_TEXT_STYLE}>
        <Text variant="bodyStrong">{i18n.t('centerAdmin.security.twoFactorTitle')}</Text>
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.security.twoFactorDescription')}
        </Text>
        {status.data === undefined ? null : (
          <TwoFactorDetails
            clientWord={clientWord}
            isEnabled={isEnabled}
            recoveryCodesRemaining={status.data.recoveryCodesRemaining}
          />
        )}
      </View>
      {status.data === undefined ? null : (
        <Badge
          label={
            isEnabled
              ? i18n.t('centerAdmin.security.twoFactorOn')
              : i18n.t('centerAdmin.security.twoFactorOff')
          }
          tone={isEnabled ? 'success' : 'warning'}
        />
      )}
    </View>
  );
}
