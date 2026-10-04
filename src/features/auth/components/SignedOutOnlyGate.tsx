import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useSessionStore } from '@/shared/auth/session-store';

interface SignedOutOnlyGateProps {
  children: ReactNode;
}

/** Guarda del grupo `(auth)`: quien ya tiene sesión no vuelve a iniciar sesión ni a registrarse. */
export function SignedOutOnlyGate({
  children,
}: Readonly<SignedOutOnlyGateProps>): React.JSX.Element {
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');

  return isSignedIn ? <Redirect href="/" /> : <>{children}</>;
}
