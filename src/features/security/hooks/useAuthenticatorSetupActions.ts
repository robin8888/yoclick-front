import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Linking } from 'react-native';

import type { MfaSetupResponseDto } from '@/shared/api/generated/model';

import {
  buildCopyableTotpSecret,
  shouldClearClipboard,
  TOTP_SECRET_CLIPBOARD_LIFETIME_MS,
} from '../model/totp-secret-clipboard';

export type AuthenticatorSetupFeedback = 'copied' | 'copyFailed' | 'noAuthenticatorApp';

interface AuthenticatorSetupActions {
  feedback: AuthenticatorSetupFeedback | null;
  copySecret: () => void;
  openInAuthenticator: () => void;
}

/** Sin `await` ni cancelación a propósito: el borrado debe ocurrir aunque se cierre la pantalla. */
function scheduleClipboardClear(copiedSecret: string): void {
  setTimeout(() => {
    void Clipboard.getStringAsync().then(async (clipboardText) => {
      if (shouldClearClipboard(clipboardText, copiedSecret)) await Clipboard.setStringAsync('');
    });
  }, TOTP_SECRET_CLIPBOARD_LIFETIME_MS);
}

/**
 * Las dos formas de dar de alta la clave en el mismo móvil, donde el QR no se puede escanear:
 * abrirla en una app de autenticación o copiarla (y borrarla del portapapeles al rato).
 */
export function useAuthenticatorSetupActions(
  setup: MfaSetupResponseDto,
): AuthenticatorSetupActions {
  const [feedback, setFeedback] = useState<AuthenticatorSetupFeedback | null>(null);

  return {
    feedback,
    copySecret: () => {
      const copyableSecret = buildCopyableTotpSecret(setup.secret);
      Clipboard.setStringAsync(copyableSecret)
        .then(() => {
          scheduleClipboardClear(copyableSecret);
          setFeedback('copied');
        })
        .catch(() => {
          setFeedback('copyFailed');
        });
    },
    openInAuthenticator: () => {
      Linking.openURL(setup.provisioningUri).catch(() => {
        setFeedback('noAuthenticatorApp');
      });
    },
  };
}
