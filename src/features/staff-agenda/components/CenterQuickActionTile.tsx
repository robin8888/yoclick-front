import { Pressable, View } from 'react-native';

import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createIconBadgeStyle,
  createPrimaryActionStyle,
  createPrimaryBadgeVeilStyle,
  createPrimaryIconBadgeStyle,
  createQuickActionTileStyle,
  createTileTextStyle,
  PRIMARY_ACTION_TEXT_STYLE,
} from './CenterQuickActions.styles';

export interface QuickActionTileProps {
  iconName: IconName;
  label: string;
  /** Una línea que aclara para qué sirve el acceso. */
  hint: string;
  onPress: () => void;
}

/** Acceso secundario: tarjeta clara con el icono en una pastilla de marca suave. */
export function QuickActionTile({
  iconName,
  label,
  hint,
  onPress,
}: Readonly<QuickActionTileProps>): React.JSX.Element {
  const theme = useTheme();
  const style = usePressableStyle({
    baseStyle: createQuickActionTileStyle(theme),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      style={style}
    >
      <View style={createIconBadgeStyle(theme)}>
        <Icon name={iconName} size="navigation" color="brandInk" />
      </View>
      <View style={createTileTextStyle(theme)}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="caption" color="ink2" numberOfLines={2}>
          {hint}
        </Text>
      </View>
    </Pressable>
  );
}

/** Acción principal: ancho completo, color de marca y una flecha que invita a pulsar. */
export function PrimaryQuickAction({
  iconName,
  label,
  hint,
  onPress,
}: Readonly<QuickActionTileProps>): React.JSX.Element {
  const theme = useTheme();
  const style = usePressableStyle({
    baseStyle: createPrimaryActionStyle(theme),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      style={style}
    >
      <View style={createPrimaryIconBadgeStyle(theme)}>
        <View style={createPrimaryBadgeVeilStyle(theme)} pointerEvents="none" />
        <Icon name={iconName} size="header" color="onBrand" />
      </View>
      <View style={PRIMARY_ACTION_TEXT_STYLE}>
        <Text variant="titleMd" color="onBrand" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="caption" color="onBrand" numberOfLines={2}>
          {hint}
        </Text>
      </View>
      <Icon name="chevronRight" size="navigation" color="onBrand" />
    </Pressable>
  );
}
