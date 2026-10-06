import { Pressable, View } from 'react-native';

import type { GroupListResponseDtoGroupsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { describeClientLevel } from '../model/client-display';
import {
  createGroupCardStyle,
  createGroupIconTileStyle,
  GROUP_CARD_TEXT_STYLE,
} from './GroupCard.styles';

interface GroupCardProps {
  group: GroupListResponseDtoGroupsItem;
  levelWords: readonly [string, string, string];
  onPress: () => void;
}

/** Prototipo `aclients`, «Grupos»: nombre y «N personas · quien lo da · nivel». */
export function GroupCard({
  group,
  levelWords,
  onPress,
}: Readonly<GroupCardProps>): React.JSX.Element {
  const theme = useTheme();
  const summary = i18n.t('clients.groups.cardSummary', {
    members: i18n.t('clients.groups.memberCount', { count: group.memberCount }),
    instructor: group.instructor?.fullName ?? i18n.t('clients.groups.noInstructor'),
    level: describeClientLevel(group.level, levelWords) ?? i18n.t('clients.groups.noLevel'),
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${group.name}. ${summary}`}
      onPress={onPress}
      style={createGroupCardStyle(theme)}
    >
      <View style={createGroupIconTileStyle(theme)}>
        <Icon name="users" color="brandInk" />
      </View>
      <View style={GROUP_CARD_TEXT_STYLE}>
        <Text variant="bodyStrong">{group.name}</Text>
        <Text variant="caption" color="ink2">
          {summary}
        </Text>
      </View>
      <Icon name="chevronRight" size="inline" color="ink2" />
    </Pressable>
  );
}
