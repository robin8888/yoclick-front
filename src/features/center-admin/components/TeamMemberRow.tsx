import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge, type BadgeTone } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import type { RosterMember } from '../model/team-roster';
import { ADMIN_CARD_TEXT_STYLE, createAdminCardStyle } from './AdminCard.styles';

const STATUS_TONES = {
  active: 'success',
  invited: 'info',
  blocked: 'warning',
  left: 'neutral',
} as const satisfies Record<RosterMember['status'], BadgeTone>;

const STATUS_TEXT_KEYS = {
  active: 'centerAdmin.team.status.active',
  invited: 'centerAdmin.team.status.invited',
  blocked: 'centerAdmin.team.status.blocked',
  left: 'centerAdmin.team.status.left',
} as const satisfies Record<RosterMember['status'], string>;

const ROLE_TEXT_KEYS = {
  owner: 'centerAdmin.team.roles.owner',
  admin: 'centerAdmin.team.roles.admin',
  staff: 'centerAdmin.team.roles.staff',
  client: 'centerAdmin.team.roles.client',
} as const satisfies Record<RosterMember['role'], string>;

interface TeamMemberRowProps {
  member: RosterMember;
  /** Cómo se llama en este sector a quien da las sesiones («Instructor», «Profesor»…). */
  staffWord: string;
  onPress: () => void;
}

/** Una persona del equipo: nombre, cargo o rol y su estado con palabra. */
export function TeamMemberRow({
  member,
  staffWord,
  onPress,
}: Readonly<TeamMemberRowProps>): React.JSX.Element {
  const theme = useTheme();
  const roleLabel =
    member.role === 'staff'
      ? (member.staffTitle ?? staffWord)
      : i18n.t(ROLE_TEXT_KEYS[member.role]);
  const statusLabel = i18n.t(STATUS_TEXT_KEYS[member.status]);

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${member.fullName}. ${roleLabel}. ${statusLabel}`}
      onPress={onPress}
      style={createAdminCardStyle(theme)}
    >
      <Avatar name={member.fullName} size="md" isDecorative />
      <View style={ADMIN_CARD_TEXT_STYLE}>
        <Text variant="bodyStrong">{member.fullName}</Text>
        <Text variant="caption" color="ink2">
          {roleLabel}
        </Text>
      </View>
      <Badge label={statusLabel} tone={STATUS_TONES[member.status]} />
    </Pressable>
  );
}
