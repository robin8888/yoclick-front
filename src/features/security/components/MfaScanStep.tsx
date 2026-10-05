import { Linking } from 'react-native';

import { VerificationCodeTextField } from '@/features/auth';
import type { MfaSetupResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { QrCard } from '@/ui/organisms/QrCard';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useMfaCodeStep } from '../hooks/useMfaCodeStep';
import { formatTotpSecret } from '../model/format-totp-secret';

function AuthenticatorSetupInfo({
  setup,
}: Readonly<Pick<MfaScanStepProps, 'setup'>>): React.JSX.Element {
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
        onPress={() => {
          void Linking.openURL(setup.provisioningUri);
        }}
      />
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('security.mfaSetup.orEnterKeyLabel')}
      </Text>
      <Text variant="titleMd" align="center" selectable>
        {formatTotpSecret(setup.secret)}
      </Text>
    </>
  );
}

interface MfaScanStepProps {
  setup: MfaSetupResponseDto;
  onActivated: (recoveryCodes: string[]) => void;
}

/** Paso 2: escanear el QR (o escribir la clave) y confirmar con el primer código de la app. */
export function MfaScanStep({ setup, onActivated }: Readonly<MfaScanStepProps>): React.JSX.Element {
  const step = useMfaCodeStep(onActivated);

  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      isLoading={step.isSubmitting}
      loadingLabel={getSharedStateCopy().loadingLabel}
      title={i18n.t('security.mfaSetup.scanTitle')}
      subtitle={i18n.t('security.mfaSetup.scanSubtitle')}
      footer={
        <Button
          label={i18n.t('security.mfaSetup.activateLabel')}
          isFullWidth
          isLoading={step.isSubmitting}
          onPress={step.submitCode}
        />
      }
    >
      {step.errorMessage === null ? null : <FormErrorBanner message={step.errorMessage} />}
      <AuthenticatorSetupInfo setup={setup} />
      <Text variant="bodyStrong" align="center">
        {i18n.t('security.mfaSetup.codePrompt')}
      </Text>
      <VerificationCodeTextField
        control={step.control}
        name="code"
        onSubmitEditing={step.submitCode}
      />
    </ScreenTemplate>
  );
}
