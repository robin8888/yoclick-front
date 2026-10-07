import { View } from 'react-native';

import type { TeamProfilesResponseDtoMembersItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { createMemberRowStyle, GROW_STYLE } from './Videos.styles';
import { VideoStatusBadge } from './VideoStatusBadge';

/** Una persona del equipo con su cargo y, con palabras, si tiene vídeo y en qué estado está. */
export function TeamMemberVideoRow({
  member,
}: Readonly<{ member: TeamProfilesResponseDtoMembersItem }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View accessible style={createMemberRowStyle(theme)}>
      <Avatar name={member.fullName} isDecorative />
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{member.fullName}</Text>
        {member.staffTitle === null ? null : (
          <Text variant="caption" color="ink2">
            {member.staffTitle}
          </Text>
        )}
      </View>
      {member.video === null ? (
        <Badge label={i18n.t('videos.teamAdmin.withoutVideo')} tone="neutral" />
      ) : (
        <VideoStatusBadge video={member.video} shouldShowApproved />
      )}
    </View>
  );
}
