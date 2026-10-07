import { useRouter } from 'expo-router';
import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { Input } from '@/ui/atoms/Input';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { PasswordConfirmForm } from '../components/PasswordConfirmForm';
import { useDeleteMyAccount } from '../hooks/useAccountActions';
import { isDeleteConfirmationWritten } from '../model/privacy-rights';

/** Prototipo `delacct`: borrado de la cuenta dentro de la app (lo exige Apple 5.1.1(v)). */
export function DeleteAccountScreen(): React.JSX.Element {
  const router = useRouter();
  const deletion = useDeleteMyAccount();
  const [confirmationText, setConfirmationText] = useState('');

  return (
    <ScreenTemplate
      title={i18n.t('privacy.delete.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={deletion.isSigningOut}
    >
      <PasswordConfirmForm
        description={i18n.t('privacy.delete.explanation')}
        passwordLabel={i18n.t('privacy.delete.passwordLabel')}
        confirmLabel={i18n.t('privacy.delete.confirmAction')}
        isRunning={deletion.isRunning}
        errorMessage={deletion.errorMessage}
        isSubmitAllowed={isDeleteConfirmationWritten(confirmationText)}
        onSubmit={deletion.run}
      >
        <Input
          value={confirmationText}
          onChangeText={setConfirmationText}
          accessibilityLabel={i18n.t('privacy.delete.confirmationLabel')}
          placeholder={i18n.t('privacy.delete.confirmationLabel')}
          autoCapitalize="characters"
        />
      </PasswordConfirmForm>
    </ScreenTemplate>
  );
}
