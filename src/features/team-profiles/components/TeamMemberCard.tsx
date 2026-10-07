import { Pressable, View } from 'react-native';

import type { ProfileResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { RatingSummaryLine } from './RatingSummaryLine';
import { createCardStyle, GROW_STYLE, ROW_STYLE, WRAP_ROW_STYLE } from './TeamProfiles.styles';

const MAX_SPECIALTIES_SHOWN = 3;

/** Una persona del equipo en la lista de la clientela: quién es, qué hace y cómo la valoran. */
export function TeamMemberCard({
  profile,
  onPress,
}: Readonly<{ profile: ProfileResponseDto; onPress: () => void }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={i18n.t('teamProfiles.team.seeProfileLabel', { name: profile.fullName })}
      onPress={onPress}
      style={[createCardStyle(theme), ROW_STYLE]}
    >
      <Avatar name={profile.fullName} size="lg" isDecorative />
      <View style={GROW_STYLE}>
        <Text variant="bodyStrong">{profile.fullName}</Text>
        {profile.headline === null ? null : (
          <Text variant="caption" color="ink2">
            {profile.headline}
          </Text>
        )}
        <RatingSummaryLine rating={profile.rating} />
        <View style={WRAP_ROW_STYLE}>
          {profile.specialties.slice(0, MAX_SPECIALTIES_SHOWN).map((specialty) => (
            <Badge key={specialty} label={specialty} tone="brand" />
          ))}
          {profile.introVideo === null ? null : (
            <Badge label={i18n.t('teamProfiles.team.withVideo')} tone="info" />
          )}
        </View>
      </View>
    </Pressable>
  );
}
