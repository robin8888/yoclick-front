import { Pressable, View } from 'react-native';

import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { CountBadge } from '@/ui/atoms/CountBadge';
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
} from './QuickActionsGrid.styles';

export interface QuickActionTileProps {
  iconName: IconName;
  label: string;
  /** Una línea que aclara para qué sirve el acceso. */
  hint: string;
  /** Cuántas cosas pendientes tiene (mensajes sin leer): un círculo con el número en la esquina. */
  badgeCount?: number | undefined;
  onPress: () => void;
}

const TILE_TOP_ROW_STYLE = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
} as const;

/** Acceso secundario: tarjeta clara con el icono en una pastilla de marca suave. */
export function QuickActionTile({
  iconName,
  label,
  hint,
  badgeCount,
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
      accessibilityLabel={
        badgeCount === undefined || badgeCount === 0 ? label : `${label}: ${String(badgeCount)}`
      }
      accessibilityHint={hint}
      onPress={onPress}
      style={style}
    >
      <View style={TILE_TOP_ROW_STYLE}>
        <View style={createIconBadgeStyle(theme)}>
          <Icon name={iconName} size="navigation" color="brandInk" />
        </View>
        <CountBadge count={badgeCount ?? 0} />
      </View>
      <View style={createTileTextStyle(theme)}>
        <Text variant="bodyStrong">{label}</Text>
        <Text variant="caption" color="ink2">
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
        <Text variant="titleMd" color="onBrand">
          {label}
        </Text>
        <Text variant="caption" color="onBrand">
          {hint}
        </Text>
      </View>
      <Icon name="chevronRight" size="navigation" color="onBrand" />
    </Pressable>
  );
}
