import { Pressable } from 'react-native';

import { motionTokens, usePressableStyle, useTheme } from '@/shared/theme';
import { Icon } from '@/ui/atoms/Icon';

import { createBackButtonStyle } from './ScreenTemplate.styles';

interface ScreenBackButtonProps {
  accessibilityLabel: string;
  onPress: () => void;
}

/** Prototipo `.back`: círculo con aro y la flecha hacia la izquierda, antes del título. */
export function ScreenBackButton({
  accessibilityLabel,
  onPress,
}: Readonly<ScreenBackButtonProps>): React.JSX.Element {
  const theme = useTheme();
  const resolveStyle = usePressableStyle({
    baseStyle: createBackButtonStyle(theme),
    pressedScale: motionTokens.pressScaleIconButton,
    isEnabled: true,
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={resolveStyle}
    >
      <Icon name="chevronLeft" size="navigation" color="ink" />
    </Pressable>
  );
}
