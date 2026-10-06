import { capitalizeFirstLetter, getSectorVocabulary } from '@/shared/i18n/sector-vocabulary';

export type MembershipRoleName = 'owner' | 'admin' | 'staff' | 'client';

interface RoleLabelInput {
  /** `null` = la persona aún no pertenece a ningún centro. */
  role: MembershipRoleName | null;
  /** Sector del centro: da la palabra del sector (profesor, instructor, alumno, cliente…). */
  sectorId: string | undefined;
}

const OWNER_LABEL = 'Propietario';
const ADMIN_LABEL = 'Administrador';
// Sin centro no se sabe si es alumno, instructor o propietario: no se le pone un papel.
const NO_CENTER_LABEL = 'Sin centro todavía';

/** «Propietario», «Administrador», «Instructor»… tal como se lo llama dentro de su centro. */
export function resolveSignedInRoleLabel({ role, sectorId }: RoleLabelInput): string {
  if (role === null) return NO_CENTER_LABEL;
  if (role === 'owner') return OWNER_LABEL;
  if (role === 'admin') return ADMIN_LABEL;
  const vocabulary = getSectorVocabulary(sectorId);
  const roleWord = role === 'staff' ? vocabulary.staff.singular : vocabulary.client.singular;
  return capitalizeFirstLetter(roleWord);
}
