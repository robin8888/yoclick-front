import { Pressable } from 'react-native';

import { motionTokens, useTheme, usePressableStyle } from '@/shared/theme';

import { Text } from '../Text';
import { resolveButtonPresentation } from './Button.styles';
import type { ButtonProps } from './Button.types';
import { ButtonLeadingVisual } from './ButtonLeadingVisual';

export function Button(props: Readonly<ButtonProps>): React.JSX.Element {
  const { label, onPress, isLoading = false, isDisabled = false } = props;
  const theme = useTheme();
  const canPress = !isDisabled && !isLoading;
  const { style, contentColor } = resolveButtonPresentation({ ...props, theme, isDisabled });
  const resolveStyle = usePressableStyle({
    baseStyle: style,
    pressedScale: motionTokens.pressScaleButton,
    isEnabled: canPress,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityHint={props.accessibilityHint}
      accessibilityState={{ disabled: !canPress, busy: isLoading }}
      disabled={!canPress}
      onPress={onPress}
      style={resolveStyle}
    >
      <ButtonLeadingVisual
        isLoading={isLoading}
        iconName={props.leadingIconName}
        contentColor={contentColor}
      />
      <Text variant="bodyStrong" color={contentColor}>
        {label}
      </Text>
    </Pressable>
  );
}
