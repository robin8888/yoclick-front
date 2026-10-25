import type { ReactNode } from 'react';
import { View, type AccessibilityRole } from 'react-native';

import { useTheme } from '@/shared/theme';

import { createPanelStyle, type PanelTone } from './Panel.styles';

interface PanelProps {
  children: ReactNode;
  /** `warning` y `danger` marcan con un borde de color algo que pide atención (además del texto). */
  tone?: PanelTone;
  /** Si se da, el lector de pantalla lee la tarjeta entera como un solo elemento. */
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}

/**
 * La tarjeta de toda la zona de plataforma: mismo relleno, borde y radio en todas las pantallas.
 * Es una columna que ocupa el ancho disponible y nunca deja salir a un hijo de ella.
 */
export function Panel({
  children,
  tone = 'default',
  accessibilityLabel,
  accessibilityRole,
}: Readonly<PanelProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={createPanelStyle(theme, tone)}
      accessible={accessibilityLabel === undefined ? undefined : true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </View>
  );
}
