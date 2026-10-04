import { i18n } from '@/shared/i18n';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useAuthFlowStore } from '../model/auth-flow-store';

/** Confirmación de un paso anterior (correo verificado, contraseña cambiada) en el login. */
export function AuthNoticeBanner(): React.JSX.Element | null {
  const notice = useAuthFlowStore((state) => state.notice);

  if (notice === null) return null;
  const messageKey =
    notice === 'passwordChanged' ? 'auth.passwordChangedNotice' : 'auth.emailVerifiedNotice';
  return <FormErrorBanner tone="success" message={i18n.t(messageKey)} />;
}
