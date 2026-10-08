import { useRouter } from 'expo-router';

import { getApiErrorMessage } from '@/shared/api/errors';
import { LargeCodeField, useInvitationCodeEntry } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AuthBrandHeader } from '../components/AuthBrandHeader';

const CODE_LOGO_HEIGHT = 110;
const MAX_INVITATION_CODE_LENGTH = 24;

/** «Tengo un código»: antes de tener cuenta, se escribe el código del centro y la app se viste con su marca. */
export function InviteCodeScreen(): React.JSX.Element {
  const router = useRouter();
  const entry = useInvitationCodeEntry(() => {
    router.replace('/(auth)/register');
  });

  return (
    <ScreenTemplate
      title={i18n.t('join.invitation.codeScreenTitle')}
      subtitle={i18n.t('join.invitation.codeScreenSubtitle')}
      isLoading={entry.isChecking}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      hasPlatformHeroBackground
      isHeaderCentered
      headerAccessory={<AuthBrandHeader platformLogoHeight={CODE_LOGO_HEIGHT} />}
      footer={
        <Button
          label={i18n.t('join.invitation.submitLabel')}
          isFullWidth
          isLoading={entry.isChecking}
          onPress={entry.submitCode}
        />
      }
    >
      {entry.failure === null ? null : (
        <FormErrorBanner message={getApiErrorMessage(entry.failure)} />
      )}
      <LargeCodeField
        control={entry.control}
        name="invitationCode"
        label={i18n.t('join.invitation.anyCodeFieldLabel')}
        helperText={i18n.t('join.invitation.codeHelper')}
        placeholder={i18n.t('join.invitation.placeholder')}
        maxLength={MAX_INVITATION_CODE_LENGTH}
        onSubmitEditing={entry.submitCode}
      />
    </ScreenTemplate>
  );
}
