import { Redirect, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { MfaCodeField } from '../components/MfaCodeField';
import { useHasPlatformLook } from '../components/AuthBrandHeader';
import { MfaScreenLogo } from '../components/MfaScreenLogo';
import { useMfaChallengeForm, type MfaCodeKind } from '../hooks/useMfaChallengeForm';

interface MfaSubmitButtonProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

function MfaSubmitButton({
  isSubmitting,
  onSubmit,
}: Readonly<MfaSubmitButtonProps>): React.JSX.Element {
  return (
    <Button
      label={i18n.t('auth.mfa.submitLabel')}
      isFullWidth
      isLoading={isSubmitting}
      onPress={onSubmit}
    />
  );
}

const SUBTITLE_KEYS = {
  appCode: 'auth.mfa.appCodeSubtitle',
  emailCode: 'auth.mfa.emailCodeSubtitle',
  recoveryCode: 'auth.mfa.recoveryCodeSubtitle',
} as const;

const SWITCH_ACTION_KEYS = {
  appCode: 'auth.mfa.useAppCodeAction',
  emailCode: 'auth.mfa.useEmailCodeAction',
  recoveryCode: 'auth.mfa.useRecoveryCodeAction',
} as const;

interface EmailResendProps {
  sender: ReturnType<typeof useMfaChallengeForm>['emailSender'];
}

/** Reenviar el código del correo: con cuenta atrás, porque el servidor limita los envíos. */
function EmailResendButton({ sender }: Readonly<EmailResendProps>): React.JSX.Element {
  const isWaiting = sender.secondsLeft > 0;

  return (
    <Button
      variant="ghost"
      label={
        isWaiting
          ? i18n.t('auth.mfa.resendEmailCodeWait', { seconds: sender.secondsLeft })
          : i18n.t('auth.mfa.resendEmailCodeAction')
      }
      isDisabled={isWaiting || sender.isSending}
      onPress={sender.sendCode}
    />
  );
}

interface MfaAlternativesProps {
  kinds: MfaCodeKind[];
  onSelect: (kind: MfaCodeKind) => void;
}

/** Las otras formas de dar el segundo factor: app, código por correo o código de recuperación. */
function MfaAlternatives({ kinds, onSelect }: Readonly<MfaAlternativesProps>): React.JSX.Element {
  return (
    <>
      {kinds.map((kind) => (
        <Button
          key={kind}
          variant="ghost"
          label={i18n.t(SWITCH_ACTION_KEYS[kind])}
          onPress={() => {
            onSelect(kind);
          }}
        />
      ))}
    </>
  );
}

/** Segundo factor del login (obligatorio para administración, SEC-47): app, correo o recuperación. */
export function MfaChallengeScreen(): React.JSX.Element {
  const router = useRouter();
  const form = useMfaChallengeForm();
  const hasPlatformLook = useHasPlatformLook();

  if (!form.hasChallenge && !form.isSubmitting) return <Redirect href="/(auth)/login" />;
  return (
    <ScreenTemplate
      hasPlatformHeroBackground={hasPlatformLook}
      isHeaderCentered
      headerAccessory={<MfaScreenLogo />}
      isLoading={form.isSubmitting}
      loadingLabel={getSharedStateCopy().loadingLabel}
      title={i18n.t('auth.mfa.title')}
      subtitle={i18n.t(SUBTITLE_KEYS[form.codeKind], {
        emailHint: form.emailSender.emailHint ?? '',
      })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={<MfaSubmitButton isSubmitting={form.isSubmitting} onSubmit={form.submitCode} />}
    >
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      <MfaCodeField
        codeKind={form.codeKind}
        appCodeControl={form.codeControl}
        recoveryCodeControl={form.recoveryCodeControl}
        onSubmitEditing={form.submitCode}
      />
      {form.codeKind === 'emailCode' ? <EmailResendButton sender={form.emailSender} /> : null}
      <MfaAlternatives kinds={form.otherCodeKinds} onSelect={form.selectCodeKind} />
    </ScreenTemplate>
  );
}
