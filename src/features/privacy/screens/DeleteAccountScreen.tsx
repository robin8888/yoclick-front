import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useMyCenters } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { Input } from '@/ui/atoms/Input';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { OwnerClosureNotice } from '../components/OwnerClosureNotice';
import { PasswordConfirmForm } from '../components/PasswordConfirmForm';
import { useDeleteMyAccount } from '../hooks/useAccountActions';
import { isDeleteConfirmationWritten } from '../model/privacy-rights';

interface OwnerClosure {
  /** Los centros que cerraría el borrado: aquellos de los que la persona es propietaria. */
  centerNames: readonly string[];
  hasOwnedCenters: boolean;
  isAcknowledged: boolean;
  setIsAcknowledged: (isAcknowledged: boolean) => void;
  /** Se puede seguir: no es propietaria, o ya ha confirmado que entiende que el centro se cierra. */
  isConfirmed: boolean;
}

function useOwnerClosure(): OwnerClosure {
  const memberships = useMyCenters();
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const centerNames = (memberships.data?.memberships ?? [])
    .filter((membership) => membership.role === 'owner')
    .map((membership) => membership.center.name);
  const hasOwnedCenters = centerNames.length > 0;

  return {
    centerNames,
    hasOwnedCenters,
    isAcknowledged,
    setIsAcknowledged,
    isConfirmed: !hasOwnedCenters || isAcknowledged,
  };
}

/**
 * Prototipo `delacct`: borrado de la cuenta dentro de la app (lo exige Apple 5.1.1(v)). Si la persona es
 * propietaria de un centro, el borrado lo cierra: se le explica y tiene que confirmarlo expresamente.
 */
export function DeleteAccountScreen(): React.JSX.Element {
  const router = useRouter();
  const closure = useOwnerClosure();
  const deletion = useDeleteMyAccount({ shouldCloseOwnedCenters: closure.hasOwnedCenters });
  const [confirmationText, setConfirmationText] = useState('');

  return (
    <ScreenTemplate
      title={i18n.t('privacy.delete.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={deletion.isSigningOut}
    >
      {closure.hasOwnedCenters ? (
        <OwnerClosureNotice
          centerNames={closure.centerNames}
          isAcknowledged={closure.isAcknowledged}
          onAcknowledgedChange={closure.setIsAcknowledged}
        />
      ) : null}
      <PasswordConfirmForm
        description={i18n.t('privacy.delete.explanation')}
        passwordLabel={i18n.t('privacy.delete.passwordLabel')}
        confirmLabel={i18n.t('privacy.delete.confirmAction')}
        isRunning={deletion.isRunning}
        errorMessage={deletion.errorMessage}
        isSubmitAllowed={isDeleteConfirmationWritten(confirmationText) && closure.isConfirmed}
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
