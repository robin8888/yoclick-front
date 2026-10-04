import { Pressable } from 'react-native';

import { motionTokens, useTheme, usePressableStyle } from '@/shared/theme';

import { Icon } from '../Icon';
import { createIconButtonStyle, resolveIconButtonColors } from './IconButton.styles';
import type { IconButtonProps } from './IconButton.types';

export function IconButton({
  iconName,
  accessibilityLabel,
  onPress,
  variant = 'plain',
  isDisabled = false,
}: Readonly<IconButtonProps>): React.JSX.Element {
  const theme = useTheme();
  const { backgroundColor, iconColor } = resolveIconButtonColors(theme, variant, isDisabled);
  const resolveStyle = usePressableStyle({
    baseStyle: createIconButtonStyle(theme, backgroundColor),
    pressedScale: motionTokens.pressScaleIconButton,
    isEnabled: !isDisabled,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={resolveStyle}
    >
      <Icon name={iconName} size="navigation" color={iconColor} />
    </Pressable>
  );
}
