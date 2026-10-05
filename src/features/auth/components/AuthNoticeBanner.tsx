import { i18n } from '@/shared/i18n';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useAuthFlowStore } from '../model/auth-flow-store';

const NOTICE_MESSAGE_KEYS = {
  passwordChanged: 'auth.passwordChangedNotice',
  emailVerified: 'auth.emailVerifiedNotice',
  mfaEnabled: 'auth.mfaEnabledNotice',
} as const;

/** Confirmación de un paso anterior (correo verificado, contraseña cambiada) en el login. */
export function AuthNoticeBanner(): React.JSX.Element | null {
  const notice = useAuthFlowStore((state) => state.notice);

  if (notice === null) return null;
  const messageKey = NOTICE_MESSAGE_KEYS[notice];
  return <FormErrorBanner tone="success" message={i18n.t(messageKey)} />;
}
