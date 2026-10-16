import { useQueryClient } from '@tanstack/react-query';
import { Share, View } from 'react-native';

import { MfaScreenLogo } from '@/features/auth';
import { getMfaGetStatusQueryKey } from '@/shared/api/generated/endpoints/mfa/mfa';
import { i18n } from '@/shared/i18n';
import { platformCardColors } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RECOVERY_CODE_CARD_STYLE, RECOVERY_CODES_STYLE } from './MfaRecoveryStep.styles';

interface MfaRecoveryStepProps {
  recoveryCodes: readonly string[];
}

function shareRecoveryCodes(recoveryCodes: readonly string[]): void {
  void Share.share({
    message: i18n.t('security.mfaSetup.shareCodesMessage', { codes: recoveryCodes.join('\n') }),
  });
}

function RecoveryCodeGrid({ recoveryCodes }: Readonly<MfaRecoveryStepProps>): React.JSX.Element {
  return (
    <View style={RECOVERY_CODES_STYLE}>
      {recoveryCodes.map((recoveryCode) => (
        <View key={recoveryCode} style={RECOVERY_CODE_CARD_STYLE}>
          <Text variant="bodyStrong" tintColor={platformCardColors.title} selectable>
            {recoveryCode}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Paso 3: los diez códigos de recuperación, que solo se enseñan ahora. La sesión ya viene verificada
 * con el segundo factor: al terminar, el estado se refresca y la zona de administración se abre sola.
 * El estado no se refresca antes porque desmontaría esta pantalla antes de guardar los códigos.
 */
export function MfaRecoveryStep({
  recoveryCodes,
}: Readonly<MfaRecoveryStepProps>): React.JSX.Element {
  const queryClient = useQueryClient();

  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<MfaScreenLogo />}
      title={i18n.t('security.mfaSetup.recoveryTitle')}
      subtitle={i18n.t('security.mfaSetup.recoverySubtitle')}
      footer={
        <>
          <Button
            variant="outline"
            label={i18n.t('security.mfaSetup.shareCodesAction')}
            isFullWidth
            onPress={() => {
              shareRecoveryCodes(recoveryCodes);
            }}
          />
          <Button
            label={i18n.t('security.mfaSetup.savedLabel')}
            isFullWidth
            onPress={() => {
              void queryClient.invalidateQueries({ queryKey: getMfaGetStatusQueryKey() });
            }}
          />
        </>
      }
    >
      <RecoveryCodeGrid recoveryCodes={recoveryCodes} />
    </ScreenTemplate>
  );
}
