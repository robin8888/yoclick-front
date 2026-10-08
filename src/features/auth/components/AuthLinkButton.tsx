import { Pressable } from 'react-native';

import { platformAccentColors } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { useHasPlatformLook } from './AuthBrandHeader';

import { createAuthLinkStyle, type AuthLinkAlignment } from './AuthLinkButton.styles';

interface AuthLinkButtonProps {
  label: string;
  alignment: AuthLinkAlignment;
  onPress: () => void;
}

/**
 * Enlace de texto sobre el fondo de la pantalla (recuperar contraseña, crear cuenta…): claro sobre
 * el degradado de Yoclick y del color de marca sobre el fondo claro de un centro.
 */
export function AuthLinkButton({
  label,
  alignment,
  onPress,
}: Readonly<AuthLinkButtonProps>): React.JSX.Element {
  const hasPlatformLook = useHasPlatformLook();

  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={createAuthLinkStyle(alignment)}
    >
      {hasPlatformLook ? (
        <Text variant="bodyStrong" tintColor={platformAccentColors.icon}>
          {label}
        </Text>
      ) : (
        <Text variant="bodyStrong" color="brandInk">
          {label}
        </Text>
      )}
    </Pressable>
  );
}
