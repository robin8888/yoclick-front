import { Pressable } from 'react-native';

import { useTheme } from '@/shared/theme';
import { CountBadge } from '@/ui/atoms/CountBadge';
import { Icon, type IconName } from '@/ui/atoms/Icon';

import { createHeaderIconButtonStyle } from './HeaderIconButton.styles';

interface HeaderIconButtonProps {
  iconName: IconName;
  /** Obligatoria: el botón no tiene texto visible. Con avisos incluye cuántos hay sin leer. */
  accessibilityLabel: string;
  onPress: () => void;
  /** Avisos sin leer; con 0 no se dibuja el círculo. */
  badgeCount?: number;
}

/** Botón redondo de la cabecera (escáner, avisos): fondo blanco y borde fino, con contador opcional. */
export function HeaderIconButton({
  iconName,
  accessibilityLabel,
  onPress,
  badgeCount = 0,
}: Readonly<HeaderIconButtonProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={createHeaderIconButtonStyle(theme)}
    >
      <Icon name={iconName} size="navigation" color="ink" />
      <CountBadge count={badgeCount} />
    </Pressable>
  );
}
