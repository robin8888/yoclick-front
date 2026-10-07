import { useMutation } from '@tanstack/react-query';
import { Share } from 'react-native';

import { getApiErrorMessage } from '@/shared/api/errors';
import { privacyExportClientData } from '@/shared/api/generated/endpoints/privacy/privacy';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';

const JSON_INDENT_SPACES = 2;

interface ExportClientData {
  run: (password: string) => void;
  isRunning: boolean;
  errorMessage: string | null;
}

/** Responder a un derecho de acceso: todo lo que el centro guarda de la persona, por el menú de compartir. */
export function useExportClientData(membershipId: string): ExportClientData {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const mutation = useMutation({
    mutationFn: async (password: string) => {
      const exported = await privacyExportClientData(centerId, membershipId, { password });
      await Share.share({
        title: i18n.t('centerAdmin.clientDataExport.shareTitle', {
          name: exported.person.fullName,
        }),
        message: JSON.stringify(exported, null, JSON_INDENT_SPACES),
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
