import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
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

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={createQuickAccessTileStyle(theme)}
    >
      <View style={createQuickAccessIconStyle(theme)}>
        <Icon name={iconName} color="brandInk" />
      </View>
      <Text variant="bodyStrong">{label}</Text>
    </Pressable>
  );
}

interface QuickAccessGridProps {
  onBookPress: () => void;
  onBookingsPress: () => void;
  onTeamPress: () => void;
}

/** «Accesos rápidos» del prototipo `home` que ya existen: reservar y ver mis citas. */
export function QuickAccessGrid({
  onBookPress,
  onBookingsPress,
  onTeamPress,
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
      </View>
    </View>
  );
}
