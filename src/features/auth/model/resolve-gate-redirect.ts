import type { HomeDestination } from './resolve-home-destination';

interface GateRedirectInput {
  /** `null` mientras se cargan los centros de la persona. */
  destination: HomeDestination | null;
  hasInvitationLink: boolean;
  isInvitationExpected: boolean;
  isCenterCreationRequested: boolean;
}

/**
 * Pantalla a la que va una persona con sesión antes de su zona de siempre: aceptar un enlace de
 * invitación o, si aún no tiene ningún centro, lo que dijo en el registro. `null` = seguir con su zona.
 */
export function resolveSignedInGateRedirect({
  destination,
  hasInvitationLink,
  isInvitationExpected,
  isCenterCreationRequested,
}: GateRedirectInput): '/join/invitation' | '/(onboarding)/center' | null {
  if (hasInvitationLink) return '/join/invitation';
  if (destination?.kind !== 'none') return null;
  if (isCenterCreationRequested) return '/(onboarding)/center';
  return isInvitationExpected ? '/join/invitation' : null;
}
