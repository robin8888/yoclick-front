import { Pressable, View } from 'react-native';

import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Icon, type IconName } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import {
  createManagementIconPillStyle,
  createManagementRowStyle,
  createManagementVeilStyle,
  MANAGEMENT_ROW_TEXT_STYLE,
} from './ManagementActionRow.styles';

interface ManagementActionRowProps {
  iconName: IconName;
  label: string;
  hint: string;
  /** La acción que más se usa: rellena con el color de marca. */
  isFeatured?: boolean;
  onPress: () => void;
}

/** Una fila ancha de «Gestión»: icono en pastilla, qué crea, para qué sirve y una flecha. */
export function ManagementActionRow({
  iconName,
  label,
  hint,
  isFeatured = false,
  onPress,
}: Readonly<ManagementActionRowProps>): React.JSX.Element {
  const theme = useTheme();
  const rowStyle = usePressableStyle({
    baseStyle: createManagementRowStyle(theme, isFeatured),
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: true,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      style={rowStyle}
    >
      <View style={createManagementIconPillStyle(theme, isFeatured)}>
        {isFeatured ? <View style={createManagementVeilStyle(theme)} pointerEvents="none" /> : null}
        <Icon name={iconName} size="header" color={isFeatured ? 'onBrand' : 'brandInk'} />
      </View>
      <View style={MANAGEMENT_ROW_TEXT_STYLE}>
        <Text variant="titleMd" color={isFeatured ? 'onBrand' : 'ink'} numberOfLines={1}>
          {label}
        </Text>
        <Text variant="caption" color={isFeatured ? 'onBrand' : 'ink2'} numberOfLines={2}>
          {hint}
        </Text>
      </View>
      <Icon name="chevronRight" size="navigation" color={isFeatured ? 'onBrand' : 'ink2'} />
    </Pressable>
  );
}
