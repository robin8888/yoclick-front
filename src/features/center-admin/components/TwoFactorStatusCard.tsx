import { View } from 'react-native';

import { useMfaGetStatus } from '@/shared/api/generated/endpoints/mfa/mfa';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { createTwoFactorCardStyle, TWO_FACTOR_TEXT_STYLE } from './TwoFactorStatusCard.styles';

/**
 * Prototipo `asec`: la verificación en dos pasos. Las rutas de administración ya la exigen, así que
 * aquí se ve su estado y cuántos códigos de recuperación quedan; no se apaga desde la propia pantalla.
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
        {isEnabled ? (
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.security.recoveryCodes', {
              count: status.data?.recoveryCodesRemaining ?? 0,
            })}
          </Text>
        ) : null}
        {status.data === undefined || isEnabled ? null : (
          <Text variant="caption" color="warning">
            {i18n.t('centerAdmin.security.twoFactorOffNote', { clientWord })}
          </Text>
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
