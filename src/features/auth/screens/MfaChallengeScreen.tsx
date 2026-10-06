import { Redirect, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { MfaCodeField } from '../components/MfaCodeField';
import { MfaScreenLogo } from '../components/MfaScreenLogo';
import { useMfaChallengeForm } from '../hooks/useMfaChallengeForm';

/** Segundo factor del login (obligatorio para administración, SEC-47). */
export function MfaChallengeScreen(): React.JSX.Element {
  const router = useRouter();
  const form = useMfaChallengeForm();
  const isAppCode = form.codeKind === 'appCode';

  if (!form.hasChallenge && !form.isSubmitting) return <Redirect href="/(auth)/login" />;
  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<MfaScreenLogo />}
      isLoading={form.isSubmitting}
      loadingLabel={getSharedStateCopy().loadingLabel}
      title={i18n.t('auth.mfa.title')}
      subtitle={i18n.t(isAppCode ? 'auth.mfa.appCodeSubtitle' : 'auth.mfa.recoveryCodeSubtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('auth.mfa.submitLabel')}
          isFullWidth
          isLoading={form.isSubmitting}
          onPress={form.submitCode}
        />
      }
    >
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      <MfaCodeField
        codeKind={form.codeKind}
        appCodeControl={form.appCodeControl}
        recoveryCodeControl={form.recoveryCodeControl}
        onSubmitEditing={form.submitCode}
      />
      <Button
        variant="ghost"
        label={i18n.t(isAppCode ? 'auth.mfa.useRecoveryCodeAction' : 'auth.mfa.useAppCodeAction')}
        onPress={form.toggleCodeKind}
      />
    </ScreenTemplate>
  );
}
