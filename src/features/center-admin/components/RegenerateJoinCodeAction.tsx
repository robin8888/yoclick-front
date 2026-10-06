import { useState } from 'react';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

import { useRegenerateJoinCode } from '../hooks/useRegenerateJoinCode';

/** Prototipo `regencode`: cambiar el código pide confirmar, porque el QR y el enlace dejan de valer. */
export function RegenerateJoinCodeAction(): React.JSX.Element {
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const { regenerateJoinCode, isRegenerating, errorMessage } = useRegenerateJoinCode();

  return (
    <>
      <Button
        variant="ghost"
        isFullWidth
        label={i18n.t('centerAdmin.inviteClients.regenerateAction')}
        onPress={() => {
          setIsSheetVisible(true);
        }}
      />
      {errorMessage === null ? null : (
        <Text color="danger" role="alert">
          {errorMessage}
        </Text>
      )}
      <ConfirmSheet
        isVisible={isSheetVisible}
        title={i18n.t('centerAdmin.inviteClients.regenerateTitle')}
        message={i18n.t('centerAdmin.inviteClients.regenerateMessage')}
        confirmLabel={i18n.t('centerAdmin.inviteClients.regenerateConfirm')}
        dismissLabel={i18n.t('actions.cancel')}
        isConfirming={isRegenerating}
        loadingLabel={getSharedStateCopy().loadingLabel}
        onConfirm={() => {
          regenerateJoinCode(() => {
            setIsSheetVisible(false);
          });
        }}
        onDismiss={() => {
          setIsSheetVisible(false);
        }}
      />
    </>
  );
}
