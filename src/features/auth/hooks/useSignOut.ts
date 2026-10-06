import { useSignOutFlow, type SignOutFlow } from '@/shared/auth/useSignOutFlow';

import { useAuthFlowStore, type AuthNotice } from '../model/auth-flow-store';

interface SignOutOptions {
  /** Aviso que se enseña en el login tras salir (p. ej. «entra con tu código»). */
  noticeAfterSignOut?: AuthNotice;
}

/** El cierre de sesión completo, con la opción de dejar un aviso en el inicio de sesión. */
export function useSignOut({ noticeAfterSignOut }: SignOutOptions = {}): SignOutFlow {
  return useSignOutFlow({
    onSignedOut: () => {
      if (noticeAfterSignOut !== undefined)
        useAuthFlowStore.setState({ notice: noticeAfterSignOut });
    },
  });
}
