import { Pressable } from 'react-native';

import { platformAccentColors } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { createAuthLinkStyle, type AuthLinkAlignment } from './AuthLinkButton.styles';

interface AuthLinkButtonProps {
  label: string;
  alignment: AuthLinkAlignment;
  onPress: () => void;
}

/** Enlace de texto blanco sobre el fondo de marca (recuperar contraseña, crear cuenta…). */
export function AuthLinkButton({
  label,
  alignment,
  onPress,
}: Readonly<AuthLinkButtonProps>): React.JSX.Element {
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={createAuthLinkStyle(alignment)}
    >
      <Text variant="bodyStrong" tintColor={platformAccentColors.icon}>
        {label}
      </Text>
    </Pressable>
  );
}
