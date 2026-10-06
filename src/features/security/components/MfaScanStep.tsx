import { MfaScreenLogo, VerificationCodeTextField } from '@/features/auth';
import type { MfaSetupResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useMfaCodeStep } from '../hooks/useMfaCodeStep';
import { AuthenticatorSetupInfo } from './AuthenticatorSetupInfo';

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
      headerAccessory={<MfaScreenLogo />}
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
