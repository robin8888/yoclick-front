import { MfaScreenLogo, VerificationCodeTextField } from '@/features/auth';
import { SignOutAction } from '@/features/session';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useMfaEmailCodeStep } from '../hooks/useMfaEmailCodeStep';

interface MfaEmailCodeStepProps {
  /** El correo enmascarado al que se envió el código. */
  emailHint: string;
  onActivated: (recoveryCodes: string[]) => void;
  /** Volver a pedir la contraseña para que el servidor envíe otro código. */
  onRequestNewCode: () => void;
}

/** Paso 3 (por correo): escribir el código que llegó al correo para activar el segundo factor. */
export function MfaEmailCodeStep({
  emailHint,
  onActivated,
  onRequestNewCode,
}: Readonly<MfaEmailCodeStepProps>): React.JSX.Element {
  const step = useMfaEmailCodeStep(onActivated);
  const signOut = useSignOutFlow();

  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<MfaScreenLogo />}
      isLoading={step.isSubmitting || signOut.isSigningOut}
      loadingLabel={getSharedStateCopy().loadingLabel}
      title={i18n.t('security.mfaSetup.emailCodeTitle')}
      subtitle={i18n.t('security.mfaSetup.emailCodeSubtitle', { emailHint })}
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
      <VerificationCodeTextField
        control={step.control}
        name="code"
        onSubmitEditing={step.submitCode}
      />
      <Button
        variant="ghost"
        label={i18n.t('security.mfaSetup.resendCodeAction')}
        onPress={onRequestNewCode}
      />
      <SignOutAction flow={signOut} />
    </ScreenTemplate>
  );
}
