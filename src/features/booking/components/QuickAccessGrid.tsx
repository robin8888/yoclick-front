import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createQuickAccessGridStyle,
  createQuickAccessIconStyle,
  createQuickAccessSectionStyle,
  createQuickAccessTileStyle,
} from './QuickAccessGrid.styles';

interface QuickAccessTileProps {
  iconName: IconName;
  label: string;
  onPress: () => void;
}

function QuickAccessTile({
  iconName,
  label,
  onPress,
}: Readonly<QuickAccessTileProps>): React.JSX.Element {
  const theme = useTheme();
  const tileStyle = usePressableStyle({
    baseStyle: createQuickAccessTileStyle(theme),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });

  return (
    <Pressable role="button" accessibilityLabel={label} onPress={onPress} style={tileStyle}>
      <View style={createQuickAccessIconStyle(theme)}>
        <Icon name={iconName} size="navigation" color="brandInk" />
      </View>
      <Text variant="bodyStrong" align="center" numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

interface QuickAccessGridProps {
  onBookPress: () => void;
  onBookingsPress: () => void;
  onTeamPress: () => void;
  onMessagesPress: () => void;
}

/** «Accesos rápidos» del prototipo `home` que ya existen: reservar y ver mis citas. */
export function QuickAccessGrid({
  onBookPress,
  onBookingsPress,
  onTeamPress,
  onMessagesPress,
}: Readonly<QuickAccessGridProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createQuickAccessSectionStyle(theme)}>
      <Text variant="titleMd" role="heading">
        {i18n.t('booking.home.quickAccess')}
      </Text>
      <View style={createQuickAccessGridStyle(theme)}>
        <QuickAccessTile
          iconName="plus"
          label={i18n.t('booking.home.bookAction')}
          onPress={onBookPress}
        />
        <QuickAccessTile
          iconName="calendar"
          label={i18n.t('booking.home.myBookingsAction')}
          onPress={onBookingsPress}
        />
        <QuickAccessTile
          iconName="users"
          label={i18n.t('booking.home.teamAction')}
          onPress={onTeamPress}
        />
        <QuickAccessTile
          iconName="messageCircle"
          label={i18n.t('chat.title')}
          onPress={onMessagesPress}
        />
      </View>
    </View>
  );
}
