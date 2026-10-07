import { View } from 'react-native';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { PROFILE_STATUS_TEXT_KEYS } from '../model/profile-status';
import { ProfileStatusBadge } from './ProfileStatusBadge';
import { createCardStyle, GROW_STYLE, ROW_STYLE, TIGHT_STACK_STYLE } from './TeamProfiles.styles';

interface ProfileHeaderCardProps {
  profile: ProfileResponseDto;
  clientWord: string;
  onPreview: () => void;
}

function describeStatus(profile: ProfileResponseDto, clientWord: string): string {
  if (profile.status === 'changes_requested' && profile.reviewNote !== null) {
    return i18n.t('teamProfiles.editor.statusChanges', { note: profile.reviewNote });
  }
  return i18n.t(PROFILE_STATUS_TEXT_KEYS[profile.status], { clientWord });
}

/** Quién eres, en qué estado está tu perfil con palabras y el botón para verlo como lo ve la clientela. */
export function ProfileHeaderCard({
  profile,
  clientWord,
  onPreview,
}: Readonly<ProfileHeaderCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCardStyle(theme)}>
      <View style={ROW_STYLE}>
        <Avatar name={profile.fullName} size="xl" isDecorative />
        <View style={[GROW_STYLE, TIGHT_STACK_STYLE]}>
          <Text variant="titleMd">{profile.fullName}</Text>
          {profile.staffTitle === null ? null : (
            <Text variant="caption" color="ink2">
              {profile.staffTitle}
            </Text>
          )}
          <View style={ROW_STYLE}>
            <ProfileStatusBadge status={profile.status} />
          </View>
        </View>
      </View>
      <Text color="ink2">{describeStatus(profile, clientWord)}</Text>
      {profile.status === 'published' ? (
        <Text variant="caption" color="ink2">
          {i18n.t('teamProfiles.editor.editWarning')}
        </Text>
      ) : null}
      <Button
        variant="secondary"
        leadingIconName="eye"
        label={i18n.t('teamProfiles.editor.previewAction', { clientWord })}
        onPress={onPreview}
      />
    </View>
  );
}
