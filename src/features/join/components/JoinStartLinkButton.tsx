import { Pressable } from 'react-native';

import { platformAccentColors, useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createLinkButtonStyle } from './JoinStartLinkButton.styles';

interface JoinStartLinkButtonProps {
  label: string;
  onPress: () => void;
}

/** Acción secundaria centrada, en el azul del logo y con letra grande. */
export function JoinStartLinkButton({
  label,
  onPress,
}: Readonly<JoinStartLinkButtonProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={createLinkButtonStyle(theme)}
    >
      <Text variant="titleMd" align="center" tintColor={platformAccentColors.icon}>
        {label}
      </Text>
    </Pressable>
  );
}
