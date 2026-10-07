import { View } from 'react-native';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import { ProfileStatusBadge } from './ProfileStatusBadge';
import { RatingSummaryLine } from './RatingSummaryLine';
import { GROW_STYLE, ROW_STYLE } from './TeamProfiles.styles';

/** Una persona del equipo con su estado de perfil con palabra, su valoración y si tiene vídeo. */
export function TeamMemberStatusRow({
  profile,
}: Readonly<{ profile: ProfileResponseDto }>): React.JSX.Element {
  return (
    <View accessible style={ROW_STYLE}>
      <Avatar name={profile.fullName} isDecorative />
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{profile.fullName}</Text>
        <RatingSummaryLine rating={profile.rating} />
        <Text variant="caption" color="ink2">
          {i18n.t(
            profile.introVideo === null
              ? 'teamProfiles.admin.withoutVideo'
              : 'teamProfiles.admin.withVideo',
          )}
        </Text>
      </View>
      <ProfileStatusBadge status={profile.status} />
    </View>
  );
}
