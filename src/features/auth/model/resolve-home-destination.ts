import type { MyMembershipsResponseDtoMembershipsItem } from '@/shared/api/generated/model';

export type HomeDestinationKind = 'client' | 'staff' | 'admin' | 'platform' | 'none';

/** Rol en la administración de la plataforma (`none` para casi todas las personas). */
export type PlatformRole = 'none' | 'admin' | 'accountant';

export interface HomeDestination {
  readonly kind: HomeDestinationKind;
  /** Centro que pasa a ser el activo; `null` si la persona aún no pertenece a ninguno. */
  readonly centerId: string | null;
}

interface ResolveHomeDestinationInput {
  memberships: readonly MyMembershipsResponseDtoMembershipsItem[];
  /** Centro que la persona ya tenía activo (o el que acaba de elegir al unirse). */
  preferredCenterId: string | null;
  /** Quien administra la plataforma entra en su zona aunque pertenezca a algún centro. */
  platformRole?: PlatformRole;
}

const NO_DESTINATION: HomeDestination = { kind: 'none', centerId: null };
const PLATFORM_DESTINATION: HomeDestination = { kind: 'platform', centerId: null };

function mapRoleToDestinationKind(
  role: MyMembershipsResponseDtoMembershipsItem['role'],
): HomeDestinationKind {
  if (role === 'owner' || role === 'admin') return 'admin';
  return role;
}

/**
 * Elige a qué zona de la app entra la persona: el centro preferido si sigue activo y, si no,
 * el primero en el que tiene acceso. Solo es usabilidad: la API decide los permisos (SEC-09).
 */
export function resolveHomeDestination({
  memberships,
  preferredCenterId,
  platformRole = 'none',
}: ResolveHomeDestinationInput): HomeDestination {
  if (platformRole !== 'none') return PLATFORM_DESTINATION;
  const activeMemberships = memberships.filter((membership) => membership.status === 'active');
  const chosenMembership =
    activeMemberships.find((membership) => membership.centerId === preferredCenterId) ??
    activeMemberships[0];
  if (chosenMembership === undefined) return NO_DESTINATION;
  return {
    kind: mapRoleToDestinationKind(chosenMembership.role),
    centerId: chosenMembership.centerId,
  };
}
