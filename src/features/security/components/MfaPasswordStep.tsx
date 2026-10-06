import { MfaScreenLogo, PasswordTextField } from '@/features/auth';
import type { MfaSetupResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';
import { SignOutAction } from '@/features/session';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';

import { useMfaPasswordStep } from '../hooks/useMfaPasswordStep';

interface MfaPasswordStepProps {
  onSetupStarted: (setup: MfaSetupResponseDto) => void;
}

/** Paso 1 de la verificación en dos pasos: confirmar la contraseña. */
export function MfaPasswordStep({
  onSetupStarted,
}: Readonly<MfaPasswordStepProps>): React.JSX.Element {
  const step = useMfaPasswordStep(onSetupStarted);
  const signOut = useSignOutFlow();

  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      isLoading={step.isSubmitting || signOut.isSigningOut}
      loadingLabel={getSharedStateCopy().loadingLabel}
      headerAccessory={<MfaScreenLogo />}
      title={i18n.t('security.mfaSetup.passwordTitle')}
      subtitle={i18n.t('security.mfaSetup.passwordSubtitle')}
      footer={
        <Button
          label={i18n.t('security.mfaSetup.continueLabel')}
          isFullWidth
          isLoading={step.isSubmitting}
          onPress={step.submitPassword}
        />
      }
    >
      {step.errorMessage === null ? null : <FormErrorBanner message={step.errorMessage} />}
      <PasswordTextField
        control={step.control}
        name="password"
        label={i18n.t('security.mfaSetup.passwordLabel')}
        purpose="current"
      />
      <SignOutAction flow={signOut} />
    </ScreenTemplate>
  );
}
