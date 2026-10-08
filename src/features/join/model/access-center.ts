import { i18n } from '@/shared/i18n';
import { getSectorVocabulary } from '@/shared/i18n/sector-vocabulary';

/**
 * El centro por el que una persona sin cuenta va a entrar: lo trae una invitación personal (con su
 * rol) o el código o QR del centro (siempre como cliente). Con él las pantallas de acceso se visten
 * con la marca del centro.
 */
export interface AccessCenter {
  readonly id: string;
  readonly name: string;
  readonly sectorId: string;
  readonly brandColor: string;
  readonly logoUrl: string | null;
  readonly role: 'owner' | 'admin' | 'staff' | 'client';
  /** Correo ofuscado de una invitación por correo; `null` en el resto de casos. */
  readonly emailHint: string | null;
}

/** «alumno», «instructor»… como lo llama el sector del centro. */
export function describeAccessRole({ role, sectorId }: AccessCenter): string {
  const vocabulary = getSectorVocabulary(sectorId);
  return i18n.t(`join.invitation.roles.${role}`, {
    staffSingular: vocabulary.staff.singular,
    clientSingular: vocabulary.client.singular,
  });
}
