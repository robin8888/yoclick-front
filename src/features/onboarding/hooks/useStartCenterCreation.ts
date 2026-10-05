import { useRouter } from 'expo-router';

import { useSessionStore } from '@/shared/auth/session-store';

import { useCenterCreationIntentStore } from '../model/center-creation-intent-store';

/** «Crea la app de tu centro»: con sesión va directo al alta; sin ella, primero crea la cuenta. */
export function useStartCenterCreation(): { startCenterCreation: () => void } {
  const router = useRouter();
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const rememberCenterCreation = useCenterCreationIntentStore((state) => state.startCenterCreation);

  function startCenterCreation(): void {
    rememberCenterCreation();
    router.push(isSignedIn ? '/(onboarding)/center' : '/(auth)/register');
  }

  return { startCenterCreation };
}
