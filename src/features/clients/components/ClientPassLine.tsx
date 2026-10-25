import { View } from 'react-native';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import type { ClientListResponseDtoClientsItemPassSummary } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { resolveClientPassBadge, type ClientPassStateId } from '../model/client-pass-display';
import { createClientPassLineStyle } from './ClientPassLine.styles';

const PASS_BADGE_TEXT_KEYS = {
  none: 'clients.passBadges.none',
  pending: 'clients.passBadges.pending',
  active: 'clients.passBadges.active',
  ended: 'clients.passBadges.ended',
} as const satisfies Record<ClientPassStateId, string>;

interface ClientPassLineProps {
  passSummary: ClientListResponseDtoClientsItemPassSummary;
}

function describeActivePass({
  remainingSessions,
  expiresAt,
}: ClientListResponseDtoClientsItemPassSummary): string | null {
  if (remainingSessions === null) return null;
  const sessions = i18n.t('clients.passDetail.sessions', { count: remainingSessions });
  if (expiresAt === null) return sessions;
  const date = formatShortDate(expiresAt, DEFAULT_CENTER_TIME_ZONE);
  return `${sessions} · ${i18n.t('clients.passDetail.until', { date })}`;
}

/** Bajo el nombre: si tiene bono vigente, pedido o terminado, y cuántas clases le quedan. */
export function ClientPassLine({ passSummary }: Readonly<ClientPassLineProps>): React.JSX.Element {
  const theme = useTheme();
  const badge = resolveClientPassBadge(passSummary);
  const detail = describeActivePass(passSummary);

  return (
    <View style={createClientPassLineStyle(theme)}>
      <Badge label={i18n.t(PASS_BADGE_TEXT_KEYS[badge.id])} tone={badge.tone} />
      {detail === null ? null : (
        <Text variant="caption" color="ink2" numberOfLines={1}>
          {detail}
        </Text>
      )}
    </View>
  );
}
