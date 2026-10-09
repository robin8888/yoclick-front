import { View } from 'react-native';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { PROFILE_STATUS_TEXT_KEYS } from '../model/profile-status';
import { ProfileStatusBadge } from './ProfileStatusBadge';
import { CENTERED_STACK_STYLE, CENTER_ROW_STYLE, STACK_STYLE } from './TeamProfiles.styles';

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

/** Mientras es borrador no se dice nada: el estado solo se enseña cuando ya hay algo en marcha. */
function ProfileStatusNotes({
  profile,
  clientWord,
}: Readonly<{ profile: ProfileResponseDto; clientWord: string }>): React.JSX.Element | null {
  if (profile.status === 'draft') return null;

  return (
    <View style={CENTERED_STACK_STYLE}>
      <ProfileStatusBadge status={profile.status} />
      <Text variant="caption" color="ink2" align="center">
        {describeStatus(profile, clientWord)}
      </Text>
      {profile.status === 'published' ? (
        <Text variant="caption" color="ink2" align="center">
          {i18n.t('teamProfiles.editor.editWarning')}
        </Text>
      ) : null}
    </View>
  );
}

/** Como un perfil de red social: foto, nombre, estado y el botón para verlo como lo ve la clientela, en columna. */
export function ProfileHeaderCard({
  profile,
  clientWord,
  onPreview,
}: Readonly<ProfileHeaderCardProps>): React.JSX.Element {
  return (
    <View style={STACK_STYLE}>
      <View style={CENTERED_STACK_STYLE}>
        <Avatar name={profile.fullName} size="xl" isDecorative />
        <Text variant="titleMd" align="center">
          {profile.fullName}
        </Text>
        <ProfileStatusNotes profile={profile} clientWord={clientWord} />
        <View style={CENTER_ROW_STYLE}>
          <Button
            size="sm"
            variant="primary"
            leadingIconName="eye"
            label={i18n.t('teamProfiles.editor.previewAction', { clientWord })}
            onPress={onPreview}
          />
        </View>
      </View>
    </View>
  );
}
