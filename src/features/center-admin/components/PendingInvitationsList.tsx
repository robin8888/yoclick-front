import { View } from 'react-native';

import type { PendingInvitationsResponseDtoInvitationsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatNumericDate } from '@/shared/lib/format';
import { Text } from '@/ui/atoms/Text';

import { PendingInvitationRow } from './PendingInvitationRow';

const SECTION_STYLE = { gap: 16 } as const;
const ISO_DATE_LENGTH = 10;

/** Las invitaciones enviadas que aún no se han aceptado; no se pinta nada si no hay. */
export function PendingInvitationsList({
  invitations,
}: Readonly<{
  invitations: readonly PendingInvitationsResponseDtoInvitationsItem[];
}>): React.JSX.Element | null {
  if (invitations.length === 0) return null;

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('centerAdmin.team.pendingTitle')}
      </Text>
      {invitations.map((pending) => (
        <PendingInvitationRow
          key={pending.id}
          recipient={pending.email ?? pending.phone ?? ''}
          expiresOn={formatNumericDate(pending.expiresAt.slice(0, ISO_DATE_LENGTH))}
        />
      ))}
    </View>
  );
}
