import { Share, View } from 'react-native';

import { MfaScreenLogo, useSignOut } from '@/features/auth';
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
 * Paso 3: los diez códigos de recuperación, que solo se enseñan ahora. La sesión actual no pasó
 * por el segundo factor, así que al terminar se cierra y se entra de nuevo con el código de la app.
 */
export function MfaRecoveryStep({
  recoveryCodes,
}: Readonly<MfaRecoveryStepProps>): React.JSX.Element {
  const { signOut, isSigningOut } = useSignOut({ noticeAfterSignOut: 'mfaEnabled' });

  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      isLoading={isSigningOut}
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
            isLoading={isSigningOut}
            onPress={signOut}
          />
        </>
      }
    >
      <RecoveryCodeGrid recoveryCodes={recoveryCodes} />
    </ScreenTemplate>
  );
}
