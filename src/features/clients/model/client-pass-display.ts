import type { ClientListResponseDtoClientsItemPassSummary } from '@/shared/api/generated/model';
import type { BadgeTone } from '@/ui/atoms/Badge';

export type ClientPassStateId = ClientListResponseDtoClientsItemPassSummary['state'];

export interface ClientPassBadge {
  id: ClientPassStateId;
  tone: BadgeTone;
}

const PASS_BADGE_TONES: Record<ClientPassStateId, BadgeTone> = {
  none: 'neutral',
  pending: 'warning',
  active: 'success',
  ended: 'danger',
};

/** El estado del bono que se enseña en la lista de personas, siempre con palabra además del color. */
export function resolveClientPassBadge(
  passSummary: ClientListResponseDtoClientsItemPassSummary,
): ClientPassBadge {
  return { id: passSummary.state, tone: PASS_BADGE_TONES[passSummary.state] };
}
