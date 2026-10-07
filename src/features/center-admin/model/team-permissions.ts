import type { UpdateTeamMemberRequestDtoPermissionsItem } from '@/shared/api/generated/model';

export type TeamPermission = UpdateTeamMemberRequestDtoPermissionsItem;

/**
 * Los permisos que ya tienen efecto en la API: ver informes, gestionar clientes y gestionar
 * servicios. El resto (`health:read`, `agenda:manage`, `payments:view`) se guardan pero ninguna ruta
 * los exige todavía, así que no se ofrecen.
 */
export const GRANTABLE_PERMISSIONS = ['reports:view', 'clients:manage', 'services:manage'] as const;
export type GrantablePermission = (typeof GRANTABLE_PERMISSIONS)[number];

function isGrantable(permission: string): permission is GrantablePermission {
  return (GRANTABLE_PERMISSIONS as readonly string[]).includes(permission);
}

/** Cuáles de los permisos que se pueden dar tiene ya la persona. */
export function pickGrantedPermissions(
  storedPermissions: readonly string[],
): GrantablePermission[] {
  return storedPermissions.filter(isGrantable);
}

export function togglePermission(
  granted: readonly GrantablePermission[],
  permission: GrantablePermission,
  isOn: boolean,
): GrantablePermission[] {
  const others = granted.filter((current) => current !== permission);
  return isOn ? [...others, permission] : others;
}

/**
 * La lista completa que se envía: lo que se eligió más lo que la persona ya tuviera de permisos que
 * esta pantalla no gestiona, para no quitárselos sin querer. `null` si no cambia nada.
 */
export function buildPermissionChange(
  storedPermissions: readonly TeamPermission[],
  granted: readonly GrantablePermission[],
): TeamPermission[] | null {
  const untouched = storedPermissions.filter((permission) => !isGrantable(permission));
  const next = [...untouched, ...granted];
  const hasChanged =
    next.length !== storedPermissions.length ||
    next.some((permission) => !storedPermissions.includes(permission));
  return hasChanged ? next : null;
}
