import type { InvitationPreviewResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSectorVocabulary } from '@/shared/i18n/sector-vocabulary';

/** «alumno», «instructor»… como lo llama el sector del centro que invita. */
export function describeInvitedRole({ role, center }: InvitationPreviewResponseDto): string {
  const vocabulary = getSectorVocabulary(center.sectorId);
  return i18n.t(`join.invitation.roles.${role}`, {
    staffSingular: vocabulary.staff.singular,
    clientSingular: vocabulary.client.singular,
  });
}
