import { useMutation } from '@tanstack/react-query';
import { Share } from 'react-native';

import { getApiErrorMessage } from '@/shared/api/errors';
import { meDeleteAccount, meExportData } from '@/shared/api/generated/endpoints/me/me';
import { DeleteAccountRequestDtoConfirmation } from '@/shared/api/generated/model';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';
import { i18n } from '@/shared/i18n';

const JSON_INDENT_SPACES = 2;

interface AccountAction {
  run: (password: string) => void;
  isRunning: boolean;
  errorMessage: string | null;
}

/** Descarga todos los datos de la cuenta y los entrega con el menú de compartir del sistema. */
export function useExportMyData(): AccountAction {
  const mutation = useMutation({
    mutationFn: async (password: string) => {
      const personalData = await meExportData({ password });
      await Share.share({
        title: i18n.t('privacy.export.shareTitle'),
        message: JSON.stringify(personalData, null, JSON_INDENT_SPACES),
      });
    },
  });

  return {
    run: (password) => {
      mutation.mutate(password);
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

/** Elimina la cuenta (lo exige Apple 5.1.1(v)) y cierra la sesión de este móvil. */
export function useDeleteMyAccount(): AccountAction & { isSigningOut: boolean } {
  const { signOut, isSigningOut } = useSignOutFlow();
  const mutation = useMutation({
    mutationFn: (password: string) =>
      meDeleteAccount({ password, confirmation: DeleteAccountRequestDtoConfirmation.ELIMINAR }),
    onSuccess: signOut,
  });

  return {
    run: (password) => {
      mutation.mutate(password);
    },
    isRunning: mutation.isPending,
    isSigningOut,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
